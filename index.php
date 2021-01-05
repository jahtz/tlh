<?php

if (file_exists("./public/index.html")) {
  header("Location: ./public/");
} else {
  header("Location: /tlh_dig/graphiql.php");
}
exit;
