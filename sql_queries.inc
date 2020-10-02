<?php

require_once '../../mysqliconn.php';

require_once 'vendor/autoload.php';

require_once 'graphql/ManuscriptMetaData.inc';
require_once 'graphql/ManuscriptMetaDataInput.inc';
require_once 'graphql/User.inc';

use tlh_dig\graphql\ManuscriptMetaData;
use tlh_dig\graphql\ManuscriptMetaDataInput;
use tlh_dig\graphql\User;

/**
 * @return ManuscriptMetaData[]
 */
function allManuscriptMetaData(): array {
  $db = connect_to_db();

  $statement = $db->prepare("
select main_identifier, main_identifier_type, palaeographic_classification, provenance, cth_classification, bibliography, status, creator_username
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
select main_identifier, main_identifier_type, palaeographic_classification, provenance, cth_classification, bibliography, status, creator_username
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

function insertManuscriptMetaData(ManuscriptMetaDataInput $mmd): int {
  $db = connect_to_db();

  $statement = $db->prepare("
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeographic_classification, provenance, cth_classification, bibliography, status, creator_username)
values(?, ?, ?, ? , ?, ?, 0, ?);");

  $statement->bind_param(
    'ssssss', $mmd->mainIdentifier->identifier, $mmd->mainIdentifier->type, $mmd->dating, $mmd->provenance, $mmd->cthClassification, $mmd->bibliography, $mmd->creatorUsername
  );

  $statement->execute();

  $newId = $statement->insert_id;

  $statement->close();
  $db->close();

  return $newId;
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