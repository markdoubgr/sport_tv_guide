
var excludedSports = ["Horse Racing", "Greyhound Racing", "Special Bets"];
var excludedChannels = ["Betfair Live Video"];
var enabledFilters = ["channels", "sports"];
var freeviewChannels = ["Five","BBC 4","BBC 3","BBC 2","BBC 1","BBCi","ITV 4","ITV 3","ITV 2","ITV 1"];
var daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
// var excludedSports = [];
// var excludedChannels = [];
// var enabledFilters = ["channels", "competitions", "sports"];

$(".date-select").click(function (ev) {
  $(".date-select").removeClass("visible");
  $(ev.target).addClass("visible");
});
$(".today-select").click(function (ev) { loadMatches(0) });
$(".tomorrow-select").click(function (ev) { loadMatches(1) });
$(".two-select").click(function (ev) { loadMatches(2) });
$(".three-select").click(function (ev) { loadMatches(3) });
$("#close-filters").click(function (ev) {
  $("#filter-containers").hide();
  $("#sport-filters").hide();
  $("#channel-filters").hide();
  $("#competition-filters").hide();
  $(".filter-btn").removeClass("active");
});
$("#clear-filters").click(function (ev) {
  var selectedChannels = [];
  var selectedSports = [];
  localStorage.setItem("sport-filters", JSON.stringify(selectedSports));
  localStorage.setItem("channel-filters", JSON.stringify(selectedChannels));
  $(".filter").removeClass("visible");
  $("tr.match-tr").removeClass("sport-visible");
  $("#clear-filters").hide();
  showHideMatches();
});
$(".filter-btn").click(function (ev) {
  if ($(ev.target).hasClass("active")) {
    $(".filter-btn").removeClass("active");
    $(".filter-popup").hide();
    $("#filter-containers").hide();
  } else {
    $(".filter-btn").removeClass("active");
    $(".filter-popup").hide();
    $(ev.target).addClass("active");
    $("#" + $(ev.target).data("popup")).show();
    $("#filter-containers").show();
  }
});

$(".today-select").addClass("visible");

var days = [new Date(), new Date(), new Date(), new Date()];
// days[0] = new Date();
loadMatches(0);
// var day1 = new Date();
// var day2 = new Date();
// var day3 = new Date();
days[1].setTime( days[0].getTime() + 1 * 86400000 );
days[2].setTime( days[0].getTime() + 2 * 86400000 );
days[3].setTime( days[0].getTime() + 3 * 86400000 );
$(".two-select").html(daysOfWeek[days[2].getDay()]);
$(".three-select").html(daysOfWeek[days[3].getDay()]);

function loadMatches(daysAfter) {
  $("#date").html(days[daysAfter].toDateString());
  $("#loading").show();
  var date = getDateStr(daysAfter);
  if (!date) date = "";
  $.get( "php/fetchguide.php?date="+date, function( data ) {
    var rowsReturned = $(data).find("div#listings_content tr");
    var events = createEventsArray(rowsReturned);
    var eventsTable = createEventsTable(events);
    $("#loading").hide();
    $("#match-table").html(eventsTable);
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
    var newEvent = {
      time: $(row).find(".time").text().trim(),
      sport: $(row).find(".sport").text().trim(),
      evt: event,
      channels: []
    };
    var broadcastList = $(row).find(".broadcasts li");
    $.each(broadcastList, function( ind, broadcast ) {
      var channel = $(broadcast).children().remove("span").end().text().trim();
      if (excludedChannels.indexOf(channel) < 0) {
        newEvent.channels.push(channel);
      }
    });
    if (newEvent.channels.length > 0) events.push(newEvent);
  });
  return events;
}

function createEventsTable(events) {
  var tableStr = "";
  $.each(events, function (index, evt) {
    if (excludedSports.indexOf(evt.sport) < 0) {
      var sportClass = "sport-" + evt.sport.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
      var competitionClass = "competition-" + evt.evt.competition.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
      if (competitionClass == "competition-") competitionClass = "competition-none";
      var channelClass = "";
      $.each(evt.channels, function (ind, channel) {
        channelClass += " channel-" + channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
      });
      tableStr += "<tr class='match-tr "+ sportClass + " " + competitionClass + " " + channelClass +"'>\
      <td class='match-time'>"+ evt.time +"</td>\
      <td class='match-sport "+ sportClass +"'>"+ evt.sport +"</td>\
      <td class='match-evt'><div class='match-evt-match'>"+ evt.evt.match +"</div>\
      <div class='match-evt-competition "+ competitionClass +"'>"+ evt.evt.competition +"</div></td>\
      <td class='match-channels'>";
      var channelsStr = "";
      $.each(evt.channels, function (ind, channel) {
        var channelImg = channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
        channelsStr +="<span class='"+ channelImg +"'><img src='img/" + channelImg + ".png' alt='" + channel + "'></span>";
      });
      tableStr += channelsStr;
      tableStr += "</td></tr>";
    }
  });
  return tableStr;
}

function getDateStr(daysAfter) {
  var d = new Date();
  d.setDate(d.getDate()+daysAfter);
  var ret = d.getFullYear()+"-"+(parseInt(d.getMonth())+1)+"-"+d.getDate();
  return ret;
}

function refreshFilters(events) {
  var channels = [];
  var sports = [];
  var competitions = [];
  var selectedChannels = JSON.parse(localStorage.getItem("channel-filters")) || [];
  var selectedSports = JSON.parse(localStorage.getItem("sport-filters")) || [];
  var selectedCompetitions = JSON.parse(localStorage.getItem("competition-filters")) || [];

  $("#sport-filters").html("");
  $("#competition-filters").html("");
  $("#channel-filters").html("");

  var channelImg = "freeviewchannels";
  $("#channel-filters").append("<div class='filter filter-channel filter-freeviewChannels'>" + "<img src='img/" + channelImg + ".png' alt='" + freeviewChannels + "'>" + "</div> ");
  checkFreeview(selectedChannels);
  $(".filter-freeviewChannels").on("click", function (ev) {
    if ($(ev.target).hasClass("visible")) {
      $(ev.target).removeClass("visible")
      $(".filter-freeviewChannels").removeClass("channel-visible");
      $.each(freeviewChannels, function (ind, channel) {
        if (selectedChannels.indexOf(channel) >= 0) {
          selectedChannels.splice(selectedChannels.indexOf(channel), 1);
          var channelClass = "channel-" + channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
          $("."+channelClass).removeClass("channel-visible");
          $(".filter-"+channelClass).removeClass("visible");
        }
      });
      if (selectedChannels.length == 0 && selectedSports.length == 0) {
        $("#clear-filters").hide();
      }
  } else {
      $(ev.target).addClass("visible")
      $("#clear-filters").show();
      $(".filter-freeviewChannels").addClass("channel-visible");
      $.each(freeviewChannels, function (ind, channel) {
        if (selectedChannels.indexOf(channel) < 0) {
          selectedChannels.push(channel);
          var channelClass = "channel-" + channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
          $("."+channelClass).addClass("channel-visible");
          $(".filter-"+channelClass).addClass("visible");
        }
      });
    }
    localStorage.setItem("channel-filters", JSON.stringify(selectedChannels));
    showHideMatches();
  });

  $.each(events, function (index, event) {

    if (excludedSports.indexOf(event.sport) < 0) {
      if (enabledFilters.indexOf("sports") >= 0) {
        if (sports.indexOf(event.sport) < 0) {
          sports.push(event.sport);
          var sportClass = "sport-" + event.sport.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
          var visibleClass = "";
          if (selectedSports.indexOf(event.sport) >= 0) {
            visibleClass = " visible";
            $("."+sportClass).addClass("sport-visible");
          }
          $("#sport-filters").append("<div class='filter filter-sport filter-"+ sportClass + visibleClass +"'>" + event.sport + "</div> ");
          $(".filter-" + sportClass).off("click");
          $(".filter-" + sportClass).on("click", function (ev) {
            if ($(ev.target).hasClass("visible")) {
              $(ev.target).removeClass("visible")
              $("."+sportClass).removeClass("sport-visible");
              if (selectedSports.indexOf(event.sport) >= 0) {
                selectedSports.splice(selectedSports.indexOf(event.sport), 1);
              }
              if (selectedChannels.length == 0 && selectedSports.length == 0) {
                $("#clear-filters").hide();
              }
            } else {
              $(ev.target).addClass("visible");
              $("#clear-filters").show();
              $("."+sportClass).addClass("sport-visible");
              if (selectedSports.indexOf(event.sport) < 0) {
                selectedSports.push(event.sport);
              }
            }
            localStorage.setItem("sport-filters", JSON.stringify(selectedSports));
            showHideMatches();
          });
        }
      }

      if (enabledFilters.indexOf("channels") >= 0) {
        $.each(event.channels, function (ind, channel) {
          if (channels.indexOf(channel) < 0) {
            channels.push(channel);
            var channelClass = "channel-" + channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
            var visibleClass = "";
            if (selectedChannels.indexOf(channel) >= 0) {
              visibleClass = " visible";
              $("."+channelClass).addClass("channel-visible");
            }
            var channelImg = channel.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
            $("#channel-filters").append("<div class='filter filter-channel filter-"+ channelClass + visibleClass + "'>" + "<img src='img/" + channelImg + ".png' alt='" + channel + "'>" + "</div> ");
            $(".filter-" + channelClass).off("click");
            $(".filter-" + channelClass).on("click", function (ev) {
              if ($(ev.target).hasClass("visible")) {
                $(ev.target).removeClass("visible")
                $("."+channelClass).removeClass("channel-visible");
                if (selectedChannels.indexOf(channel) >= 0) {
                  selectedChannels.splice(selectedChannels.indexOf(channel), 1);
                }
                if (selectedChannels.length == 0 && selectedSports.length == 0) {
                  $("#clear-filters").hide();
                }
              } else {
                $(ev.target).addClass("visible")
                $("#clear-filters").show();
                $("."+channelClass).addClass("channel-visible");
                if (selectedChannels.indexOf(channel) < 0) {
                  selectedChannels.push(channel);
                }
              }
              checkFreeview(selectedChannels);
              localStorage.setItem("channel-filters", JSON.stringify(selectedChannels));
              showHideMatches();
            });
          }
        })

      }

      if (enabledFilters.indexOf("competitions") >= 0) {
        if (competitions.indexOf( event.evt.competition) < 0) {
          competitions.push( event.evt.competition);
          var competitionClass = "competition-" + event.evt.competition.replace(/[ !\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
          if (competitionClass == "competition-") competitionClass = "competition-none";
          var competitionString = event.evt.competition;
          if (competitionString == "") competitionString = "unknown";
          $("#competition-filters").append("<div class='filter filter-competition filter-"+ competitionClass +"'>" +  competitionString + "</div> ");
          $(".filter-" + competitionClass).off("click");
          $(".filter-" + competitionClass).on("click", function (ev) {
            if ($(ev.target).hasClass("visible")) {
              $(ev.target).removeClass("visible")
              $("."+competitionClass).removeClass("competition-visible");
            } else {
              $(ev.target).addClass("visible")
              $("."+competitionClass).addClass("competition-visible");
            }
            showHideMatches();
          });
        }
      }

    }
  });
  if (enabledFilters.indexOf("sports") >= 0) {
    var $filterContainer = $('#sport-filters');
	  var $filter = $filterContainer.children('.filter-sport');
    $filter.sort(function(a,b){
    	if($(a).text() > $(b).text())  return 1;
    	if($(a).text() < $(b).text()) return -1;
    	return 0;
    });
    $filter.detach().appendTo($filterContainer);
  }
  if (enabledFilters.indexOf("channels") >= 0) {
    var $filterContainer = $('#channel-filters');
	  var $filter = $filterContainer.children('.filter-channel');
    $filter.sort(function(a,b){
      if($(a).find("img")[0].alt.length >50) return -1;
      if($(b).find("img")[0].alt.length >50) return 1;
      if($(a).find("img")[0].alt > $(b).find("img")[0].alt) return 1;
      if($(a).find("img")[0].alt < $(b).find("img")[0].alt) return -1;
      return 0;
    });
    $filter.detach().appendTo($filterContainer);
  }
  if (enabledFilters.indexOf("competitions") >= 0) {
    var $filterContainer = $('#competition-filters');
	  var $filter = $filterContainer.children('.filter-competition');
    $filter.sort(function(a,b){
    	if($(a).text() > $(b).text())  return 1;
    	if($(a).text() < $(b).text()) return -1;
    	return 0;
    });
    $filter.detach().appendTo($filterContainer);
  }
  showHideMatches();
}

function showHideMatches() {
  var matchRows = $(".match-tr");
  matchRows.show();
  if ($(".filter-sport.visible").length > 0) {
    $.each(matchRows, function (i, row) {
      if (!$(row).hasClass("sport-visible")) {
        $(row).hide();
      }
    })
  }
  if ($(".filter-channel.visible").length > 0) {
    $.each(matchRows, function (i, row) {
      if (!$(row).hasClass("channel-visible")) {
        $(row).hide();
      }
    })
  }
  if ($(".filter-competition.visible").length > 0) {
    $.each(matchRows, function (i, row) {
      if (!$(row).hasClass("competition-visible")) {
        $(row).hide();
      }
    })
  }
}

function checkFreeview(selectedChannels) {
  var freeviewEnabled = true;
  $.each(freeviewChannels, function (i, channel) {
    if (selectedChannels.indexOf(channel) < 0) {
      freeviewEnabled = false;
    }
  });
  if (freeviewEnabled) {
    $(".filter-freeviewChannels").addClass("visible");
    $(".freeviewChannels").addClass("channel-visible");
  } else {
    $(".filter-freeviewChannels").removeClass("visible");
    $(".freeviewChannels").removeClass("channel-visible");
  }
}
