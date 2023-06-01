<?php

	// much of this code is taken from the workshops during lectures

	require_once __DIR__.'/vendor/autoload.php';
	session_start();

	$client = new Google\Client();
	$client->setAuthConfig('client_secret.json');
	$client->addScope ("https://www.googleapis.com/auth/userinfo.email");

	if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
		$client->setAccessToken($_SESSION['access_token']);
	} else {
		$redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php'; 
		header('Location: ' . filter_var ($redirect_uri, FILTER_SANITIZE_URL));
	}

	if ($_SERVER['REQUEST_METHOD'] == "POST" and isset($_POST['signOut'])){
		$client->revokeToken($_SESSION['access_token']);
		session_destroy();
		$redirect = 'http://' . $_SERVER['HTTP_HOST'].'/index.php';
		header('Location: ' . filter_var ($redirect, FILTER_SANITIZE_URL));
	}
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Current Moods</title>
    <link rel="stylesheet" href="index.css">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

</head>

<body style="background-color:#33475b">
    <header>
        <h1>Living Planet</h1>
    </header>
    <main>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"
            integrity="sha512-pumBsjNRGGqkPzKHndZMaAG+bir374sORyzM3uulLV14lN5LyykqNk8eEeUlUkB3U0M4FApyaHraT65ihJhDpQ=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="index.js"></script>
        <script
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBheRpxkKxog-dafcCU6Fz_cIFxU8OJsX8&callback=initMap"
            async defer></script>

        <div class="options">
            <form action='index.php' method='post'>
                <input class="btn btn-primary" type='submit' name='signOut' value='Sign Out' />
            </form>
        </div>

        <div class="options">
            <a href="about.html" class="btn btn-primary">About Us</a> <!-- Added link to about page -->
        </div>

        <div id="container">

            <div class="top">
                <div id="weather"></div>

                <div class="tweets">
                    <div id="tweets"></div>
                </div>
            </div>
            <div id="map-area"></div>


            <div>
                <div id="directionsPanel"></div>
            </div>

        </div>

    </main>
    <footer>Google Maps API Distance Service</footer>

</body>

</html>