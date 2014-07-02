document.addEventListener('DOMContentLoaded', main);

function main() {
  var background = chrome.extension.getBackgroundPage();
  background.loadSettings();
}

function displayCheesto(json) {
  var data = json.data;

  $('#content').html('');
  var table = $('<table/>');

  table.append('<tr>\
          <th width="50%">Name</th>\
          <th width="50%">Status</th>\
  </tr>');

  for(i=0; i<data.length; i++){
      user = data[i];

      html = '<tr>\
          <td><span title="'+user['message']+'">'+user['realname']+'</span></td>\
          <td><span title="'+user['statusInfo']['status']+'" class="'+user['statusInfo']['color']+'">'+user['statusInfo']['symbol']+'</td>\
          </tr>';

      table.append(html);
  }

  $('#content').append(table);
}