document.getElementById("test").addEventListener('click', loadSettings);

function getStatus(addr, key) {
  console.log(addr + " : " + key);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", addr+"/api/cheesto/readall", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      formatJSON(xhr.responseText);
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send("apikey="+key);
}

function loadSettings() {
  chrome.storage.sync.get({
    dandelionAdd: '',
    dandelionAPI: ''
  }, function(items) {
    getStatus(items.dandelionAdd, items.dandelionAPI);
  });
}

function formatJSON(data) {
  console.log(JSON.parse(data));
}