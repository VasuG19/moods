<?php

	// much of this code is taken from the workshops during lectures

	require_once __DIR__.'/vendor/autoload.php'; // Include the autoload file from the Composer-generated vendor folder
	session_start(); // Start the session to maintain user data across requests

	$client = new Google\Client(); // Create a new Google Client instance
	$client->setAuthConfigFile('client_secret.json'); // Set the authentication configuration file
	$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php'); // Set the redirect URI for OAuth callbacks
	$client->addScope("https://www.googleapis.com/auth/userinfo.email"); // Add the scope for accessing user email information

	if (!isset($_GET['code'])) {
		// If the authorization code is not present in the URL parameters

		$auth_url = $client->createAuthUrl(); // Generate the authorization URL
		header('Location:' . filter_var($auth_url, FILTER_SANITIZE_URL)); // Redirect the user to the authorization URL
		echo $auth_url; // Output the authorization URL (this might not be necessary)
	} else {
		// If the authorization code is present in the URL parameters

		$client->authenticate($_GET['code']); // Authenticate the client using the received authorization code
		$_SESSION['access_token'] = $client->getAccessToken(); // Store the access token in the session
		$redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/index.php'; // Set the redirect URI after authentication
		header('Location:' . filter_var($redirect_uri, FILTER_SANITIZE_URL)); // Redirect the user to the specified URI
	}

?>
