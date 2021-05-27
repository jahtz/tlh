<?php

if (file_exists("./public/index.html")) {
  header("Location: ./public/");
} else {
  header("Location: /graphiql.php");
}
exit;
