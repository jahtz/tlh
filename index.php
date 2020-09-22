<?php
$appFolder = './app/';

if (file_exists($appFolder)) {
  header("Location: $appFolder");
  exit();
} else {
  error_log("Folder $appFolder does not exist!");
}
?>
<!doctype html>
<html lang="de">
  <head>
    <title>TLH_dig</title>
  </head>
  <body>
    <h1>TLH dig...</h1>

    <a href="graphiql.php">GrahiQL</a>
  </body>
</html>