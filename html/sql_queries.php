<?php

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/User.php';

use model\{Manuscript};
use function sql_helpers\{execute_query_with_connection, execute_select_query};


/**
 * @param string $username
 * @return string[]
 */
function selectManuscriptsToReview(string $username): array
{
  try {
    // FIXME: write sql query...
    return execute_select_query(
      "",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $username),
      fn(mysqli_result $result) => array_map(
        fn(array $row): string => (string)$row['main_identifier'],
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $exception) {
    error_log($exception->getMessage());
    return [];
  }
}

function insertManuscriptMetaData(Manuscript $mmd): bool
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
  } else {
    $db->commit();
  }

  $db->close();
  return $allOtherIdentifiersInserted;
}
