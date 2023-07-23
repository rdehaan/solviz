# Solviz: a Solver Visualizer

Solviz contains several web applications that visualize the behavior of a CDNL (conflict-driven nogood learning) solver for ASP (answer set programming) on encodings of various problems, illustrating the effect that the combination of solver and encoding has on the search behavior.

The core of Solviz is a [clingo](https://github.com/potassco/clingo) web application. That is, a clingo application that is compiled into (asynchronous) WebAssembly, with Javascript interface functions.

## Compilation

The easiest way to compile the clingo application to WebAssembly is the following.
- Download a copy of the source files of [clingo](https://github.com/potassco/clingo).
- Copy the files `main.cc` and `CMakeLists.txt` in the `src` directory of this repository to the `app/web` directory in the clingo source files (overwriting the files that are already there).
- Copy the files `clingocontrol.cc` in the `src` directory of this repository to the `libclingo/src` directory in the clingo source files (overwriting the files that are already there).
- Compile the application using the instructions under the heading 'Compilation to Javascript' in the file `INSTALL.md` in the clingo source files.

## Usage

In order to use the clingo WebAssembly application, you call the exported javascript function `ccall` as follows. Here `program` should contain the ASP program that you want the solver to run on, `options` should contain the options passed to the solver, and `watched_predicates` should contain a string with the predicate names (separated by spaces) for which you want the atoms to be watched (use "*" to watch all atoms in the program).

```
ccall('run', 'number', ['string', 'string', 'string'], [program, options, watched_predicates])
```

Moreover, the following Javascript functions should be implemented, as these will be called by the WebAssembly application.
- `interface_register_watch(lit, atom)`: will be called when an atom watch is registered; `lit` is an integer indicating the solver literal and `atom` is the string representation of the atom.
- `interface_propagate(lit)` will be called when an atom is propagated; `lit` is an integer indicating the solver literal.
- `interface_undo(lit)` will be called when an atom assignment is being undone; `lit` is an integer indicating the solver literal.
- `interface_decide(lit)` will be called when the solver makes a decision; `lit` is an integer indicating the solver literal.
- `interface_check(model)` will be called when a model is found; `model` represents the found model (restricted to the watched atoms), in the form of an array of strings each representing one of the atoms.
- `interface_start()` will be called before the solver starts the actual solving process.
- `interface_finish()` will be called after the solver is done with the actual solving process.
- `interface_wait_time_propagate()` should return an integer indicating the amount of ms that the solver should pause after each round of propagation.
- `interface_wait_time_undo()` should return an integer indicating the amount of ms that the solver should pause after each round of backtracking/backjumping.
- `interface_wait_time_check()` should return an integer indicating the amount of ms that the solver should pause after having found a model.
- `interface_wait_time_on_model()` should return an integer indicating the amount of ms that the solver should pause after having returned a model.
- `interface_wait_time_decide()` should return an integer indicating the amount of ms that the solver should pause after making a decision.

## Example

To see the working, there is an [example application](https://github.com/rdehaan/solviz-example/).
