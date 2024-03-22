<?php

	// Code inspired from workshop code conducted during in-class sessions

	require_once __DIR__.'/vendor/autoload.php'; // Include the autoload file from the Composer-generated vendor folder
	session_start(); // Start the session to maintain user data across requests

	$client = new Google\Client(); // Create a new Google Client instance

    // Set the client secret data
	$client->setAuthConfig('client_secret.json');

    // Add a scope for validation
	$client->addScope("https://www.googleapis.com/auth/userinfo.email");

    // Check whether the user is logged in
	if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
		$client->setAccessToken($_SESSION['access_token']); // Set the user token if the user is authenticated
	} else {
		$redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php'; // Redirect unauthenticated user
		header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
	}

	if ($_SERVER['REQUEST_METHOD'] == "POST" and isset($_POST['signOut'])){ // Sign out function 
		$client->revokeToken($_SESSION['access_token']); // Revoke the access token
		session_destroy(); // Destroy the session
		$redirect = 'http://' . $_SERVER['HTTP_HOST'].'/index.php'; // Redirect the user after logging out and destroying the token
		header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
	}
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Current Moods</title>
    <link rel="stylesheet" href="index.css">

    <!-- Include Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <!-- Include Polyfill for older browser compatibility -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

</head>

<body style="background-color:#33475b">
    <header>
        <h1>Living Planet</h1>
    </header>
    <main>

        <!-- Include jQuery -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"
            integrity="sha512-pumBsjNRGGqkPzKHndZMaAG+bir374sORyzM3uulLV14lN5LyykqNk8eEeUlUkB3U0M4FApyaHraT65ihJhDpQ=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="index.js"></script> <!-- Include custom JavaScript file -->

        <!-- Include Google Maps JavaScript API with API key and callback function -->
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" <!-- Replace YOUR_API_KEY with your actual Google Maps API key -->
            async defer></script>

        <!-- Sign out button -->
        <div class="options">
            <form action='index.php' method='post'>
                <input class="btn btn-primary" type='submit' name='signOut' value='Sign Out' />
            </form>
        </div>
        
        <!-- Link to home page -->
        <div class="options">
            <a href="index.php" class="btn btn-primary">Home page</a>
        </div>

        <!-- About section -->
        <div id="container" class="about">
            <div class="text">
                <h2> About Us </h2>

                <p> We are a national heritage organization with a sustainable objective to be climate positive by 2030. </p>

                <p> This is a hybrid web application using content from more than one source to create a new service – in this case, a website that enables information about climate change to be visualized on a map.</p>
            </div>

            <h2> References</h2>
            <p>https://www.geonames.org</p>
            <p>https://developers.google.com/maps</p>
            <p>https://developer.twitter.com/en/docs/twitter-api</p>
        </div>

    </main>
    <footer>Google Maps API Distance Service</footer>

</body>

</html>
