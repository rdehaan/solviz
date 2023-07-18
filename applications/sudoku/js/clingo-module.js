// This file is released under the MIT license.
// See LICENSE.md.
//
// The code in this file is taken (in modified form) from:
// https://github.com/potassco/potassco.github.io

var Clingo = {};
var outputElement = document.getElementById('output');
var runButton = document.getElementById('run');
var input = ace.edit("input");
var ex = document.getElementById("examples");
var output = "";

input.setTheme("ace/theme/textmate");
input.$blockScrolling = Infinity;
input.setOptions({
  useSoftTabs: true,
  tabSize: 2,
  maxLines: Infinity,
  mode: "ace/mode/gringo",
  autoScrollEditorIntoView: true
});

function load_example() {
  load_example_from_path(ex.value);
}

function load_example_from_path(path) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      input.setValue(request.responseText.trim(), -1);
    }
  }
  request.open("GET", path, true);
  request.send();
}

function solve() {
  interface_before_start();
  options = "--heuristic=Domain";
  var index = document.getElementById("mode").selectedIndex;
  if (index >= 0) {
    if (index == 1) {
      options += " --opt-mode=optN 0";
    }
  }
  output = "";
  Clingo.ccall('run', 'number', ['string', 'string', 'string'], [input.getValue() + hidden_program, options, watched_predicates()])
  updateOutput();
}

function clearOutput() {
  output = "";
  updateOutput();
}

function updateOutput() {
  if (outputElement) {
    outputElement.textContent = output;
    outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
  }
}

Clingo = {
  preRun: [],
  postRun: [],
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      output += text + "\n";
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (text == "Calling stub instead of signal()") { return; }
    var prefix = "pre-main prep time: ";
    if (typeof text=="string" && prefix == text.slice(0, prefix.length)) { text = "Ready to go!" }
    output += text + "\n";
    updateOutput();
  },
  setStatus: function(text) {
    if (text == "") { runButton.disabled = false; }
    else {
      output += text + "\n";
      updateOutput();
    }
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Clingo.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  }
};
Clingo.setStatus('Downloading...');
window.onerror = function(event) {
  Clingo.setStatus('Exception thrown, see JavaScript console');
};

// Initialize Emscripten Module
Module = Module(Clingo);

var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

if (QueryString.example !== undefined) {
  ex.value = "/clingo/run/examples/" + QueryString.example;
  load_example("/clingo/run/examples/" + QueryString.example);
}

hidden_program = "";
