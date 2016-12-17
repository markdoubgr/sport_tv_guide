
loadMatches(0);
$(".today-select").click(function (ev) { loadMatches(0) });
$(".tomorrow-select").click(function (ev) { loadMatches(1) });
$(".two-select").click(function (ev) { loadMatches(2) });
$(".three-select").click(function (ev) { loadMatches(3) });

// fetch matches from bet... using php
function loadMatches(daysAfter) {
  $("#loading").show();
  var date = getDateStr(daysAfter);
  if (!date) {
    date = "";
  }
  $.get( "php/fetchguide.php?date="+date, function( data ) {
    var rows = $(data).find("div#listings_content tr");
    var events = [];
    $.each(rows, function( index, row ) {
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
    $("#match-list").html("<table id='match-table'></table>");
    $("#loading").hide();
    $.each(events, addRowDiv);
  });
}

function addRowDiv(index, evt) {
  var domStr = "<tr>\
  <td class='match-time'>"+ evt.time +"</td>\
  <td class='match-sport sport-"+ evt.sport.replace(/ /g, "-").toLowerCase() +"'>"+ evt.sport +"</td>\
  <td class='match-evt'><span class='match-evt-match'>"+ evt.evt.match +"</span>\
  <span class='match-evt-competition competition-"+ evt.evt.competition.replace(/ /g, "-").toLowerCase() +"'>"+ evt.evt.competition +"</td>\
  <td class='match-channels'>";
  var channelsStr = "";
  $.each(evt.channels, function (ind, channel) {
    channelsStr += "<span class='"+ channel.replace(/ /g, "-").toLowerCase() +"'>"+ channel +"</span>"
  });
  domStr += channelsStr;
  domStr += "</td></tr>";
  $("#match-table").append(domStr);
}

function getDateStr(daysAfter) {
  // var tomorrow = new Date();
  var d = new Date();
  d.setDate(d.getDate()+daysAfter);
  var ret = d.getFullYear()+"-"+(parseInt(d.getMonth())+1)+"-"+d.getDate();
  console.log(ret);
  return ret;
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
