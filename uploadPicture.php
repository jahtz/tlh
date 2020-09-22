<?php


require_once './sql_queries.inc';


$allowedFileTypes = ['png', 'jpg', 'jpeg', 'gif'];

$manuscriptId = $_GET['id'];

// check if manuscript exists
if (!manuscriptMetaDataById($manuscriptId)) {
  exit('No such manifest exists!');
}

$targetDir = "./uploads/$manuscriptId/";

if (count($_FILES) == 0) {
  exit('No files!');
}

$file = $_FILES['file'];

// check if uploaded file is image
if (getimagesize($file['tmp_name']) === false) {
  exit('File is no image!');
}

$targetFileName = basename($file['name']);

$targetFile = $targetDir . $targetFileName;

// check
$imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
if (!in_array($imageFileType, $allowedFileTypes)) {
  exit("File type $imageFileType is not allowed!");
}

if (file_exists($targetFile)) {
  exit('File already exists!');
}

if (!file_exists($targetDir)) {
  mkdir($targetDir);
}

$fileSaved = move_uploaded_file($file['tmp_name'], $targetFile);
if (!$fileSaved) {
  exit('File could not be saved');
}

echo(json_encode(["fileName" => $targetFileName]));

