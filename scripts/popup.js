"use strict";

document.addEventListener('DOMContentLoaded', main);

function main() {
  var background = chrome.extension.getBackgroundPage();
  $("#newlogs").html("There are "+background.newLogCount+" new logs to view in <a href=\""+background.options.dAdd+"\" target=\"_blank\">Dandelion</a>");
  background.clearLogCount();
  background.getStatus();
}

function displayCheesto(json) {
  // Initialize variables
  var data = json.data;
  var user, html, key;
  
  // Clean up page and initialize new container element
  $('#content').remove();
  var appendedContent = $('<div/>').attr('id','content');
  
  // Generate select box of status options
  var statusSelect = $('<select/>').addClass('statusSelect');
  
  statusSelect.append('<option value="-1">Select:</option>');
  
  for (key in data.statusOptions) {
    html = '<option value="'+key+'">'+data.statusOptions[key]+'</option>';
    statusSelect.append(html);
  }

  // Generate the user status grid
  var table = $('<table/>');
  
  table.append('<tr>\
          <th width="50%">Name</th>\
          <th width="50%">Status</th>\
  </tr>');

  for (key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== "statusOptions") {  
          user = data[key];
    
          html = '<tr>\
              <td class="textLeft"><span title="'+user.message+'">'+user.realname+'</span></td>\
              <td><span title="'+user.statusInfo.status+'" class="'+user.statusInfo.color+'">'+user.statusInfo.symbol+'</td>\
              </tr>';
    
          table.append(html);
        }
      }
  }

  // Append the separate elements to content div
  appendedContent.append(statusSelect);
  appendedContent.append(table);
  
  // Append content div to existing page element
  $('#newlogs').after(appendedContent);
}

function displayAPIError() {
  $('#content').html("An error has occured.<br><br>Make sure the public API is enabled in Dandelion.");
}
