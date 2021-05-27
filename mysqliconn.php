<?php
$host = '127.0.0.1';
$user = 'hpm';
$password = '1234';
$PaWo = $password;
$database = 'hpm';
$port = 3406;


function connect_to_db(): mysqli {
  global $host, $user, $password, $database, $port;

  $db = mysqli_connect($host, $user, $password, $database, $port);

  if ($db) {
    return $db;
  } else {
    die('Could not open db!');
  }
}