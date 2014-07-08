"use strict";

document.addEventListener('DOMContentLoaded', main);

function main() {
  var background = chrome.extension.getBackgroundPage();
  $("#newlogs").html("There are "+background.newLogCount+" new logs to view in <a href=\""+background.options.dAdd+"\" target=\"_blank\">Dandelion</a>");
  background.clearLogCount();
  background.getStatus();
}

function displayCheesto(json) {
  var data = json.data;
  var user;
  var html;
  
  $('#content').remove();
  var appendedContent = $('<div/>').attr('id','content');
  var table = $('<table/>');

  table.append('<tr>\
          <th width="50%">Name</th>\
          <th width="50%">Status</th>\
  </tr>');

  for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== "statusOptions") {  
          user = data[key];
    
          html = '<tr>\
              <td><span title="'+user.message+'">'+user.realname+'</span></td>\
              <td><span title="'+user.statusInfo.status+'" class="'+user.statusInfo.color+'">'+user.statusInfo.symbol+'</td>\
              </tr>';
    
          table.append(html);
        }
      }
  }
  
  var statusSelect = $('<select/>').addClass('statusSelect');
  
  statusSelect.append('<option value="-1">Select:</option>');
  
  for (var key2 in data.statusOptions) {
    html = '<option value="'+key2+'">'+data.statusOptions[key2]+'</option>';
    statusSelect.append(html);
  }

  appendedContent.append(statusSelect);
  appendedContent.append(table);
  
  $('#newlogs').after(appendedContent);
}

function displayAPIError() {
  $('#content').html("An error has occured.<br><br>Make sure the public API is enabled in Dandelion.");
}
