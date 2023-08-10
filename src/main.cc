// {{{ MIT License

// Copyright 2017 Roland Kaminski
// Copyright 2023 Ronald de Haan

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// }}}

#ifdef CLINGO_WITH_LUA
#   include <luaclingo.h>
#endif
#include "clingo/clingo_app.hh"
#include "clingo/scripts.hh"
#include <clingo.hh>
#include <iterator>
#include <emscripten.h>

#include <string>
#include <cstring>
#include <cstdio>
#include <map>

#define CLINGO_TRY try // NOLINT
#define CLINGO_CATCH catch (...){ Clingo::Detail::handle_cxx_error(); return false; } return true // NOLINT

EM_JS(bool, check_if_can_resume, (), {
  return Module.can_resume;
});

void wait_for_resume() {
  while (!check_if_can_resume()) {
    emscripten_sleep(100);
  }
}

class JSPropagator : public Clingo::Heuristic {

    std::vector<std::string> watched_predicates_;
    bool watch_all_predicates_;

public:

    JSPropagator(std::vector<std::string> watched_predicates) {
        watched_predicates_ = watched_predicates;
        watch_all_predicates_ = (std::find(watched_predicates_.begin(), watched_predicates_.end(), "*") != watched_predicates_.end());
    }

    void init(Clingo::PropagateInit &init) override;
    void propagate(Clingo::PropagateControl &ctl, Clingo::LiteralSpan changes) override;
    void undo(Clingo::PropagateControl const &ctl, Clingo::LiteralSpan changes) noexcept override;
    void check(Clingo::PropagateControl &ctl) override;
    Clingo::literal_t decide(Clingo::id_t thread_id, Clingo::Assignment const &assign, Clingo::literal_t) override;
};

void JSPropagator::init(Clingo::PropagateInit &init) {
    for (auto &&a : init.symbolic_atoms()) {
        if (watch_all_predicates_ || std::find(watched_predicates_.begin(), watched_predicates_.end(), a.symbol().name()) != watched_predicates_.end()) {
            int lit = init.solver_literal(a.literal());
            std::string atom = a.symbol().to_string();
            init.add_watch(lit);
            init.add_watch(-lit);

            std::string jscommand = "interface_register_watch(" + std::to_string(lit) + ",'" + atom + "');";
            emscripten_run_script(jscommand.c_str());
        }
    }
    return;
}

EM_JS(int, get_wait_time_propagate, (), {
  return interface_wait_time_propagate();
});

void JSPropagator::propagate(Clingo::PropagateControl &ctl, Clingo::LiteralSpan changes) {
    for (auto &&l : changes) {
        std::string jscommand = "interface_propagate(" + std::to_string(l) + ");";
        emscripten_run_script(jscommand.c_str());
    }

    emscripten_sleep(get_wait_time_propagate());
    wait_for_resume();

    return;
}

EM_JS(int, get_wait_time_undo, (), {
  return interface_wait_time_undo();
});

void JSPropagator::undo(Clingo::PropagateControl const &ctl, Clingo::LiteralSpan changes) noexcept {
    for (auto &&l : changes) {
        std::string jscommand = "interface_undo(" + std::to_string(l) + ");";
        emscripten_run_script(jscommand.c_str());
    }

    emscripten_sleep(get_wait_time_undo());
    wait_for_resume();

    return;
}

EM_JS(int, get_wait_time_check, (), {
  return interface_wait_time_check();
});

void JSPropagator::check(Clingo::PropagateControl &ctl) {
    std::string jscommand = "interface_check([";
    for (auto &&l : ctl.assignment()) {
        if (ctl.assignment().is_true(l)) {
            jscommand += "'" + std::to_string(l) + "',";
        } else {
            jscommand += "'-" + std::to_string(l) + "',";
        }
    }
    jscommand.pop_back(); // remove last comma
    jscommand += "]);";
    emscripten_run_script(jscommand.c_str());

    emscripten_sleep(get_wait_time_check());
    wait_for_resume();

    return;
}

EM_JS(int, get_wait_time_decide, (), {
  return interface_wait_time_decide();
});

Clingo::literal_t JSPropagator::decide(Clingo::id_t thread_id, Clingo::Assignment const &assign, Clingo::literal_t) {
    emscripten_sleep(get_wait_time_decide());
    wait_for_resume();

    return 0; // make no decision
}

class JSSolveEventHandler : public Clingo::SolveEventHandler {
    bool on_model(Clingo::Model &model) override;
    // void on_unsat(Clingo::Span<int64_t> lower_bound) override;
};

EM_JS(int, get_wait_time_on_model, (), {
  return interface_wait_time_on_model();
});

bool JSSolveEventHandler::on_model(Clingo::Model &model) {
    std::string jscommand = "interface_on_model();";
    // TODO: add actual model to JS call
    emscripten_run_script(jscommand.c_str());

    emscripten_sleep(get_wait_time_on_model());
    wait_for_resume();

    return true;
}
// void JSSolveEventHandler::on_unsat(Clingo::Span<int64_t> lower_bound) {
//     std::string jscommand = "interface_on_unsat();";
//     emscripten_run_script(jscommand.c_str());
//     return;
// }

class ExitException : public std::exception {
public:
    ExitException(int status) : status_(status) {
        std::ostringstream oss;
        oss << "exited with status: " << status_;
        msg_ = oss.str();
    }
    int status() const { return status_; }
    char const *what() const noexcept { return msg_.c_str(); }
    ~ExitException() = default;
private:
    std::string msg_;
    int status_;
};

class JSApplication : Clingo::Application {

    std::vector<std::string> watched_predicates_;

public:

    JSApplication(std::vector<std::string> watched_predicates) {
        watched_predicates_ = watched_predicates;
    }

    static int run(int argc, char **argv, std::vector<std::string> watched_predicates) {
        JSApplication jsapp(watched_predicates);
        return Clingo::clingo_main(jsapp, {argv+1, argv+argc});
    }

private:
    void main(Clingo::Control &ctl, Clingo::StringSpan files) override {
        for (auto &&file : files) {
            ctl.load(file);
        }
        if (files.empty()) { ctl.load("-"); }
        JSPropagator prop(watched_predicates_);
        ctl.register_propagator(prop, true);
        ctl.ground({{"base", {}}});
        emscripten_run_script("interface_start();");
        JSSolveEventHandler jsseh;
        ctl.solve(Clingo::LiteralSpan{}, &jsseh, false, false).get();
        int num_conflicts_analyzed = ctl.statistics()["solving"]["solvers"]["conflicts_analyzed"];
        std::string jscommand = "num_learned_nogoods = " + std::to_string(num_conflicts_analyzed) + ";";
        emscripten_run_script(jscommand.c_str());
        emscripten_run_script("interface_finish();");
    }
};

extern "C" int run(char const *program, char const *options, char const *watched_predicates) {
    try {
#ifdef CLINGO_WITH_LUA
        Gringo::g_scripts() = Gringo::Scripts();
        clingo_register_lua_(nullptr);
#endif
        std::streambuf* orig = std::cin.rdbuf();
        auto exit(Gringo::onExit([orig]{ std::cin.rdbuf(orig); }));
        std::istringstream input(program);
        std::cin.rdbuf(input.rdbuf());
        std::vector<std::vector<char>> opts;
        opts.emplace_back(std::initializer_list<char>{'c','l','i','n','g','o','\0'});
        std::istringstream iss(options);
        for (std::istream_iterator<std::string> it(iss), ie; it != ie; ++it) {
            opts.emplace_back(it->c_str(), it->c_str() + it->size() + 1);
        }
        std::vector<char*> args;
        for (auto &opt : opts) {
            args.emplace_back(opt.data());
        }
        args.emplace_back(nullptr);

        std::vector<std::vector<char>> preds_vc_vec;
        std::istringstream preds_iss(watched_predicates);
        for (std::istream_iterator<std::string> it(preds_iss), ie; it != ie; ++it) {
            preds_vc_vec.emplace_back(it->c_str(), it->c_str() + it->size() + 1);
        }
        std::vector<std::string> preds_str_vec;
        for (auto &pred : preds_vc_vec) {
            preds_str_vec.emplace_back(pred.data());
        }
        preds_str_vec.emplace_back(nullptr);

        return JSApplication::run(args.size()-1, args.data(), preds_str_vec);
    }
    catch (ExitException const &e) {
        return e.status();
    }
}

#undef CLINGO_TRY
#undef CLINGO_CATCH
