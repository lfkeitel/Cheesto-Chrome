chrome.webRequest.onErrorOccurred.addListener(webOnErrorOccured, {urls: ["http://*/*", "https://*/*"]});

function webOnErrorOccured(details) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {webError: details});
  });
}

function getStatus(addr, key) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", addr+"/api/cheesto/readall", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var popup = chrome.extension.getViews({type: "popup"})[0];
      popup.displayCheesto(JSON.parse(xhr.responseText));
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("apikey="+key);
}

function loadSettings() {
  chrome.storage.sync.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    getStatus(items.dandelionAdd, items.dandelionAPI);
  });
}