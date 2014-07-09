document.addEventListener('DOMContentLoaded', main);
var refreshTimeout;

function main() {
  "use strict";
  
  var background = chrome.extension.getBackgroundPage();
  $("#newlogs").html("There are "+background.newLogCount+" new logs to view in <a href=\""+background.options.dAdd+"\" target=\"_blank\">Dandelion</a>");
  background.clearLogCount();
  getStatus();
}

function getStatus() {
  "use strict";
  
  var background = chrome.extension.getBackgroundPage();
  var addr = background.options.dAdd;
  var key = background.options.dApi;
  
  $.getJSON(addr+"/api/cheesto/readall", {"apikey": key})
    .done(function(data) {
      displayCheesto(data);
      refreshTimeout = setTimeout(function() { getStatus(); }, 30000);
    })
    .fail(function(data) {
      if (data.status == 200) {
        displayAPIError();
      }
    });
}

function displayCheesto(json) {
  "use strict";
  
  // Initialize variables
  var data = json.data;
  var user, html, key;
  
  // Clean up page and initialize new container element
  $('#content').remove();
  var appendedContent = $('<div/>').attr('id','content');
  
  // Generate select box of status options
  var statusSelect = $('<select/>');
  statusSelect.attr('id', 'statusSelect');
  statusSelect.change(function() { updateStatus(); });
  
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

function updateStatus() {
  "use strict";
  
  var background = chrome.extension.getBackgroundPage();
  var newStatus = $("select#statusSelect").prop("selectedIndex");
  
  $.post(background.options.dAdd+"/api/cheesto/update",
    {"apikey": background.options.dApi,
     "message": "",
     "status": newStatus,
     "returntime": "Today"
    })
    .done(function() {
      main();
    });
}

function displayAPIError() {
  "use strict";
  
  $('#content').html("An error has occured.<br><br>Make sure the public API is enabled in Dandelion.");
}
