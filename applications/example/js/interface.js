// This file is released under the MIT license.
// See LICENSE.md.

var log = "";
var logElement = document.getElementById('log');

function interface_register_watch(lit, atom) {
  addToLog("Interface: registered watch " + atom + " (literal: " + lit + ")");
}
function interface_propagate(lit, atom) {
  addToLog("Interface: propagate " + atom + " (literal: " + lit + ")");
}
function interface_undo(lit, atom) {
  addToLog("Interface: undo " + atom + " (literal: " + lit + ")");
}
function interface_decide() {
  addToLog("Interface: decide");
}
function interface_check(model) {
  addToLog("Interface: check; model: " + model);
  updateOutput();
  if (document.getElementById("pause-on-model").checked) {
    do_pause();
  }
}
function interface_on_model() {
  addToLog("Interface: on_model");
}
function watched_predicates() {
  return "*";
}
function interface_start() {
  addToLog("Interface: start");
  document.getElementById("run").disabled = true;
  document.getElementById("pause").disabled = false;
  do_resume();
}
function interface_finish() {
  addToLog("Interface: finish");
  document.getElementById("run").disabled = false;
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
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

function clearLog() {
  log = "";
  updateLog();
}

function addToLog(text) {
  log = text + "\n" + log;
  updateLog();
}

function updateLog() {
  if (logElement) {
    logElement.textContent = log;
    // logElement.scrollTop = logElement.scrollHeight; // focus on bottom
  }
}

clearLog();
addToLog("Ready...");
