document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
chrome.runtime.onMessage.addListener(function(request) { handleWebError(request.webError); });

function handleWebError(details) {
  "use strict";

  if (details.error == "net::ERR_CONNECTION_REFUSED") {
    displayStatus('Error validating API key. Connection Refused', 'red');
  }
  else if (details.error == "net::ERR_NAME_NOT_RESOLVED") {
    displayStatus('Invalid hostname. Name Not Resolved', 'red');
  }
  else {
    displayStatus('Error: ' + details.error, 'red');
  }
}

function save_options() {
  "use strict";

  var address = document.getElementById('dan_address').value;
  var apikey = document.getElementById('dan_apikey').value;

  // Trim trailing slashes and spaces from web address
  address = address.replace(/[\s/]+$/, '');
  // Trim trailing whitespace from api key
  apikey = apikey.replace(/\s+$/, '');

  // Display modified strings back to user
  document.getElementById('dan_address').value = address;
  document.getElementById('dan_apikey').value = apikey;

  $.getJSON(address+"/api/apitest", {"apikey": apikey})
    .done(function(data) {
      if (data.errorcode === 0) {
        storeSettings(address, apikey, '5');
      } else {
        $.getJSON(address+"/api/key/test", {"apikey": apikey})
          .done(function(data) {
            if (data.errorcode === 0) {
              storeSettings(address, apikey, '6');
            } else {
              displayStatus('Error validating API key. Check the key and path and try again', 'red');
            }
        });
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
  "use strict";

  classColor = typeof classColor !== 'undefined' ? classColor : '';
  var status = document.getElementById('status');

  status.innerHTML = message;
  status.className = classColor;

  setTimeout(function() {
    status.textContent = '';
    status.className = '';
  }, 5000);
}

function restore_options() {
  "use strict";

  chrome.storage.local.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    document.getElementById('dan_address').value = items.dandelionAdd;
    document.getElementById('dan_apikey').value = items.dandelionAPI;
  });
}
