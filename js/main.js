
$(".today-select").click(function (ev) { loadMatches(0) });
$(".tomorrow-select").click(function (ev) { loadMatches(1) });
$(".two-select").click(function (ev) { loadMatches(2) });
$(".three-select").click(function (ev) { loadMatches(3) });
loadMatches(0);

// fetch matches from bet... using php
function loadMatches(daysAfter) {
  $("#loading").show();
  var date = getDateStr(daysAfter);
  if (!date) date = "";
  $.get( "php/fetchguide.php?date="+date, function( data ) {
    var rowsReturned = $(data).find("div#listings_content tr");
    var events = createEventsArray(rowsReturned);
    var eventsTable = createEventsTable(events);
    $("#loading").hide();
    $("#match-table").append(eventsTable);
    refreshFilters(events);
  });
}

function createEventsArray(rowsReturned) {
  var events = [];
  $.each(rowsReturned, function( index, row ) {
    var evt = $(row).find(".event>a").text().trim();
    if (!evt) {
      evt = $(row).find(".event").text().trim();
    }
    var evtArray = evt.split(" - ");
    var event = {};
    event.match = evtArray.pop();
    event.competition = evtArray.join(" - ");
    events[index] = {
      time: $(row).find(".time").text().trim(),
      sport: $(row).find(".sport").text().trim(),
      evt: event,
    };
    events[index].channels = [];
    var broadcastList = $(row).find(".broadcasts li");
    $.each(broadcastList, function( ind, broadcast ) {
      events[index].channels[ind] = $(broadcast).children().remove("span").end().text().trim();
    });
  });
  return events;
}

function createEventsTable(events) {
  var tableStr = "";
  $.each(events, function (index, evt) {
    var sportClass = "sport-" + evt.sport.replace(/ /g, "-").toLowerCase();
    var competitionClass = " competition" + evt.evt.competition.replace(/ /g, "-").toLowerCase();
    var channelClass = "";
    $.each(evt.channels, function (ind, channel) {
      channelClass += " channel-" + channel.replace(/ /g, "-").toLowerCase();
    });
    tableStr += "<tr class='"+ sportClass + competitionClass + channelClass +"'>\
    <td class='match-time'>"+ evt.time +"</td>\
    <td class='match-sport sport-"+ sportClass +"'>"+ evt.sport +"</td>\
    <td class='match-evt'><span class='match-evt-match'>"+ evt.evt.match +"</span>\
    <span class='match-evt-competition competition-"+  +"'>"+ evt.evt.competition +"</td>\
    <td class='match-channels'>";
    var channelsStr = "";
    $.each(evt.channels, function (ind, channel) {
      channelsStr += "<span class='"+ channel.replace(/ /g, "-").toLowerCase() +"'>"+ channel +"</span>"
    });
    tableStr += channelsStr;
    tableStr += "</td></tr>";
  });
  return tableStr;
}

function getDateStr(daysAfter) {
  var d = new Date();
  d.setDate(d.getDate()+daysAfter);
  var ret = d.getFullYear()+"-"+(parseInt(d.getMonth())+1)+"-"+d.getDate();
  console.log(ret);
  return ret;
}

function refreshFilters(events) {
  var channels = [];
  var sports = [];
  $.each(events, function (index, event) {
    if (sports.indexOf(event.sport) < 0) {
      sports.push(event.sport);
      var sportClass = "sport-" + event.sport.replace(/ /g, "-").toLowerCase();
      $("#sport-filters").append("<span class='filter visible filter-"+ sportClass +"'>" + event.sport + "</span> | ");
      $(".filter-" + sportClass).off("click");
      $(".filter-" + sportClass).on("click", function (ev) {
        if ($(ev.target).hasClass("visible")) {
          $(ev.target).removeClass("visible")
          $("." + sportClass).hide();
        } else {
          $(ev.target).addClass("visible")
          $("." + sportClass).show();
        }
      });
    }
    $.each(event.channels, function (ind, channel) {
      if (channels.indexOf(channel) < 0) {
        channels.push(channel);
        var channelClass = "channel-" + channel.replace(/ /g, "-").toLowerCase();
        $("#channel-filters").append("<span class='filter visible filter-"+ channelClass +"'>" + channel + "</span> - ");
        $(".filter-" + channelClass).off("click");
        $(".filter-" + channelClass).on("click", function (ev) {
          if ($(ev.target).hasClass("visible")) {
            $(ev.target).removeClass("visible")
            $("." + channelClass).hide();
          } else {
            $(ev.target).addClass("visible")
            $("." + channelClass).show();
          }
        });
      }

    })
  });
}

function filterTable() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
