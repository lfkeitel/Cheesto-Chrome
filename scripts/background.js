(function() {
  'use strict';

  var lastLogId = -1;
  var newLogCount = 0;
  var logMonitor;
  var options = {};

  const monitorTimeout = 10000;
  const monitorFailedTimeout = 600000;

  function loadSettings(callback) {
    chrome.storage.local.get({
      dandelionAdd: '',
      dandelionAPI: '',
      dandelionVer: 6,
      dandelionLogNum: 5,
      dandelionTabDefault: 'dynamic',
      dandelionFilterMine: false
    }, function(items) {
      options.hostname = items.dandelionAdd;
      options.apikey = items.dandelionAPI;
      options.version = items.dandelionVer;
      options.logLimit = items.dandelionLogNum;
      options.tabDefault = items.dandelionTabDefault;
      options.filterMine = items.dandelionFilterMine;

      $.getJSON(options.hostname + '/api/users/getuser', {'apikey': options.apikey})
        .done(function(json) {
          var data = json.data;
          options.username = data[0].fullname;

          if (typeof callback === 'function') {
            callback();
          }
        })
        .fail(function() { });
    });
  }

  function monitorLogs() {
    if (lastLogId === -1) {
      getFirstID();
      return;
    }

    $.getJSON(options.hostname + '/api/logs/read', {'apikey': options.apikey, 'limit': 10})
      .done(function(json) {
        var data = json.data;

        if (data.metadata.resultCount > 0 && data[0].id > lastLogId) {
          for (var i = 0; i < data.metadata.resultCount; i++) {
            if (options.filterMine && data[i].fullname === options.username) {
              continue;
            }

            if (data[i].id <= lastLogId) {
              break;
            }
            newLogCount++;
          }

          lastLogId = parseInt(data[0]['id']);
          if (newLogCount > 0) {
            chrome.browserAction.setBadgeText({ 'text': newLogCount.toString() });
          }
        }

        logMonitor = setTimeout(function() { monitorLogs(); }, monitorTimeout);
      })
      .fail(function() {
        // If there's no response JSON (disabled API), check again in 10 minutes
        logMonitor = setTimeout(function() { monitorLogs(); }, monitorFailedTimeout);
      });
  }

  function getFirstID() {
    $.getJSON(options.hostname + '/api/logs/read', { 'apikey': options.apikey, 'limit': 1 })
      .done(function(json) {
        var data = json.data;
        if (data.metadata.resultCount === 0) {
          lastLogId = 0;
        } else {
          lastLogId = parseInt(data[0]['id']);
        }

        logMonitor = setTimeout(function() { monitorLogs(); }, monitorTimeout);
      })
      .fail(function() {
        // If there's no response JSON (disabled API), check again in 10 minutes
        logMonitor = setTimeout(function() { monitorLogs(); }, monitorFailedTimeout);
      });
  }

  function clearLogCount() {
    clearTimeout(logMonitor);
    chrome.browserAction.setBadgeText({ 'text': '' });
    newLogCount = 0;
    monitorLogs();
  }

  function getNewLogCount() {
    return newLogCount;
  }

  function goToDandelion() {
    chrome.tabs.create({
      active: true,
      url: options.hostname
    });
  }

  function goToNewLog() {
    chrome.tabs.create({
      active: true,
      url: `${options.hostname}/log/new`
    });
  }

  function addContextMenuItems() {
    const newLogMenuID = chrome.contextMenus.create({
      contexts: ['browser_action'],
      title: 'New Log Entry'
    });

    const goToDandelionMenuID = chrome.contextMenus.create({
      contexts: ['browser_action'],
      title: 'Go to Dandelion'
    });

    const clearLogMenuID = chrome.contextMenus.create({
      contexts: ['browser_action'],
      title: 'Clear log count'
    });

    chrome.contextMenus.onClicked.addListener(function(info, tab) {
      switch (info.menuItemId) {
        case newLogMenuID:
          goToNewLog();
          break;
        case goToDandelionMenuID:
          goToDandelion();
          break;
        case clearLogMenuID:
          clearLogCount();
          break;
      }
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
