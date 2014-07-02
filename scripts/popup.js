document.getElementById("test").addEventListener('click', main);

function main() {
  var background = chrome.extension.getBackgroundPage();
  background.loadSettings();
}

function displayCheesto(json) {
  console.log(json);
}