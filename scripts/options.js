document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
chrome.runtime.onMessage.addListener(function(request) { handleWebError(request.webError); });

function handleWebError(details) {
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
  var address = document.getElementById('dan_address').value;
  var apikey = document.getElementById('dan_apikey').value;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", address+"/api/apitest", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        result = JSON.parse(xhr.responseText);

        if (result.errorcode == 0) {
          chrome.storage.local.set({
            dandelionAdd: address,
            dandelionAPI: apikey
          }, function() {
            displayStatus('Options saved.')
          });
        }
        else if (result.errorcode == 1) {
            displayStatus('API key is invalid', 'red');
        }
      }
      else if (xhr.status == 404) {
        displayStatus('Error validating API key. File Not Found.<br>\
          Is the path correct? Are you using Dandelion version 5+?', 'red');
      }
      else {
        displayStatus('Error: ' + xhr.statusText, 'red');
      }
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("apikey="+apikey);
}

function displayStatus(message, classColor) {
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
  chrome.storage.local.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    document.getElementById('dan_address').value = items.dandelionAdd;
    document.getElementById('dan_apikey').value = items.dandelionAPI;
  });
}