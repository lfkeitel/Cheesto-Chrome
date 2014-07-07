chrome.webRequest.onErrorOccurred.addListener(webOnErrorOccured, {urls: ["http://*/*", "https://*/*"]});

var lastLogId = -1,
    newLogCount = 0,
    logMonitor;
    
var options = {};

function webOnErrorOccured(details) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {webError: details});
  });
}

function loadSettings() {
  chrome.storage.local.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    options['dAdd'] = items.dandelionAdd;
    options['dApi'] = items.dandelionAPI;
  });
}

function getStatus(addr, key) {
  addr = options.dAdd;
  key = options.dApi;
  
  $.getJSON(addr+"/api/cheesto/readall", {"apikey": key})
    .done(function(data) {
      var popup = chrome.extension.getViews({type: "popup"})[0];
      popup.displayCheesto(data);
    })
    .fail(function(data) {
      if (data['status'] == 200) {
        var popup = chrome.extension.getViews({type: "popup"})[0];
        popup.displayAPIError();
      }
    });
}

function monitorLogs() {
  addr = options.dAdd;
  key = options.dApi;
  
  $.getJSON(addr+"/api/logs/read", {"apikey": key, "limit": 1})
    .done(function(data) {
      if (lastLogId == -1) {
        lastLogId = data['data'][0]['logid'];
      }
      else {
        if (data['data'][0]['logid'] > lastLogId) {
          newLogCount = data['data'][0]['logid'] - lastLogId;
          chrome.browserAction.setBadgeText({'text': newLogCount.toString()});
        }
      }
    
      logMonitor = setTimeout(function() { monitorLogs(); }, 30000);
    })
    .fail(function() {
      // If there's no response JSON (disabled API), check again in 2 minutes
      logMonitor = setTimeout(function() { monitorLogs(); }, 120000);
    });
}

function clearLogCount() {
  clearTimeout(logMonitor);
  chrome.browserAction.setBadgeText({'text': ""});
  lastLogId = -1;
  newLogCount = 0;
  monitorLogs();
}

(function() {
  loadSettings();
  // Allow time for the settings to be loaded
  setTimeout(function() { monitorLogs(); }, 1000);
})();
