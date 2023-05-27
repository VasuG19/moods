//use jQuery to assess when the document is ready 
$(document).ready(function(){
  let origin1="";
  let destinationA="";
  let map;
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let labelIndex = 0;

  initMap();		
  loadData();

  function initMap(){
    let myLatlng = new google.maps.LatLng( 54.9712913, -1.6175957);
    let mapOptions = {
      center: myLatlng,
      zoom: 16,
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

    google.maps.event.addListener(map, "click", (event) => {
      addMarker(event.latLng, map);
    });
    addMarker(myLatlng, map);

    const image = "./images/pizza.png";
    const marker =  new google.maps.Marker({
      position: myLatlng,
      map,
      icon: image,
      title: "My Delhi",
    });
    marker.setMap(map);

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

    let infoWindow = new google.maps.InfoWindow({
      content: "Click the map to get Lat/Lng!",
      position: myLatlng,
    });

    infoWindow.open(map);
    // Configure the click listener.
    map.addListener("click", (mapsMouseEvent) => {
      // Close the current InfoWindow.
      infoWindow.close();
      // Create a new InfoWindow.
      infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      );
      infoWindow.open(map);
      
    });

  }

  // add marker function
  function addMarker(location, map) {
    new google.maps.Marker({
      position: location,
      label: labels[labelIndex++ % labels.length],
      draggable:true,
      animation: google.maps.Animation.DROP,
      map: map,
    });
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

  function loadData(){

    $.getJSON("/data/twitter_workshop.json", function(data){
      //access the Twitter data and do something with it here

        console.log("Data loaded correctly");
        console.log("There are " + data.statuses.length + " Twitter statuses within the dataset");

        $("main").prepend("<p>There are " + data.statuses.length + " Twitter statuses within the dataset</p>")

        $.each( data.statuses, function( key, val ) {
          console.log("username:" + val.user.name);
          console.log( "tweet:" + val.text);
        });

        // create an array to store your data in
        var items = [];
        $.each(data.statuses, function(key, val) {
          items.push("<dt>" + val.user.name + "</dt>" + "<dd>" + val.text + "</dd>");

          if (val.place) {
            items.push("<dd>" + val.place.name + "</dd>" + "<dd>" + val.place.country + "</dd> <hr>");

              // Create a geocoder instance
              var geocoder = new google.maps.Geocoder();

              // Make a geocoding request
              geocoder.geocode({ address: val.place.name }, function(results, status) {
                if (status === 'OK') {
                  // Retrieve the first result
                  var location = results[0].geometry.location;

                  var marker = new google.maps.Marker({
                    position: location,
                    label: labels[labelIndex++ % labels.length],
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    map: map,
                  });

                  var infoWindow = new google.maps.InfoWindow({
                      content: "<dt>" + val.user.name + "</dt>" + "<dd>" + val.text + "</dd>" + "<dd>" 
                                    + val.place.name + "</dd>" + "<dd>" + val.place.country + "</dd>"
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
            items.push("<dd>Place Unavailable</dd>");
            items.push("<dd>Country Unavailable</dd>");
          }

          if (val.text.includes("#love") && val.text.includes("#food")) {
            console.log("username: " + val.user.name);
            console.log("tweet: " + val.text);
          }
        });

        $( "<dl/>", {
          "class": "tweet-list",
          html: items.join( "" )
        }).appendTo( "#tweets" );

      }).fail(function(){
        console.log("An error has occurred.");
    });
  }


});