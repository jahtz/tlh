<?php

require_once '../../mysqliconn.php';

require_once 'vendor/autoload.php';

require_once 'graphql/ManuscriptMetaData.inc';
require_once 'graphql/User.inc';

use tlh_dig\graphql\ManuscriptIdentifier;
use tlh_dig\graphql\ManuscriptMetaData;
use tlh_dig\graphql\User;

/**
 * @return ManuscriptMetaData[]
 */
function allManuscriptMetaData(): array {
  $db = connect_to_db();

  $statement = $db->prepare("
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas;");

  if (!$statement->execute()) {
    $statement->close();
    $db->close();
    return array();
  }

  $result = $statement->get_result();

  $manuscripts = array();

  while ($row = $result->fetch_assoc()) {
    $manuscripts[] = ManuscriptMetaData::fromDbAssocArray($row);
  }

  $statement->close();
  $db->close();

  return $manuscripts;
}

function manuscriptMetaDataById(string $mainIdentifier): ?ManuscriptMetaData {
  $db = connect_to_db();

  $statement = $db->prepare("
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    where main_identifier = ?;");

  $statement->bind_param('i', $mainIdentifier);

  if (!$statement->execute()) {
    $statement->close();
    $db->close();
    return null;
  }

  $result = $statement->get_result();
  $statement->close();
  $db->close();

  return ManuscriptMetaData::fromDbAssocArray($result->fetch_assoc());
}

function getOtherIdentifiers(string $mainIdentifier): array {
  $db = connect_to_db();

  $statement = $db->prepare("select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;");

  $statement->bind_param('s', $mainIdentifier);

  if (!$statement->execute()) {
    return [];
  }

  $result = $statement->get_result();

  $otherIdentifiers = [];

  while ($row = $result->fetch_assoc()) {
    $otherIdentifiers[] = ManuscriptIdentifier::fromDbAssocArray($row);
  }

  $statement->close();
  $db->close();

  return $otherIdentifiers;
}

function insertManuscriptMetaData(ManuscriptMetaData $mmd): ?string {
  $db = connect_to_db();

  $statement = $db->prepare("
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);");

  if (!$statement) {
    error_log('Could not prepare insert statement!');
    return null;
  }

  $bind_param_success = $statement->bind_param(
    'sssisisss',
    $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->type, $mmd->palaeographicClassification, $mmd->palaeographicClassificationSure,
    $mmd->provenance, $mmd->cthClassification, $mmd->bibliography, $mmd->status, $mmd->creatorUsername
  );

  if (!$bind_param_success) {
    error_log('Could not bind insert statement params!');
    return null;
  }

  if (!$statement->execute()) {
    error_log('Could not execute insert statement: ' . $statement->error);

    return null;
  }

  $statement->close();

  insert_other_identifier($db, $mmd->mainIdentifier->identifier, $mmd->otherIdentifiers);

  $db->commit();
  $db->close();

  return $mmd->mainIdentifier->identifier;
}

/**
 * @param string $mainIdentifier
 * @param ManuscriptIdentifier[] $identifiers
 */
function insert_other_identifier(mysqli $db, string $mainIdentifier, array $identifiers) {

  $statement = $db->prepare("insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type) values (?, ?, ?)");

  foreach ($identifiers as $identifier) {
    $statement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->type);

    $statement->execute();
  }

  $statement->close();
}

function maybeUserFromDatabase(string $username): ?User {
  $db = connect_to_db();

  $statement = $db->prepare("select username, pw_hash, name, affiliation, email from tlh_dig_users where username = ?;");
  $statement->bind_param('s', $username);

  if (!$statement->execute()) {
    $statement->close();
    $db->close();
    return null;
  }

  $userArray = $statement->get_result()->fetch_assoc();

  $statement->close();
  $db->close();

  if ($userArray) {
    return new User(
      $userArray['username'],
      $userArray['pw_hash'],
      $userArray['name'],
      $userArray['affiliation'],
      $userArray['email']
    );
  } else {
    return null;
  }
}

function insertUserIntoDatabase(User $user): bool {
  $db = connect_to_db();

  $statement = $db->prepare("insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);");
  $statement->bind_param('sssss', $user->username, $user->pwHash, $user->name, $user->affiliation, $user->email);

  $result = $statement->execute();

  $statement->close();
  $db->close();

  return $result;
}