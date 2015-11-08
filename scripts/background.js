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

function loadSettings(callback) {
  "use strict";

  chrome.storage.local.get({
    dandelionAdd: '',
    dandelionAPI: '',
    dandelionVer: ''
  }, function(items) {
    options.dAdd = items.dandelionAdd;
    options.dApi = items.dandelionAPI;
    options.dVer = items.dandelionVer;
    callback();
  });
}

function monitorLogs() {
  "use strict";

  var addr = options.dAdd;
  var key = options.dApi;
  var ver = options.dVer;

  $.getJSON(addr+"/api/logs/read", {"apikey": key, "limit": 1})
    .done(function(data) {
        var field = "id";
        if (ver === 5) {
            field = "logid";
        }

        if (lastLogId == -1) {
          lastLogId = data.data[0][field];
        } else {
          if (data.data[0][field] > lastLogId) {
            newLogCount = data.data[0][field] - lastLogId;
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

  loadSettings(monitorLogs);
})();
