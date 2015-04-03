var geocode = function(address) {
  return $.Deferred(function(dfrd) {
    console.log(address);
    (new google.maps.Geocoder()).geocode({'address': address}, function(results, status) {
      if(status === google.maps.GeocoderStatus.OK) {
        dfrd.resolve(results[0]);
      } else {
        dfrd.reject(new Error(status));
      }
    });
  }).promise();
};

$(document).ready(function () {
  // Intialize our map
  var center = new google.maps.LatLng(47.645292, -122.301120);
  var mapOptions = {
    zoom: 12,
    center: center,
    draggable: false
  }
  var map = new google.maps.Map(document.getElementById("map"), mapOptions);

  // Initialize our data table
  $('#results').dataTable();

  $("#search").submit(function (event) {
    event.preventDefault();

    // Geocode our addresses
    $.when(geocode($("#startaddress").val()),
    geocode($("#endaddress").val()))
    .done(function(start_geocode, end_geocode) {
      // Add markers for start and end
      var start_marker = new google.maps.Marker({
        map: map,
        position: start_geocode.geometry.location,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4
        }
      });
      var end_marker = new google.maps.Marker({
        map: map,
        position: end_geocode.geometry.location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4
        }
      });

      // Get our start and end locations
      $.when($.getJSON('https://communities.socrata.com/resource/rsib-fvg5.json?' + '&$where=within_circle(location_1, ' + start_geocode.geometry.location.lat() + ', ' + start_geocode.geometry.location.lng() + ', 1000)' + '&$$app_token=MmFqykL8mygeptjRHvgrmqcHL'),
      $.getJSON('https://communities.socrata.com/resource/rsib-fvg5.json?' + '&$where=within_circle(location_1, ' + end_geocode.geometry.location.lat() + ', ' + end_geocode.geometry.location.lng() + ', 1000)' + '&$$app_token=MmFqykL8mygeptjRHvgrmqcHL'))
      .done(function(start_stations, end_stations) {
        // Query our routes dataset to get matching routes
        var start_station_matches = [];
        $.each(start_stations[0], function(i, st) {
          start_station_matches.push("starting_station = '" + st.number + "'");
        });
        var end_station_matches = [];
        $.each(end_stations[0], function(i, st) {
          end_station_matches.push("end_station = '" + st.number + "'");
        });

        var query = "(" + start_station_matches.join(" OR ") + ")"
        + " AND "
        + " (" + end_station_matches.join(" OR ") + ")";

        console.log(query);

        url = 'https://communities.socrata.com/resource/4uqz-b36x.json?'
        + '$where=' + query
        + '&$$app_token=MmFqykL8mygeptjRHvgrmqcHL';
        $.getJSON(url, function(data, status) {
          // Add em!
          $.each(data, function (i, entry) {
            $('#results').dataTable().fnAddData(
              [entry.starting_station, entry.end_station, '<a href="' + entry.route_link + '" target="_blank">View route &raquo;</a>', entry.distance, entry.time, entry.elevation_gain, entry.elevation_descent, entry.scenery, entry.difficulty]);
            });
          });

        });
      });
    });
  });
