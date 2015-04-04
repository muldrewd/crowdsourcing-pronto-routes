(function() {

  var map;
  var socrataAppToken = 'MmFqykL8mygeptjRHvgrmqcHL';

  function geocode(address) {
    return $.Deferred(function(dfrd) {
      (new google.maps.Geocoder()).geocode({'address': address}, function(results, status) {
        if(status === google.maps.GeocoderStatus.OK) {
          dfrd.resolve(results[0]);
        } else {
          dfrd.reject(new Error(status));
        }
      });
    }).promise();
  }

  function getNearbyProntoStation(lat, lon) {
    return $.getJSON(
      'https://communities.socrata.com/resource/rsib-fvg5.json?'
      + '&$where=within_circle(location_1, ' + lat + ', ' + lon + ', 1000)'
      + '&$$app_token=' + socrataAppToken);
  }

  function addMarker(location) {
    var marker = new google.maps.Marker({
      map: map,
      position: location,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 4
      }
    });
  }

  function handleSearchSubmit(event) {

    event.preventDefault();

    // Geocode our addresses
    $.when(

      geocode($("#startaddress").val()),
      geocode($("#endaddress").val())

    )
    .done(initMap);

  }

  function initMap(start, end) {

      // Add markers for start and end
      var startLoc = start.geometry.location;
      var endLoc = end.geometry.location;

      addMarker(startLoc);
      addMarker(endLoc);

      // Get our start and end locations
      $.when(

        getNearbyProntoStation(startLoc.lat(), startLoc.lng()),
        getNearbyProntoStation(endLoc.lat(), endLoc.lng())

      )
      .done(displayStations);

  }

  function getStationNumbers(stations) {
    return stations[0].map(function(station) { return station.number; });
  }

  function buildStationRouteQuery(startStations, endStations) {

    return "(starting_station='" + getStationNumbers(startStations).join("' OR starting_station='") + "')"
            + " AND "
            + " (end_station='" + getStationNumbers(endStations).join("' OR end_station='") + "')";

  }

  function getMatchingProntoRoutes(startStations, endStations) {

    var url = 'https://communities.socrata.com/resource/4uqz-b36x.json?'
                + '$where=' + buildStationRouteQuery(startStations, endStations)
                + '&$$app_token=' + socrataAppToken;

    return $.getJSON(url);

  }

  function displayStations(startStations, endStations) {

    $.when(

      getMatchingProntoRoutes(startStations, endStations)

    ).done(function(data) {

      $.each(data, function (i, entry) {
        $('#results').dataTable().fnAddData(
          [
            entry.starting_station,
            entry.end_station,
            '<a href="' + entry.route_link + '" target="_blank">View route &raquo;</a>',
            entry.distance,
            entry.time,
            entry.elevation_gain,
            entry.elevation_descent,
            entry.scenery,
            entry.difficulty
          ]
        );
      });

    });

  }

  $(function() {

    // Intialize our map
    var center = new google.maps.LatLng(47.645292, -122.301120);

    var mapOptions = {
      zoom: 12,
      center: center,
      draggable: false
    }

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Initialize our data table
    $('#results').dataTable();

    $("#search").submit(handleSearchSubmit);

  });

})();
