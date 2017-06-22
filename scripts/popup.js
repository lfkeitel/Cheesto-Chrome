/*jshint multistr: true */

(function() {
  "use strict";
  var refreshTimeout;
  var options = {};

  function main() {
    var background = chrome.extension.getBackgroundPage();
    options.hostname = background.options.dAdd;
    options.apikey = background.options.dApi;
    options.logNum = background.options.dLogNum;
    background.clearLogCount();

    if (background.newLogCount > 0) {
      renderLogsView();
    } else {
      renderStatusView();
    }
  }

  function swapPage(content, page) {
    $(".tab").removeClass("active-tab");
    $(`#${page}-tab`).addClass("active-tab");
    $('#app').html(content.html());
  }

  function renderStatusView() {
    var fulladdress = `${options.hostname}/api/cheesto/read`;

    $.getJSON(fulladdress, { "apikey": options.apikey })
      .done(function(json) {
        if (json.errorcode !== 0) {
          displayAPIError("cheesto");
          return;
        }

        var cheestoView = $("<div><h2>&#264;eesto User Status</h2></div>");

        var html = renderCheestoTable(json.data);

        // Append content div to existing page element
        cheestoView.append(html);
        swapPage(cheestoView, "cheesto");
      })
      .fail(function(data) {
        if (data.status == 200) {
          displayAPIError("cheesto");
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
    appendedContent.append("Set status: ");
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

  function renderLogsView(logcount) {
    var fulladdress = `${options.hostname}/api/logs/read`;

    $.getJSON(fulladdress, { "apikey": options.apikey, "limit": options.logNum })
      .done(function(json) {
        if (json.errorcode !== 0) {
          displayAPIError("logs");
          return;
        }

        var logView = $("<div></div>");

        var html = renderLogTable(json.data);
        logView.append(html);

        swapPage(logView, "logs");
      })
      .fail(function(resp) {
        if (resp.status == 200) {
          displayAPIError("logs");
        }
      });
  }

  function renderLogTable(data) {
    var table = $('<div></div>');

    for (var key in data) {
      if (data.hasOwnProperty(key) && key !== "metadata") {
        var log = data[key];
        var classes = "log"

        if (key < data.metadata.resultCount - 1) {
          classes += " log-separator"
        }

        var html = `<div class="${classes}">
          <span class="log-title">
            <a href="${options.hostname}/log/${log.id}" target="_blank">${log.title}</a>
          </span>
          <div class="log-body">${log.body}</div>
          <div class="log-create-data">
            <span class="title">Created by</span> ${log.fullname} at ${log.date_created} ${log.time_created}
          </div>
          <div class="log-category">
            <span class="title">Category:</span> ${log.category}
          </div>
        </div>`;

        table.append(html);
      }
    }

    var appendedContent = $('<div/>');
    appendedContent.append(table);
    return appendedContent;
  }

  function displayAPIError(page) {
    var errormsg = $("<div><h2>An error has occured.<br><br>Make sure the public API is enabled in Dandelion.<br><br>Also check your API key.</h2></div>");
    swapPage(errormsg, page);
  }

  function addEventListeners() {
    document.addEventListener('DOMContentLoaded', main);
    $("#cheesto-tab").click(renderStatusView);
    $("#logs-tab").click(renderLogsView);
  }

  addEventListeners();
})();
