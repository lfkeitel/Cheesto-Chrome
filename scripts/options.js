// Saves options to chrome.storage
function save_options() {
  var address = document.getElementById('dan_address').value;
  var apikey = document.getElementById('dan_apikey').value;

  chrome.storage.sync.set({
    dandelionAdd: address,
    dandelionAPI: apikey
  }, function() {
    var status = document.getElementById('status');

    status.textContent = 'Options saved.';

    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    document.getElementById('dan_address').value = items.dandelionAdd;
    document.getElementById('dan_apikey').value = items.dandelionAPI;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);