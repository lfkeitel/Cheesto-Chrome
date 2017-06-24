(function() {
  "use strict";
  chrome.webRequest.onErrorOccurred.addListener(webOnErrorOccured, { urls: ["http://*/*", "https://*/*"] });

  var lastLogId = -1,
    newLogCount = 0,
    logMonitor;

  var options = {};

  function webOnErrorOccured(details) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { webError: details });
    });
  }

  function loadSettings(callback) {
    chrome.storage.local.get({
      dandelionAdd: '',
      dandelionAPI: '',
      dandelionVer: 6,
      dandelionLogNum: 5
    }, function(items) {
      options.dAdd = items.dandelionAdd;
      options.dApi = items.dandelionAPI;
      options.dVer = items.dandelionVer;
      options.dLogNum = items.dandelionLogNum;
      callback();
    });
  }

  function monitorLogs() {
    var addr = options.dAdd;
    var key = options.dApi;

    $.getJSON(addr + "/api/logs/read", { "apikey": key, "limit": 1 })
      .done(function(data) {
        var field = "id";
        if (lastLogId == -1) {
          lastLogId = data.data[0][field];
        } else {
          if (data.data[0][field] > lastLogId) {
            newLogCount++;
            lastLogId = data.data[0][field];
            chrome.browserAction.setBadgeText({ 'text': newLogCount.toString() });
          }
        }

        logMonitor = setTimeout(function() { monitorLogs(); }, 10000);
      })
      .fail(function() {
        // If there's no response JSON (disabled API), check again in 10 minutes
        logMonitor = setTimeout(function() { monitorLogs(); }, 600000);
      });
  }

  function clearLogCount() {
    clearTimeout(logMonitor);
    chrome.browserAction.setBadgeText({ 'text': "" });
    newLogCount = 0;
    monitorLogs();
  }

  function getNewLogCount() {
    return newLogCount;
  }

  function goToDandelion() {
    window.open(options.dAdd, "_blank");
  }

  function goToNewLog() {
    window.open(`${options.dAdd}/log/new`, "_blank");
  }

  function addContextMenuItems() {
    chrome.contextMenus.create({
      contexts: ['browser_action'],
      onclick: goToNewLog,
      title: "New Log Entry"
    });

    chrome.contextMenus.create({
      contexts: ['browser_action'],
      onclick: goToDandelion,
      title: "Go to Dandelion"
    });

    chrome.contextMenus.create({
      contexts: ['browser_action'],
      onclick: clearLogCount,
      title: "Clear log count"
    });
  }

  loadSettings(monitorLogs);
  addContextMenuItems();

  // Export functions and variables
  window.options = options;
  window.newLogCount = getNewLogCount;
  window.clearLogCount = clearLogCount;
  window.loadSettings = loadSettings;
})();
