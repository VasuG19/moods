//use jQuery to assess when the document is ready 
$(document).ready(function(){
  let origin1="";
  let destinationA="";
  let map;
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let labelIndex = 0;
  var markers = [];
  var bounds = new google.maps.LatLngBounds(); // Declare the 'bounds' variable here

  initMap();		
  loadData();

  function initMap(){
    
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
    
    origin1 = "Haymarket, Newcastle upon Tyne";
    destinationA = "Central Station, Newcastle upon Tyne";

    //create a new instance of the DistanceMatrixService
    let service = new google.maps.DistanceMatrixService();

    //call the getDistanceMatrix method on the DistanceMatrixService
    service.getDistanceMatrix(
    {
        origins: [origin1],
        destinations: [destinationA],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,		
        avoidHighways: false,
        avoidTolls: false
      //when the service responds run the callback function
    }, callback);

    updateMapBounds(); // Call the function to update the map bounds

  }

  //get the response and status details from the call to the getDistanceMatrix
  function callback(response, status) {
      if (status == google.maps.DistanceMatrixStatus.OK) {      
        let origins = response.originAddresses;
        let destinations = response.destinationAddresses;
      $.each(origins, function (originIndex){
        let results = response.rows[originIndex].elements;
        $.each(results, function (resultIndex){
          let element = results[resultIndex];
          let distance = element.distance.text;
                let duration = element.duration.text;
                let from = origins[originIndex];
                let to = destinations[resultIndex];
            $("#distance-info").prepend("<dl id='distance-dl'><dt>Distance: </dt><dd>" + distance + "</dd> <dt>Duration: </dt><dd>" + duration + "</dd> <dt>From: </dt><dd>" + from + "</dd> <dt>To: </dt><dd>" + to + "</dd> </dl>");
        });
      });
    }
  }
  
  $("#btnGetDirections").click(function(){
    console.log("get directions");
    let request = {
      origin: origin1,
      destination: destinationA,
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

  function loadData() {
    $.getJSON("/data/kf6013_assignment_data.json", function(data) {
      // Access the Twitter data and do something with it here
  
      console.log("Data loaded correctly");
      console.log("There are " + data.statuses.length + " Twitter statuses within the dataset");
    
      // Create an array to store the filtered data in
      var filteredItems = [];
      $.each(data.statuses, function(key, val) {
        if (val.text.includes("#climatechange") || val.text.includes("#netzero")) {
          filteredItems.push("<dt>" + val.user.name + "</dt>" + "<dd>" + val.text + "</dd>");
          if (val.user.location) {
            filteredItems.push("<dd>" + val.user.location + "</dd>" + "<hr>");
          } else {
            // Handle the case when val.place is null or undefined
            filteredItems.push("<dd>Place Unavailable</dd>");
            filteredItems.push("<dd>Country Unavailable</dd><hr>");
          }
        }
  
  
        if (val.user.location) {
  
          var image; // Define the image variable within the scope
  
          if (val.text.includes("#climatechange") && val.text.includes("#NetZero")) {
            // If both climate change and net zero are present
            image = "./images/combined.png";
          } else if (val.text.includes("#climatechange") && !val.text.includes("#NetZero")) {
            // If climate change is present but net zero is not
            image = "./images/climatechange.png";
          } else if (val.text.includes("#NetZero") && !val.text.includes("#climatechange")) {
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
        }
      });
  
  
      $("<dl/>", {
        class: "tweet-list",
        html: filteredItems.join(""),
      }).appendTo("#tweets");
  
      updateMapBounds(); // Call the function to update the map bounds
      console.log("Filtered tweets with #climatechange and/or #netzero:");
      console.log(filteredItems);
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

});