<?php

require_once __DIR__ . '/mysqliconn.php';
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/model/ManuscriptMetaData.php';
require_once __DIR__ . '/model/User.php';

use model\{ManuscriptIdentifier, ManuscriptMetaData, User};

/**
 * @template T
 *
 * @param mysqli $connection
 * @param string $sql
 * @param ?callable(mysqli_stmt):void $bindParams
 * @param callable(mysqli_stmt):T $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_query_with_connection(mysqli $connection, string $sql, ?callable $bindParams, callable $f)
{
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
    error_log($statement->error);
    $statement->close();
    throw $e;
  }

  $statement->close();

  return $result;
}

/**
 * @template T
 *
 * @param string $sql
 * @param ?callable(mysqli_stmt):void $bindParams
 * @param callable(mysqli_stmt):T $f
 * @return mixed
 *
 * @throws Exception
 */
function execute_query(string $sql, ?callable $bindParams, callable $f)
{
  $conn = connect_to_db();

  try {
    $executed = execute_query_with_connection($conn, $sql, $bindParams, $f);
  } catch (Exception $e) {
    $conn->close();
    throw $e;
  }

  $conn->close();
  return $executed;
}

/**
 * @template T
 *
 * @param string $sql
 * @param callable|null $bindParams
 * @param callable(mysqli_result):T $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_select_query(string $sql, ?callable $bindParams, callable $f)
{
  return execute_query($sql, $bindParams, function (mysqli_stmt $stmt) use ($f) {
    $stmtResult = $stmt->get_result();

    if (!$stmtResult) {
      throw new Exception("Could not get result: " . $stmt->error);
    }

    $result = $f($stmtResult);

    $stmtResult->close();
    return $result;
  });
}

function allManuscriptsCount(): int
{
  try {
    return execute_select_query(
      "select count(*) as manuscript_count from tlh_dig_manuscript_metadatas;",
      null,
      function (mysqli_result $result): int {
        $row = $result->fetch_assoc();

        if (is_array($row)) {
          return (int)$row['manuscript_count'];
        } else {
          throw new Error('Could not query manuscripts count!');
        }
      }
    );
  } catch (Exception $e) {
    error_log($e->getMessage());
    return -1;
  }
}

/**
 * @return ManuscriptMetaData[]
 */
function allManuscriptMetaData(int $paginationSize, int $page): array
{
  $paginationSize = max(10, $paginationSize);

  $first = $page * $paginationSize;
  $last = ($page + 1) * $paginationSize;

  try {
    return execute_select_query(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    limit ?, ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('ii', $first, $last),
      fn(mysqli_result $result): array => array_map(
        fn(array $row): ManuscriptMetaData => ManuscriptMetaData::fromDbAssocArray($row),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $e) {
    error_log($e->getMessage());
    return [];
  }
}

function manuscriptMetaDataById(string $mainIdentifier): ?ManuscriptMetaData
{
  try {
    return execute_select_query(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    where main_identifier = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
      function (mysqli_result $result): ?ManuscriptMetaData {
        $fetched = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        return $fetched ? ManuscriptMetaData::fromDbAssocArray($fetched) : null;
      });
  } catch (Exception $e) {
    error_log($e->getMessage());
    return null;
  }
}

/**
 * @param string $mainIdentifier
 * @return ManuscriptIdentifier[]
 */
function getOtherIdentifiers(string $mainIdentifier): array
{
  try {
    return execute_select_query(
      "select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(mysqli_result $result): array => array_map(
        fn(array $row): ManuscriptIdentifier => ManuscriptIdentifier::fromDbAssocArray($row),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $e) {
    return [];
  }
}

function insertManuscriptMetaData(ManuscriptMetaData $mmd): bool
{

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
    execute_query_with_connection(
      $db,
      "
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);",
      fn(mysqli_stmt $mainInsertStatement) => $mainInsertStatement->bind_param(
        'sssisisss',
        $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->identifierType, $mmd->palaeographicClassification, $mmd->palaeographicClassificationSure,
        $mmd->provenance, $mmd->cthClassification, $mmd->bibliography, $mmd->status, $mmd->creatorUsername
      ),
      fn(mysqli_stmt $_stmt) => null
    );

  } catch (Exception $e) {
    $db->rollback();
    $db->close();
    return false;
  }

  # insert other identifiers

  $mainIdentifier = $mmd->mainIdentifier->identifier;

  $allOtherIdentifiersInserted = true;
  if (!is_null($mmd->otherIdentifiers)) {
    foreach ($mmd->otherIdentifiers as $identifier) {
      $otherIdentifierInsertStatement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->identifierType);

      if (!$otherIdentifierInsertStatement->execute()) {
        error_log("Could not insert other identifier " . json_encode($identifier) . " into database: " . $otherIdentifierInsertStatement->error);

        $allOtherIdentifiersInserted = false;
      }
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

function maybeUserFromDatabase(string $username): ?User
{
  try {
    return execute_select_query(
      "select username, pw_hash, name, affiliation, email from tlh_dig_users where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      function (mysqli_result $result): ?User {
        $userArray = $result->fetch_all(MYSQLI_ASSOC)[0] ?? null;

        return $userArray != null ? User::fromDbAssocArray($userArray) : null;
      });
  } catch (Exception $e) {
    return null;
  }
}

function insertUserIntoDatabase(User $user): bool
{
  try {
    return execute_query(
      "insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('sssss', $user->username, $user->pwHash, $user->name, $user->affiliation, $user->email),
      fn(mysqli_stmt $_stmt) => true
    );
  } catch (Exception $e) {
    return false;
  }
}
