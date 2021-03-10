<?php

require_once '../../mysqliconn.php';

require_once 'vendor/autoload.php';

require_once 'model/ManuscriptMetaData.inc';
require_once 'model/Transliteration.inc';
require_once 'model/User.inc';

use tlh_dig\model\{ManuscriptIdentifier, ManuscriptMetaData, Transliteration, User};

/**
 * @param string $sql
 * @param ?Closure $bindParams
 * @param Closure $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_select_query(string $sql, ?Closure $bindParams, Closure $f) {
  $connection = connect_to_db();

  $statement = $connection->prepare($sql);
  if (!$statement) {
    $connection->close();
    throw new Exception("Could not prepare statement: " . $connection->error);
  }

  $paramsBound = $bindParams === null || $bindParams($statement);
  if (!$paramsBound) {
    $statement->close();
    $connection->close();
    throw new Exception("Could not bind params: " . $statement->error);
  }

  $executed = $statement->execute();
  if (!$executed) {
    $statement->close();
    $connection->close();
    throw new Exception("Could not execute statement: " . $statement->error);
  }

  $stmtResult = $statement->get_result();
  if (!$stmtResult) {
    $statement->close();
    $connection->close();
    throw new Exception("Could not get result: " . $statement->error);
  }

  $result = $f($stmtResult);

  $stmtResult->close();
  $statement->close();
  $connection->close();

  return $result;
}

/**
 * @return ManuscriptMetaData[]
 */
function allManuscriptMetaData(): array {
  $sql = "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas;";

  try {
    return execute_select_query(
      $sql,
      null,
      fn(mysqli_result $result): array => array_map(
        fn(array $row): ManuscriptMetaData => ManuscriptMetaData::fromDbAssocArray($row),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $e) {
    error_log($e);
    return [];
  }
}

function manuscriptMetaDataById(string $mainIdentifier): ?ManuscriptMetaData {
  $sql = "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    where main_identifier = ?;";

  try {
    return execute_select_query(
      $sql,
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
      function (mysqli_result $result) use ($mainIdentifier): ?ManuscriptMetaData {
        $fetched = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        return $fetched ? ManuscriptMetaData::fromDbAssocArray($fetched) : null;
      });
  } catch (Exception $e) {
    error_log($e);
    return null;
  }
}

/**
 * @param string $mainIdentifier
 * @return ManuscriptIdentifier[]
 */
function getOtherIdentifiers(string $mainIdentifier): array {
  $sql = "select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;";

  try {
    return execute_select_query(
      $sql,
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(mysqli_result $result): array => array_map(
        fn(array $row): ManuscriptIdentifier => ManuscriptIdentifier::fromDbAssocArray($row),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $e) {
    return array();
  }
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
    $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->identifierType, $mmd->palaeographicClassification, $mmd->palaeographicClassificationSure,
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
    $otherIdentifierInsertStatement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->identifierType);

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

  try {
    return execute_select_query(
      $sql,
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      function (mysqli_result $result): ?User {
        $userArray = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        return $userArray ? User::fromDbAssocArray($userArray) : null;
      });
  } catch (Exception $e) {
    return null;
  }
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
 * @return ?Transliteration[]
 */
function getTransliterations(string $mainIdentifier): ?array {
  $sql = "select main_identifier, side, version, input, result_xml from tlh_dig_transliterations where main_identifier = ?;";

  try {
    return execute_select_query(
      $sql,
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      function (mysqli_result $result): ?array {
        $allRows = $result->fetch_all(MYSQLI_ASSOC);

        return count($allRows) === 0
          ? null
          : array_map(
            fn(array $x) => new Transliteration($x['main_identifier'], $x['side'], $x['version'], $x['input'], $x['result_xml']),
            $allRows
          );
      });
  } catch (Exception $e) {
    return null;
  }
}
