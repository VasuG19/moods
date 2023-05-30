//use jQuery to assess when the document is ready 
$(document).ready(function(){
  let origin="NE1 8ST";
  let destination="";
  let map;
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let labelIndex = 0;
  var markers = [];
  var bounds = new google.maps.LatLngBounds(); // Declare the 'bounds' variable here

  async function initMap(){
    
    let myLatlng = new google.maps.LatLng( 54.9712913, -1.6175957);
    let mapOptions = {
      center: myLatlng,
      zoom:100,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: true,
      overviewMapControl: false,
      rotateControl: false,
      scaleControl: false,
      panControl: false,
    };

    map = new google.maps.Map(document.getElementById("map-area"), mapOptions);	
    
    // Call the function to update the map bounds
    updateMapBounds();

  }

  function loadData() {
    $.getJSON("./data/kf6013_assignment_data.json", function(data) {
      // Access the Twitter data and do something with it here
  
      console.log("Data loaded correctly");
      console.log("There are " + data.statuses.length + " Twitter statuses within the dataset");
    
      // Create an array to store the filtered data in
      var filteredItems = [];
      $.each(data.statuses, function(key, val) {

        // add tweets with specific hashtag to list
        if (val.text.includes("#climatechange") || val.text.includes("#NetZero")) {
          filteredItems.push("<dt>" + val.user.name + "</dt>" + "<dd>" + val.text + "</dd>");
          if (val.user.location) {
            filteredItems.push("<dd>" + val.user.location + "</dd>" + "<hr>");

  
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
  
          // Create a geocoder instance
          var geocoder = new google.maps.Geocoder();
  
          // Make a geocoding request
          geocoder.geocode({ address: val.user.location }, function(results, status) {
            if (status === "OK") {
              // Retrieve the first result
              var location = results[0].geometry.location;
  
              var marker = new google.maps.Marker({
                position: location,
                icon: image,
                label: labels[labelIndex++ % labels.length],
                draggable: false,
                animation: google.maps.Animation.DROP,
                map: map,
              });
  
              markers.push(marker)
              bounds.extend(marker.getPosition());

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
          });
          } else {
            // Handle the case when val.place is null or undefined
            filteredItems.push("<dd>location Unavailable</dd><hr>");
          }
        }
      });
  
      $("<dl/>", {
        class: "tweet-list",
        html: filteredItems.join(""),
      }).appendTo("#tweets");
  
      console.log("Filtered tweets with #climatechange and/or #netzero:");

      updateMapBounds(); // Call the function to update the map bounds

    }).fail(function() {
      console.log("An error has occurred.");
    });
  }

  function updateMapBounds() {
    bounds = new google.maps.LatLngBounds();
  
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].getPosition());
    }
  
    map.fitBounds(bounds);
  }

  initMap();		
  loadData();

});