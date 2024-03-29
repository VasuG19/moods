//use jQuery to assess when the document is ready 
$(document).ready(function(){
  let origin="NE1 8ST"; // Define the origin location
  let destination=""; // Initialize the destination variable
  let map; // Declare a variable to hold the Google Map object
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Define labels for markers
  let labelIndex = 0; // Initialize the label index for markers
  var markers = []; // Array to store markers
  var lat = 54.977; // Initialize latitude
  var lng = -1.607; // Initialize longitude

  // Function to initialize the Google Map
  async function initMap(){
    
    // Define latitude and longitude for map center
    let myLatlng = new google.maps.LatLng( 54.9712913, -1.6175957); 
    let mapOptions = {
      center: myLatlng,
      zoom:5,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: true,
      overviewMapControl: false,
      rotateControl: false,
      scaleControl: false,
      panControl: false,
    };

    map = new google.maps.Map(document.getElementById("map-area"), mapOptions);	
    
    $.getJSON("./data/kf6013_assignment_data.json", function(data) {
      // Access the Twitter data and do something with it here
  
      console.log("Data loaded correctly");
      console.log("There are " + data.statuses.length + " Twitter statuses within the dataset");
    
      // Create an array to store the filtered data in
      var filteredItems = [];
      $.each(data.statuses, function(key, val) {

        // add tweets with specific hashtag to list
        if (val.text.includes("#climatechange") || val.text.includes("#NetZero")) {
          if (val.user.location && val.user.location.includes("UK")) { // Check if location includes "United Kingdom"
          filteredItems.push("<dt>" + val.user.name + "</dt>" + "<dd>" + val.text + "</dd>");
          if (val.user.location) {
            filteredItems.push("<dd>" + val.user.location + "</dd>" + "<hr>");
          }
        }

        // add all tweets with a location to the map
          console.log("adding location to map", val.user.location)
  
          var image; // Define the image variable within the scope
  
          if (val.text.includes("#climatechange") && val.text.includes("#NetZero")) {
            // If both climate change and net zero are present
            image = "./images/combined.png";
          } else if (val.text.includes("#climatechange")) {
            // If climate change is present but net zero is not
            image = "./images/climatechange.png";
          } else if (val.text.includes("#NetZero")) {
            // If net zero is present but climate change is not
            image = "./images/netzero.png";
          }

          // Get location details from Google Geocoding API
          $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${val.user.location}&key=YOUR_API_KEY`
          ,
          function (result) {
              console.log(result.results[0]);

          if (result.results[0].formatted_address && result.results[0].formatted_address.includes("UK", "england", "scotland", "wales",)){  // Check if location includes "United Kingdom"
  
              var marker = new google.maps.Marker({
                position: result.results[0].geometry.location,
                icon: image,
                label: labels[labelIndex++ % labels.length],
                draggable: false,
                animation: google.maps.Animation.DROP,
                map: map,
              });
  
              markers.push(marker)

              marker.addListener("click", function() {
                // Store latitude and longitude in destination variable
                destination = val.user.location;
                console.log(destination)

                console.log("get directions");
                let request = {
                  origin: origin,
                  destination: destination,
                  travelMode: google.maps.TravelMode.WALKING
                };

                // Store latitude and longitude 
                lat = result.results[0].geometry.location.lat
                lng = result.results[0].geometry.location.lng
                $.getJSON(
                  "http://api.geonames.org/findNearByWeatherJSON?lat=" +
                    lat +
                    "&lng=" +
                    lng +
                    "&username=mehtabgill1907",
                  function (result) {
                    console.log(result);

                    var weather = result.weatherObservation;

                    if (weather !== null) {
                      $('#weather').empty(); // Clear previous weather data
                      $('#weather').append('<p> Location: ' + weather.stationName + '</p>');
                      $('#weather').append('<p> clouds: ' + weather.clouds + '</p>');
                      $('#weather').append('<p>temperature : ' + weather.temperature + '</p>');
                    //  $('#weather').append('<p> windspeed: ' + weather.windspeed + '</p>');
                    //  $('#weather').append('<p> Conditions: ' + weather.weatherConditions + '</p>');
                    } else {
                      $('#weather').empty(); // Clear previous weather data
                      $('#weather').append('<p> No data available </p>');
                    }
                  }
                );
                
                //add a variable to call the directions service
                let directionsService = new google.maps.DirectionsService();
                //add a variable to display the directions
                let directionsDisplay = new google.maps.DirectionsRenderer();

                //send the request to the directionService to get the route
                directionsService.route(request, function(response, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                          
                    //set the directionsDisplay to the map object
                    directionsDisplay.setMap(map);
                    
                    //The Google Maps API prefers us to access the element using standard JavaScript
                    directionsDisplay.setPanel(document.getElementById("directionsPanel"));	
                    //now we get the response data from our distance service request and display it on the directions panel
                    directionsDisplay.setDirections(response);							
                  }
                });
              });
  
              var infoWindow = new google.maps.InfoWindow({
                content:
                  "<dt>" +
                  val.user.name +
                  "</dt>" +
                  "<dd>" +
                  val.text +
                  "</dd>" +
                  "<dd>" +
                  val.user.location +
                  "</dd>"
              });
  
              marker.addListener("mouseover", function() {
                infoWindow.open(map, marker);
              });
  
              marker.addListener("mouseout", function() {
                infoWindow.close();
              });
            }
            }
          );

            // code was inspired from a workshop
            $.getJSON(
              "http://api.geonames.org/findNearByWeatherJSON?lat=" +
                lat +
                "&lng=" +
                lng +
                "&username=mehtabgill1907",
              function (result) {
                console.log(result);

                var myObj = result.weatherObservation;

                if (myObj !== null) {
                  $('#weather').empty(); // Clear previous weather data
                  $('#weather').append('<p> Location: ' + myObj.stationName + '</p>');
                  $('#weather').append('<p> clouds: ' + myObj.clouds + '</p>');
                  $('#weather').append('<p>temperature : ' + myObj.temperature + '</p>');
                } else {
                  $('#weather').empty(); // Clear previous weather data
                  $('#weather').append('<p> No data available </p>');
                }
                }
              );

        }
  });
  
      $("<dl/>", {
        class: "tweet-list",
        html: filteredItems.join(""),
      }).appendTo("#tweets");
  
      console.log("Filtered tweets with #climatechange and/or #netzero:");

    }).fail(function() {
      console.log("An error has occurred.");
    });
  }

  initMap();		

});