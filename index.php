<?php
$versions = array_filter(
  array_filter(glob('*'), 'is_dir'),
  fn($version) => $version !== 'TLHaly' /*&& $version !== 'stable' && $version !== 'release'*/
);
?>
<!doctype html>
<html lang="de">
  <head>
    <title>HethPort3 - TLH Beta Server</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div class="container mx-auto">
      <h1 class="my-4 font-bold text-2xl text-center">TLH Beta server</h1>

      <div class="grid grid-cols-3 gap-2">

        <?php foreach ($versions as $version): ?>
          <div class="my-3">

            <a class="p-2 block rounded-t bg-blue-500 text-white text-center" href="./<?php echo $version; ?>">
              &hookrightarrow; <?php echo $version; ?>
            </a>

            <div class="p-2 border-x border-b border-slate-500">
              <?php
              if (file_exists("./$version.html")) {
                include_once "./$version.html";
              } else {
                echo '<p class="italic text-center">No information provided.</p>';
              }
              ?>
            </div>

          </div>
        <?php endforeach; ?>

      </div>

    </div>
  </body>
</html>
