<?php

require_once '../../mysqliconn.php';

require_once 'vendor/autoload.php';

require_once 'model/ManuscriptMetaData.inc';
require_once 'model/TransliterationLine.inc';
require_once 'model/User.inc';

use tlh_dig\model\{ManuscriptIdentifier, ManuscriptMetaData, TransliterationLine, User};

/**
 * @return ManuscriptMetaData[]
 */
function allManuscriptMetaData(): array {
  $sql = "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas;";

  $manuscripts = array();

  $connection = connect_to_db();

  $statement = $connection->prepare($sql);

  if ($statement) {

    if ($statement->execute()) {
      $result = $statement->get_result();

      if ($result) {
        foreach ($result->fetch_all(MYSQLI_ASSOC) as $row) {
          $manuscripts[] = ManuscriptMetaData::fromDbAssocArray($row);
        }
        $result->close();
      }
    }

    $statement->close();
  }

  $connection->close();

  return $manuscripts;
}

function manuscriptMetaDataById(string $mainIdentifier): ?ManuscriptMetaData {
  $sql = "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    where main_identifier = ?;";

  $fetched = null;

  $connection = connect_to_db();

  $statement = $connection->prepare($sql);

  if ($statement) {
    $paramsBound = $statement->bind_param('s', $mainIdentifier);

    if ($paramsBound && $statement->execute()) {

      $result = $statement->get_result();

      if ($result) {
        $fetched = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        $result->close();
      }

    }
    $statement->close();
  }

  $connection->close();

  return $fetched ? ManuscriptMetaData::fromDbAssocArray($fetched) : null;
}

/**
 * @param string $mainIdentifier
 * @return ManuscriptIdentifier[]
 */
function getOtherIdentifiers(string $mainIdentifier): array {
  $sql = "select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;";

  $otherIdentifiers = [];

  $connection = connect_to_db();

  $statement = $connection->prepare($sql);

  if ($statement) {
    $paramsBound = $statement->bind_param('s', $mainIdentifier);

    if ($paramsBound && $statement->execute()) {

      $result = $statement->get_result();

      if ($result) {
        foreach ($result->fetch_all(MYSQLI_ASSOC) as $row) {
          $otherIdentifiers[] = ManuscriptIdentifier::fromDbAssocArray($row);
        }

        $result->close();
      }
    }

    $statement->close();
  }
  $connection->close();

  return $otherIdentifiers;
}

function insertManuscriptMetaData(ManuscriptMetaData $mmd): bool {
  $db = connect_to_db();

  $mainInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);");

  $otherIdentifierInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)");


  if (!$mainInsertStatement || !$otherIdentifierInsertStatement) {
    error_log('Could not prepare insert statements!');
    return false;
  }

  $db->begin_transaction();

  # insert main data

  $mainBindParams = $mainInsertStatement->bind_param(
    'sssisisss',
    $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->type, $mmd->palaeographicClassification, $mmd->palaeographicClassificationSure,
    $mmd->provenance, $mmd->cthClassification, $mmd->bibliography, $mmd->status, $mmd->creatorUsername
  );

  if (!$mainBindParams) {
    error_log('Could not bind main insert statement params: ' . $mainInsertStatement->error);

    $mainInsertStatement->close();
    $otherIdentifierInsertStatement->close();
    $db->rollback();
    $db->close();

    return false;
  }

  if (!$mainInsertStatement->execute()) {
    error_log('Could not execute main insert statement: ' . $mainInsertStatement->error);

    $mainInsertStatement->close();
    $otherIdentifierInsertStatement->close();
    $db->rollback();
    $db->close();

    return false;
  }

  $mainInsertStatement->close();

  # insert other identifiers

  $mainIdentifier = $mmd->mainIdentifier->identifier;

  $allOtherIdentifiersInserted = true;
  foreach ($mmd->otherIdentifiers as $identifier) {
    $otherIdentifierInsertStatement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->type);

    if (!$otherIdentifierInsertStatement->execute()) {
      error_log("Could not insert other identifier " . json_encode($identifier) . " into database: " . $otherIdentifierInsertStatement->error);

      $allOtherIdentifiersInserted = false;
    }
  }

  $otherIdentifierInsertStatement->close();

  if (!$allOtherIdentifiersInserted) {
    $db->rollback();

    $result = false;
  } else {
    $db->commit();

    $result = true;
  }

  $db->close();
  return $result;
}

function maybeUserFromDatabase(string $username): ?User {
  $sql = "select username, pw_hash, name, affiliation, email from tlh_dig_users where username = ?;";

  $connection = connect_to_db();

  $userArray = null;

  $statement = $connection->prepare($sql);

  if ($statement) {
    $paramsBound = $statement->bind_param('s', $username);

    if ($paramsBound && $statement->execute()) {

      $result = $statement->get_result();

      if ($result) {
        $userArray = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        $result->close();
      }
    }

    $statement->close();
  }

  $connection->close();

  return $userArray ? User::fromDbAssocArray($userArray) : null;
}

function insertUserIntoDatabase(User $user): bool {
  $sql = "insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);";

  $result = false;

  $db = connect_to_db();

  $statement = $db->prepare($sql);
  if ($statement) {
    $statement->bind_param('sssss', $user->username, $user->pwHash, $user->name, $user->affiliation, $user->email);

    $result = $statement->execute();

    $statement->close();
  }

  $db->close();

  return $result;
}

/**
 * @param string $mainIdentifier
 * @return TransliterationLine[]
 */
function getTransliterationResultLines(string $mainIdentifier): ?array {
  $linesQuery = "select * from tlh_dig_transliteration_lines where main_identifier = ? order by line_index;";
  $wordsQuery = "select * from tlh_dig_transliteration_word_contents where main_identifier = ? order by line_index, word_index, content_index;";

  $conn = connect_to_db();

  $allRows = null;
  $allWordsRows = [];

  $linesStatement = $conn->prepare($linesQuery);
  if ($linesStatement) {
    $linesParamsBound = $linesStatement->bind_param('s', $mainIdentifier);

    if ($linesParamsBound && $linesStatement->execute()) {
      $linesResult = $linesStatement->get_result();

      if ($linesResult) {
        $allRows = $linesResult->fetch_all(MYSQLI_ASSOC);
        $linesResult->close();
      }
    }

    $linesStatement->close();
  }

  if ($allRows === null || count($allRows) === 0) {
    $conn->close();
    return null;
  }

  $wordsStatement = $conn->prepare($wordsQuery);
  if ($wordsStatement) {
    $wordsParamsBound = $wordsStatement->bind_param('s', $mainIdentifier);

    if ($wordsParamsBound && $wordsStatement->execute()) {
      $wordsResult = $wordsStatement->get_result();

      if ($wordsResult) {
        $allWordsRows = $wordsResult->fetch_all(MYSQLI_ASSOC);
        $wordsResult->close();
      }
    }

    $wordsStatement->close();
  }

  $conn->close();

  $wordContents = [];
  foreach ($allWordsRows as $wordRow) {
    $lineIndex = $wordRow['line_index'];
    $wordIndex = $wordRow['word_index'];
    $contentIndex = $wordRow['content_index'];

    $wordContents[$lineIndex][$wordIndex][$contentIndex] = $wordRow;
  }

  return array_map(function ($x) use ($wordContents): TransliterationLine {
    $lineIndex = $x['line_index'];
    $wordsForLine = array_key_exists($lineIndex, $wordContents) ? $wordContents[$lineIndex] : null;

    return TransliterationLine::fromDbAssocArray($x, $wordsForLine);
  }, $allRows);
}
