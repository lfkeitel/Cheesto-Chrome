(function() {
  'use strict';
  var options = {};

  function main() {
    var background = chrome.extension.getBackgroundPage();
    options.hostname = background.options.hostname;
    options.apikey = background.options.apikey;
    options.logLimit = background.options.logLimit;

    switch (background.options.tabDefault) {
      case 'logs':
        renderLogsView();
        break;
      case 'cheesto':
        renderStatusView();
        break;
      default:
        renderDynamicStartTab(background.newLogCount());
    }

    background.clearLogCount();
  }

  function renderDynamicStartTab(logCount) {
    if (logCount > 0) {
      renderLogsView();
    } else {
      renderStatusView();
    }
  }

  function swapPage(content, page) {
    $('.tab').removeClass('active-tab');
    $(`#${page}-tab`).addClass('active-tab');
    $('#app').html(content.html());
  }

  function renderStatusView() {
    var fulladdress = `${options.hostname}/api/cheesto/read`;

    $.getJSON(fulladdress, { 'apikey': options.apikey })
      .done(function(json) {
        if (json.errorcode !== 0) {
          displayAPIError('cheesto');
          return;
        }

        var cheestoView = $('<div><h2>&#264;eesto User Status</h2></div>');

        var html = renderCheestoTable(json.data);

        // Append content div to existing page element
        cheestoView.append(html);
        swapPage(cheestoView, 'cheesto');
        // For some reason the click handler wasn't being applied
        // in the renderCheestoTable function so I'm applying it
        // here instead.
        $('#statusSelect').change(function() { updateStatus(); });
      })
      .fail(function(data) {
        if (data.status === 200) {
          displayAPIError('cheesto');
        }
      });
  }

  function renderCheestoTable(data) {
    // Generate select box of status options
    var statusSelect = $('<select/>');
    statusSelect.attr('id', 'statusSelect');

    statusSelect.append('<option value="-1">Select:</option>');

    for (const key in data.statusOptions) {
      const html = `<option value="${data.statusOptions[key]}">${data.statusOptions[key]}</option>`;
      statusSelect.append(html);
    }

    // Generate the user status grid
    const table = $('<table/>');

    table.append('<tr><th width="50%">Name</th><th width="50%">Status</th></tr>');

    for (const key in data.statuses) {
      if (data.statuses.hasOwnProperty(key)) {
        const user = data.statuses[key];
        const html = `<tr>\
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

    const appendedContent = $('<div/>').attr('id', 'content');
    appendedContent.append('Set status: ');
    appendedContent.append(statusSelect);
    appendedContent.append(table);
    return appendedContent;
  }

  function updateStatus() {
    var newStatus = $('select#statusSelect').val();

    var message = '';

    if (newStatus !== 'Available') {
      message = prompt('Status Message:');
      if (message === null) {
        main();
        return;
      }
    }

    $.post(`${options.hostname}/api/cheesto/update`,
      {
        apikey: options.apikey,
        message: message,
        status: newStatus,
        returntime: 'Today'
      })
      .done(function() {
        main();
      });
  }

  function renderLogsView(logcount) {
    var fulladdress = `${options.hostname}/api/logs/read`;

    $.getJSON(fulladdress, {'apikey': options.apikey, 'limit': options.logLimit})
      .done(function(json) {
        if (json.errorcode !== 0) {
          displayAPIError('logs');
          return;
        }

        var logView = $('<div></div>');

        var html = renderLogTable(json.data);
        logView.append(html);

        swapPage(logView, 'logs');
      })
      .fail(function(resp) {
        if (resp.status === 200) {
          displayAPIError('logs');
        }
      });
  }

  function renderLogTable(data) {
    var table = $('<div></div>');

    for (var key in data.logs) {
      if (data.logs.hasOwnProperty(key)) {
        var log = data.logs[key];
        var classes = 'log';

        if (key < data.metadata.resultCount - 1) {
          classes += ' log-separator';
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
    var errormsg = $('<div><h2>An error has occured.<br><br>Make sure the public API is enabled in Dandelion.<br><br>Also check your API key.</h2></div>');
    swapPage(errormsg, page);
  }

  function addEventListeners() {
    document.addEventListener('DOMContentLoaded', main);
    $('#cheesto-tab').click(renderStatusView);
    $('#logs-tab').click(renderLogsView);
  }

  addEventListeners();
})();
