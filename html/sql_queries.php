<?php

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/User.php';

use model\{Manuscript};
use function sql_helpers\{execute_query_with_connection, executeMultiSelectQuery};


/**
 * @param string $username
 * @return string[]
 */
function selectManuscriptsToReview(string $username): array
{
  return executeMultiSelectQuery(
    "
select m.main_identifier
from tlh_dig_manuscript_metadatas as m
         left outer join tlh_dig_initial_transliterations as it on it.main_identifier = m.main_identifier
         left outer join tlh_dig_first_reviews as fr on fr.main_identifier = it.main_identifier
         left outer join tlh_dig_second_reviews as sr on sr.main_identifier = fr.main_identifier
         left outer join tlh_dig_approved_transliterations as at on sr.main_identifier = at.main_identifier
where m.creator_username <> ? -- user did not create manuscript
    and it.input is not null -- has something to review
    and fr.reviewer_username is null -- no first review yet (-> no second review!)
    or (
        fr.reviewer_username <> ? -- first review not from user
        and (
            sr.reviewer_username is null -- no second review yet
            or sr.reviewer_username <> ? -- second review also not from user
        )
    );",
    fn(mysqli_stmt $stmt) => $stmt->bind_param('sss', $username, $username, $username),
    fn(array $row): string => (string)$row['main_identifier']
  );
}

function insertManuscriptMetaData(Manuscript $mmd): bool
{
  $db = connect_to_db();

  $otherIdentifierInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)");

  if (!$otherIdentifierInsertStatement) {
    error_log('Could not prepare insert statements: ' . $db->error);
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
