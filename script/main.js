(function() {

  var socrataAppToken = 'MmFqykL8mygeptjRHvgrmqcHL';

  var map;
  var stations = [];

  var startLocation;
  var endLocation;

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
      position: location
    });
  }

  function getDirections(start, end, travelMode) {

    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    var directionsService = new google.maps.DirectionsService();

    var request = {
      origin: start,
      destination: end,
      travelMode: travelMode
    };

    return $.Deferred(function(promise) {

      directionsService.route(request, function(result, status) {

        if(status === google.maps.GeocoderStatus.OK)
        {
          directionsDisplay.setDirections(result);
          promise.resolve();
        }
        else
        {
          promise.reject(new Error(status));
        }

      });

    }).promise();

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

  function handleMapDisplayBtnClick(event) {

    event.preventDefault();

    var $row = $(this).closest('tr');
    var $cols = $row.children('td');

    var startStationNumber = $cols.eq('0').text();
    var endStationNumber = $cols.eq('1').text();

    var startStation = stations[startStationNumber];
    var endStation = stations[endStationNumber];

    var startStationPoint = new google.maps.LatLng(
      startStation.location_1.latitude,
      startStation.location_1.longitude);

    var endStationPoint = new google.maps.LatLng(
      endStation.location_1.latitude,
      endStation.location_1.longitude);

    $.when(

      // Directions: Walk From Start Location to Start Station
      getDirections(startLocation, startStationPoint,
          google.maps.TravelMode.WALKING),

      // Directions: Bike From Start Station to End Station
      getDirections(startStationPoint, endStationPoint,
          google.maps.TravelMode.BICYCLING),

      // Directions: Walk From End Station to End Location
      getDirections(endStationPoint, endLocation,
          google.maps.TravelMode.WALKING)

    )
    .done(function(startWalkingDirs, bikingDirs, endWalkingDirs) {

      displayDirections(startWalkingDirs);
      displayDirections(bikingDirs);
      displayDirections(endWalkingDirs);

    });

  }

  function clearStationCache() {
    stations = [];
  }

  function cacheStations(newStations) {
    $.each(newStations[0], function(i, station) {
      stations[station.number] = station;
    });
  }

  function initMap(start, end) {

      // Add markers for start and end
      startLocation = start.geometry.location;
      endLocation = end.geometry.location;

      addMarker(startLocation);
      addMarker(endLocation);

      // Get our start and end locations
      $.when(

        getNearbyProntoStation(startLocation.lat(), startLocation.lng()),
        getNearbyProntoStation(endLocation.lat(), endLocation.lng())

      )
      .then(function(startStations, endStations) {

        clearStationCache();
        cacheStations(startStations);
        cacheStations(endStations);

        return getMatchingProntoRoutes(startStations, endStations)

      })
      .then(function(routes) {

        displayRoutes(routes);

      });

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

  function displayRoutes(routes) {

    $.each(routes, function (i, entry) {
      $('#results').dataTable().fnAddData(
        [
          entry.starting_station,
          entry.end_station,
          '<a href="' + entry.route_link + '" target="_blank">View route &raquo;</a>',
          '<button class="map-display-btn">Display Route</button>',
          entry.distance,
          entry.time,
          entry.elevation_gain,
          entry.elevation_descent,
          entry.scenery,
          entry.difficulty
        ]
      );
    });

  }

  function displayDirections() {

  }

  $(function() {

    // Intialize our map
    var center = new google.maps.LatLng(47.645292, -122.301120);

    var mapOptions = {
      zoom: 12,
      center: center,
      draggable: true
    }

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Initialize our data table
    $('#results').dataTable();

    $("#search").submit(handleSearchSubmit);

    $('#results').on('click', '.map-display-btn', handleMapDisplayBtnClick);

  });

})();
