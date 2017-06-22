(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', restore_options);
  $('#save').click(save_options);
  chrome.runtime.onMessage.addListener(function(request) { handleWebError(request.webError); });

  function handleWebError(details) {
    if (details.error == "net::ERR_CONNECTION_REFUSED") {
      displayStatus('Error validating API key. Connection Refused', 'red');
    } else if (details.error == "net::ERR_NAME_NOT_RESOLVED") {
      displayStatus('Invalid hostname. Name Not Resolved', 'red');
    } else {
      displayStatus('Error: ' + details.error, 'red');
    }
  }

  function save_options() {
    var address = $('#dan_address').val();
    var apikey = $('#dan_apikey').val();

    // Trim trailing slashes and spaces from web address
    address = address.replace(/[\s/]+$/, '');
    // Trim trailing whitespace from api key
    apikey = apikey.replace(/\s+$/, '');

    // Display modified strings back to user
    $('#dan_address').val(address);
    $('#dan_apikey').val(apikey);

    // First test for version 6
    $.getJSON(address + "/api/key/test", { "apikey": apikey })
      .done(function(data) {
        if (data.errorcode === 0) {
          storeSettings(address, apikey, 6);
        } else {
          displayStatus('Error validating API key. Make sure you have the right path and key and that Dandelion is version 6 or newer.', 'red');
        }
      });
  }

  function storeSettings(address, apikey, version) {
    chrome.storage.local.set({
      dandelionAdd: address,
      dandelionAPI: apikey,
      dandelionVer: version
    }, function() {
      var background = chrome.extension.getBackgroundPage();
      background.loadSettings();
      displayStatus('Options saved.');
    });
  }

  function displayStatus(message, classColor) {
    classColor = typeof classColor !== 'undefined' ? classColor : '';
    var status = $('#status');

    status.html(message);
    status.addClass(classColor);

    setTimeout(function() {
      status.html('');
      status.removeClass(classColor);
    }, 5000);
  }

  function restore_options() {
    chrome.storage.local.get({
      dandelionAdd: '',
      dandelionAPI: ''
    }, function(items) {
      $('#dan_address').val(items.dandelionAdd);
      $('#dan_apikey').val(items.dandelionAPI);
    });
  }

})();
