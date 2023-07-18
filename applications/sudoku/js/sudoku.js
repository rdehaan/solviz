// This file is released under the MIT license.
// See LICENSE.md.
//
// The code in this file was inspired by:
// https://github.com/pocketjoso/sudokuJS

function sudoku_initialize_board() {
	board = Array()
	rendered_board = ""
	board_size = 9;
	for(var j=0; j < board_size*board_size ; j++){
		board[j] = {
			val: null,
			candidates: []
		};
	}
};

function sudoku_initialize_candidates() {
	for(var j=0; j < board_size*board_size ; j++){
		if (board[j].val === null) {
			board[j].candidates = [1,2,3,4,5,6,7,8,9];
		}
	}
};

function sudoku_render_candidates(candidates){
	var s="";
	for(var i=1; i<board_size+1; i++){
		if(candidates.includes(i))
			s+= "<div>"+i+"</div> ";
		else
			s+= "<div>&nbsp;</div> ";
	}
	return s;
};

function sudoku_render_cell(cell, id){
	var val = (cell.val === null) ? "" : cell.val;
	var candidates = cell.candidates || [];
	var candidates_rendered = sudoku_render_candidates(candidates);
	return "<div class='sudoku-board-cell'>" +
				"<input type='text' pattern='\\d*' novalidate id='input-"+id+"' value='"+val+"' disabled>" +
				"<div id='input-"+id+"-candidates' class='candidates'>" + ((cell.val === null) ? candidates_rendered : "") + "</div>" +
				"</div>";
};

function sudoku_render_board() {
	var htmlString = "";
	for(var i=0; i < board_size*board_size; i++){
		htmlString += sudoku_render_cell(board[i], i);
		if((i+1) % board_size === 0) {
			htmlString += "<br>";
		}
	}
	var board_elem = document.getElementById('sudoku');
	board_elem.innerHTML = htmlString;
}

function sudoku_set_cell_value() {
	if (arguments.length == 2) {
		cell = arguments[0];
		val = arguments[1];
	} else if (arguments.length == 3) {
		cell = arguments[0]*board_size + arguments[1];
		val = arguments[2];
	}
	board[cell].val = val;
}

function sudoku_get_cell_value() {
	if (arguments.length == 1) {
		cell = arguments[0];
	} else if (arguments.length == 2) {
		cell = arguments[0]*board_size + arguments[1];
	}
	return board[cell].val;
}

function sudoku_add_candidate() {
	if (arguments.length == 2) {
		cell = arguments[0];
		candidate = parseInt(arguments[1]);
	} else if (arguments.length == 3) {
		cell = arguments[0]*board_size + arguments[1];
		candidate = parseInt(arguments[2]);
	}
	if (!board[cell].candidates.includes(candidate)) {
		board[cell].candidates.push(parseInt(candidate));
	}
}

function sudoku_remove_candidate() {
	if (arguments.length == 2) {
		cell = arguments[0];
		candidate = parseInt(arguments[1]);
	} else if (arguments.length == 3) {
		cell = arguments[0]*board_size + arguments[1];
		candidate = parseInt(arguments[2]);
	}
	if (board[cell].candidates.includes(candidate)) {
		var index = board[cell].candidates.indexOf(candidate);
	  if (index > -1) {
  		board[cell].candidates.splice(index, 1);
  	}
	}
}

function sudoku_clear_board() {
	for(var i=0; i < board_size*board_size; i++){
		sudoku_set_cell_value(i,null);
	}
}

function sudoku_load_from_string(sudoku_as_string) {
	sudoku_clear_board();
	for (var i=0; i < board_size*board_size && i < sudoku_as_string.length; i++){
		if (sudoku_as_string[i] >= '1' && sudoku_as_string[i] <= '9') {
			sudoku_set_cell_value(i,sudoku_as_string[i]);
		}
	}
}
