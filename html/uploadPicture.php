<?php

require_once './sql_queries.inc';
require_once 'cors.inc';

cors();


function fileTypeAllowed(string $fileType): bool {
  return in_array($fileType, ['png', 'jpg', 'jpeg', 'gif']);
}

/**
 * @param string $manuscriptId
 * @return string
 * @throws Exception
 */
function doUpload(string $manuscriptId): string {
  // check if manuscript exists
  if (!manuscriptMetaDataById($manuscriptId)) {
    throw new Exception('No such manifest exists!');
  }

  if (count($_FILES) == 0) {
    throw new Exception('No files were uploaded!');
  }

  $file = $_FILES['file'];

  // check if uploaded file is image
  if (getimagesize($file['tmp_name']) === false) {
    throw new Exception('File is no image!');
  }

  $targetFileName = basename($file['name']);

  $targetDir = "./uploads/$manuscriptId/";

  $targetFile = $targetDir . $targetFileName;

// check
  $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
  if (!fileTypeAllowed($imageFileType)) {
    throw new Exception("File type $imageFileType is not allowed!");
  }

  if (file_exists($targetFile)) {
    throw new Exception('File already exists!');
  }

  if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
  }

  $fileSaved = move_uploaded_file($file['tmp_name'], $targetFile);
  if (!$fileSaved) {
    throw new Exception('File could not be saved');
  }

  return $targetFileName;
}


$manuscriptId = $_GET['id'];

try {
  $targetFileName = doUpload($manuscriptId);

  echo(json_encode(["fileName" => $targetFileName]));
} catch (Exception $e) {
  echo(json_encode(["error" => $e->getMessage()]));
}
