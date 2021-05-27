<?php

$uri = $_SERVER["REQUEST_URI"];

if (substr_compare($uri, "/", -strlen("/")) !== 0 and is_dir('html/' . $uri)) {
  # URI ends without slash but a directory requested
  header("Location: $uri/");
  exit;
} else {
  return false;
}
