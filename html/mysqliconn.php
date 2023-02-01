<?php
const host = '127.0.0.1';
const user = 'hpm';
const password = '1234';
const database = 'hpm';
const port = 3406;

function connect_to_db(): mysqli
{
  $db = mysqli_connect(host, user, password, database, port);

  if ($db) {
    return $db;
  } else {
    die('Could not open db!');
  }
}