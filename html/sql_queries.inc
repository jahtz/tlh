<?php

require_once __DIR__ . '/../mysqliconn.php';

require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/model/ManuscriptMetaData.inc';
require_once __DIR__ . '/model/Transliteration.inc';
require_once __DIR__ . '/model/User.inc';

use tlh_dig\model\{ManuscriptIdentifier, ManuscriptMetaData, User};


/**
 * @param mysqli $connection
 * @param string $sql
 * @param Closure|null $bindParams
 * @param Closure $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_query(mysqli $connection, string $sql, ?Closure $bindParams, Closure $f) {
  $statement = $connection->prepare($sql);
  if (!$statement) {
    throw new Exception("Could not prepare statement: " . $connection->error);
  }

  $paramsBound = $bindParams === null || $bindParams($statement);
  if (!$paramsBound) {
    $errorMsg = $statement->error;
    $statement->close();
    throw new Exception("Could not bind params: " . $errorMsg);
  }

  $executed = $statement->execute();
  if (!$executed) {
    $errorMsg = $statement->error;
    $statement->close();
    throw new Exception("Could not execute statement: " . $errorMsg);
  }

  try {
    $result = $f($statement);
  } catch (Exception $e) {
    $statement->close();
    throw $e;
  }

  $statement->close();

  return $result;
}

/**
 * @param string $sql
 * @param Closure | null $bindParams
 * @param Closure $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_select_query(string $sql, ?Closure $bindParams, Closure $f) {
  return execute_query(connect_to_db(), $sql, $bindParams, function (mysqli_stmt $stmt) use ($f) {
    $stmtResult = $stmt->get_result();

    if (!$stmtResult) {
      throw new Exception("Could not get result: " . $stmt->error);
    }

    $result = $f($stmtResult);

    $stmtResult->close();
    return $result;
  });
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
  $mainInsertSql = "
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);";

  $db = connect_to_db();


  $otherIdentifierInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)");


  if (!$otherIdentifierInsertStatement) {
    error_log('Could not prepare insert statements!');
    return false;
  }

  $db->begin_transaction();

  # insert main data
  try {
    execute_query(
      $db,
      $mainInsertSql,
      fn(mysqli_stmt $mainInsertStatement) => $mainInsertStatement->bind_param(
        'sssisisss',
        $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->identifierType, $mmd->palaeographicClassification, $mmd->palaeographicClassificationSure,
        $mmd->provenance, $mmd->cthClassification, $mmd->bibliography, $mmd->status, $mmd->creatorUsername
      ),
      fn(mysqli_stmt $stmt) => null
    );

  } catch (Exception $e) {
    $db->rollback();
    $db->close();
    return false;
  }

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

  $conn = connect_to_db();

  try {
    $executed = execute_query(
      $conn,
      $sql,
      fn(mysqli_stmt $stmt) => $stmt->bind_param('sssss', $user->username, $user->pwHash, $user->name, $user->affiliation, $user->email),
      fn(mysqli_stmt $stmt) => true
    );

    $conn->close();

    return $executed;
  } catch (Exception $e) {
    $conn->close();
    return false;
  }
}

