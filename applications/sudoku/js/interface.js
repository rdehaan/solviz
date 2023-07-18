// This file is released under the MIT license.
// See LICENSE.md.

function interface_register_watch(lit, atom) {
  console.log("Interface: registered watch " + atom + " (" + lit + ")");
}
function interface_propagate(lit, atom) {
  console.log("Interface: propagate " + atom + " (" + lit + ")");
  atom_obj = parse_sudoku_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    sudoku_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
  } else if (atom_obj != null && !atom_obj.positive) {
    sudoku_remove_candidate(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  sudoku_render_board();
}
function interface_undo(lit, atom) {
  console.log("Interface: undo " + atom + " (" + lit + ")");
  atom_obj = parse_sudoku_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    sudoku_set_cell_value(atom_obj.i, atom_obj.j, null);
  } else if (atom_obj != null && !atom_obj.positive) {
    sudoku_add_candidate(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  sudoku_render_board();
}
function interface_decide() {
  console.log("Interface: decide");
}
function interface_check(model) {
  console.log("Interface: check " + model);
  updateOutput();
  if (document.getElementById("pause-on-model").checked) {
    do_pause();
  }
}
function interface_on_model() {
  console.log("Interface: on_model");
}
// function interface_on_unsat() {
//   console.log("Interface: on_unsat");
// }
// function interface_on_finish() {
//   console.log("Interface: on_finish");
// }
function interface_before_start() {
  console.log("Interface: before start");
  sudoku_initialize_candidates();
  sudoku_render_board();
  hidden_program = "";
  for (var i=0; i < board_size; i++) {
    for (var j=0; j < board_size; j++) {
      val = sudoku_get_cell_value(i,j);
      if (val != null) {
        hidden_program += "solution("+(i+1)+","+(j+1)+","+val+").\n"
      }
    }
  }
}
function watched_predicates() {
  return "solution";
}
function interface_start() {
  console.log("Interface: start");
  document.getElementById("run").disabled = true;
  document.getElementById("pause").disabled = false;
  board_blocked = true;
  do_resume();
}
function interface_finish() {
  console.log("Interface: finish");
  document.getElementById("run").disabled = false;
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
  board_blocked = false;
  updateOutput();
  speed_factor = document.getElementById("speed").value;
  setTimeout(function() {
    updateOutput();
  }, speed_factor*500);
  setTimeout(function() {
    updateOutput();
  }, speed_factor*1000);
}
function interface_wait_time_propagate() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_undo() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_check() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*2000;
}
function interface_wait_time_on_model() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*0;
}
function interface_wait_time_decide() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*500;
}
function parse_sudoku_atom(atom) {
  if (atom.startsWith("solution(")) {
    i = atom[9];
    j = atom[11];
    v = parseInt(atom[13]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      positive: true,
    }
  } else if (atom.startsWith("-solution(")) {
    i = atom[10];
    j = atom[12];
    v = parseInt(atom[14]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      positive: false,
    }
  } else {
    return null;
  }
}
function load_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_input = document.getElementById("sudoku-input").value;
    sudoku_load_from_string(sudoku_input);
    sudoku_render_board();
  }
}
function clear_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_render_board();
  }
}
function load_example_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_as_string = document.getElementById("example-sudokus").value;
    sudoku_load_from_string(sudoku_as_string);
    sudoku_render_board();
  }
}

Module.can_resume = true;
function do_pause() {
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = false;
  Module.can_resume = false;
}
function do_resume() {
  document.getElementById("pause").disabled = false;
  document.getElementById("resume").disabled = true;
  Module.can_resume = true;
}

sudoku_initialize_board();
sudoku_render_board();
board_blocked = false;
load_example_from_path("examples/simple1.lp");
