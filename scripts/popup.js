/*jshint multistr: true */

document.addEventListener('DOMContentLoaded', main);
var refreshTimeout;

function main() {
  "use strict";

  var background = chrome.extension.getBackgroundPage();
  $("#newlogs").html("There are "+background.newLogCount+" new logs to view in <a href=\""+background.options.dAdd+"\" target=\"_blank\">Dandelion</a>");
  background.clearLogCount();
  getStatus(background);
}

function getStatus(bgPage) {
  "use strict";

  var addr = bgPage.options.dAdd;
  var key = bgPage.options.dApi;
  var ver = bgPage.options.dVer;

  var fulladdress = addr+"/api/cheesto/read";
  if (ver === 5) {
      // /api/cheesto/readall
      fulladdress += 'all';
  }

  $.getJSON(fulladdress, {"apikey": key})
    .done(function(data) {
      if (ver === 5) {
        displayCheesto(data, true);
      } else {
        displayCheesto(data);
      }
      refreshTimeout = setTimeout(function() { getStatus(); }, 30000);
    })
    .fail(function(data) {
      if (data.status == 200) {
        displayAPIError();
      }
    });
}

// When compatibility is set to true, rendering will be done with Dandelion v5 field names
function displayCheesto(json, compatibility) {
  "use strict";
  if (typeof compatibility === 'undefined') {
      compatibility = false;
  }

  // Initialize variables
  var data = json.data;
  var user, key, html;

  // Clean up page and initialize new container element
  $('#content').remove();
  var appendedContent = $('<div/>').attr('id','content');

  // Generate select box of status options
  var statusSelect = $('<select/>');
  statusSelect.attr('id', 'statusSelect');
  statusSelect.change(function() { updateStatus(); });

  statusSelect.append('<option value="-1">Select:</option>');

  for (key in data.statusOptions) {
    if (compatibility) {
        // Version 5
        html = '<option value="'+key+'">'+data.statusOptions[key]+'</option>';
    } else {
        html = '<option value="'+data.statusOptions[key]+'">'+data.statusOptions[key]+'</option>';
    }
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

          if (compatibility) {
            // Version 5
            html = '<tr>\
              <td class="textLeft"><span title="'+user.message+'">'+user.realname+'</span></td>\
              <td><span title="'+user.statusInfo.status+'" class="'+user.statusInfo.color+'">'+user.statusInfo.symbol+'</td>\
              </tr>';
          } else {
            html = '<tr>\
              <td class="textLeft"><span title="'+user.message+'">'+user.fullname+'</span></td>\
              <td><span title="'+user.returntime+'">'+user.status+'</td>\
              </tr>';
          }

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
  var newStatus =  $("select#statusSelect").val();

  if (background.options.dVer === 5) {
    newStatus = $("select#statusSelect").prop("selectedIndex");
  }

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
