<?php

// much of this code is taken from the workshops during lectures

require_once __DIR__.'/vendor/autoload.php';
session_start();

$client = new Google\Client();
$client->setAuthConfigFile('client_secret.json');
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php'); 
$client->addScope ("https://www.googleapis.com/auth/userinfo.email");

if (! isset($_GET['code'])) {
	$auth_url = $client->createAuthUrl();
	header('Location:' . filter_var ($auth_url, FILTER_SANITIZE_URL));
	echo $auth_url;
} else {
	$client->authenticate($_GET['code']);
	$_SESSION['access_token'] = $client->getAccessToken();
	$redirect_uri = 'http://'.$_SERVER['HTTP_HOST'] . '/index.php'; 
	header('Location:' . filter_var ($redirect_uri, FILTER_SANITIZE_URL));
}

?>