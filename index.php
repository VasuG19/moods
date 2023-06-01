<?php

// much of this code is taken from the workshops during lectures

require_once __DIR__.'/vendor/autoload.php';
session_start();

$client = new Google\Client();
$client->setAuthConfig('client_secret.json');
$client->addScope ("https://www.googleapis.com/auth/userinfo.email");

if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
	$client->setAccessToken($_SESSION['access_token']);
    $direct = 'http://' . $_SERVER['HTTP_HOST'].'/index.html';
	header('Location: ' . filter_var ($direct, FILTER_SANITIZE_URL));
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