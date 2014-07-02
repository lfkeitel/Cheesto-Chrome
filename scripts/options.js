document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
chrome.runtime.onMessage.addListener(function(request) { handleWebError(request.webError); });

function handleWebError(details) {
  if (details.error == "net::ERR_CONNECTION_REFUSED") {
    displayStatus('Error validating API key. Connection Refused');
  }
  else if (details.error == "net::ERR_NAME_NOT_RESOLVED") {
    displayStatus('Invalid hostname. Name Not Resolved');
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
          chrome.storage.sync.set({
            dandelionAdd: address,
            dandelionAPI: apikey
          }, function() {
            displayStatus('Options saved.')
          });
        }
        else if (result.errorcode == 1) {
            displayStatus('API key is invalid');
        }
      }
      else if (xhr.status == 404) {
        displayStatus('Error validating API key. File Not Found');
      }
      else {
        displayStatus('Error: ' + xhr.statusText);
      }
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("apikey="+apikey);
}

function displayStatus(message) {
  var status = document.getElementById('status');

  status.textContent = message;

  setTimeout(function() {
    status.textContent = '';
  }, 5000);
}

function restore_options() {
  chrome.storage.sync.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    document.getElementById('dan_address').value = items.dandelionAdd;
    document.getElementById('dan_apikey').value = items.dandelionAPI;
  });
}