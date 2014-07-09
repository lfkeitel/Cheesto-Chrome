chrome.webRequest.onErrorOccurred.addListener(webOnErrorOccured, {urls: ["http://*/*", "https://*/*"]});

var lastLogId = -1,
    newLogCount = 0,
    logMonitor;
    
var options = {};

function webOnErrorOccured(details) {
  "use strict";
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {webError: details});
  });
}

function loadSettings() {
  "use strict";
  
  chrome.storage.local.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    options.dAdd = items.dandelionAdd;
    options.dApi = items.dandelionAPI;
  });
}

function monitorLogs() {
  "use strict";
  
  var addr = options.dAdd;
  var key = options.dApi;
  
  $.getJSON(addr+"/api/logs/read", {"apikey": key, "limit": 1})
    .done(function(data) {
      if (lastLogId == -1) {
        lastLogId = data.data[0].logid;
      }
      else {
        if (data.data[0].logid > lastLogId) {
          newLogCount = data.data[0].logid - lastLogId;
          chrome.browserAction.setBadgeText({'text': newLogCount.toString()});
        }
      }
    
      logMonitor = setTimeout(function() { monitorLogs(); }, 30000);
    })
    .fail(function() {
      // If there's no response JSON (disabled API), check again in 10 minutes
      logMonitor = setTimeout(function() { monitorLogs(); }, 600000);
    });
}

function clearLogCount() {
  "use strict";
  
  clearTimeout(logMonitor);
  chrome.browserAction.setBadgeText({'text': ""});
  lastLogId = -1;
  newLogCount = 0;
  monitorLogs();
}

(function() {
  "use strict";
  
  loadSettings();
  // Allow time for the settings to be loaded
  setTimeout(function() { monitorLogs(); }, 1000);
})();
