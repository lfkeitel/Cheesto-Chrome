/*jshint multistr: true */

(function() {
  "use strict";
  var refreshTimeout;
  var options = {};

  function main() {
    var background = chrome.extension.getBackgroundPage();
    options.hostname = background.options.dAdd;
    options.apikey = background.options.dApi;
    background.clearLogCount();

    renderStatusView(background.newLogCount);
  }

  function renderStatusView(logcount) {
    var fulladdress = `${options.hostname}/api/cheesto/read`;

    $.getJSON(fulladdress, { "apikey": options.apikey })
      .done(function(json) {
        if (json.errorcode !== 0) {
          displayAPIError();
          return;
        }

        var cheestoView = $("<div><h2>&#264;eesto User Status</h2></div>");

        cheestoView.append(`<div id="newlogs"> \
          There are ${logcount} new logs to view in <a href="${options.hostname}" target="_blank">Dandelion</a> \
          </div>`);

        var html = renderCheestoTable(json.data);

        // Append content div to existing page element
        cheestoView.append(html);
        $('#app').html(cheestoView.html());
      })
      .fail(function(data) {
        if (data.status == 200) {
          displayAPIError();
        }
      });
  }

  function renderCheestoTable(data) {
    // Initialize variables
    var user, key, html;

    // Generate select box of status options
    var statusSelect = $('<select/>');
    statusSelect.attr('id', 'statusSelect');
    statusSelect.change(function() { updateStatus(); });

    statusSelect.append('<option value="-1">Select:</option>');

    for (key in data.statusOptions) {
      html = `<option value="${data.statusOptions[key]}">${data.statusOptions[key]}</option>`;
      statusSelect.append(html);
    }

    // Generate the user status grid
    var table = $('<table/>');

    table.append('<tr><th width="50%">Name</th><th width="50%">Status</th></tr>');

    for (key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== "statusOptions") {
          user = data[key];
          html = `<tr>\
            <td class="textLeft">\
              <span>${user.fullname}</span>\
            </td>\
            <td>\
              <span title="${user.returntime}\n\n${user.message}">${user.status}</span>\
            </td>\
          </tr>`;
          table.append(html);
        }
      }
    }

    var appendedContent = $('<div/>').attr('id', 'content');
    appendedContent.append(statusSelect);
    appendedContent.append(table);
    return appendedContent;
  }

  function updateStatus() {
    var background = chrome.extension.getBackgroundPage();
    var newStatus = $("select#statusSelect").val();

    var message = "";

    if (newStatus !== "Available") {
      message = prompt("Status Message:");
      if (message === null) {
        main();
        return;
      }
    }

    $.post(`${background.options.dAdd}/api/cheesto/update`,
      {
        apikey: background.options.dApi,
        message: message,
        status: newStatus,
        returntime: "Today"
      })
      .done(function() {
        main();
      });
  }

  function displayAPIError() {
    $('#app').html("<h2>An error has occured.<br><br>Make sure the public API is enabled in Dandelion.<br><br>Also check your API key.</h2>");
  }

  document.addEventListener('DOMContentLoaded', main);
})();
