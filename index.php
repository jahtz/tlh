<!doctype html>
<html lang="de">
  <head>
    <title>HethPort3 - TLH Beta Server</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    <style>
      .navbar {
        margin-bottom: 30px;
      }
    </style>
  </head>
  <body>
    <nav class="navbar is-dark"></nav>

    <div class="container">
      <h1 class="title is-3 has-text-centered">TLH Beta server</h1>

      <?php if (file_exists("./stable/index.php")): ?>
        <div class="my-3">
          <a href="./stable" class="button is-link is-fullwidth">Stable-Version</a>
        </div>
      <?php endif; ?>

      <?php if (file_exists("./release/index.php")): ?>
        <div class="my-3">
          <a href="release" class="button is-link is-fullwidth">Release-Version</a>
        </div>
      <?php endif; ?>

    </div>
  </body>
</html>
