<?php

namespace tlh_dig\graphql;


require_once __DIR__ . '/ManuscriptIdentifier.inc';
require_once __DIR__ . '/ManuscriptStatus.inc';
require_once __DIR__ . '/PalaeographicClassification.inc';

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * @param string $manuscriptMainIdentifier
 * @return string[]
 */
function getPictures(string $manuscriptMainIdentifier): array {
  $folder = "./uploads/$manuscriptMainIdentifier/";

  if (file_exists($folder) && is_dir($folder)) {
    return array_filter(
      scandir($folder),
      function (string $value): bool {
        return !in_array($value, ['.', '..']);
      }
    );
  } else {
    return [];
  }
}

class ManuscriptMetaData
{

  static /*ObjectType*/
    $graphQLType;
  static /*InputObjectType*/
    $graphQLInputObjectType;

  public /*ManuscriptIdentifier*/
    $mainIdentifier;
  public /*array*/
    $otherIdentifiers;
  public /*PalaeographicClassification*/
    $palaeographicClassification;
  public /*bool*/
    $palaeographicClassificationSure;
  public /*?string*/
    $provenance;
  public /*?int*/
    $cthClassification;
  public /*?string*/
    $bibliography;

  public /*ManuscriptStatus*/
    $status;
  public /*string*/
    $creatorUsername;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    ?array $otherIdentifiers,
    PalaeographicClassification $palaeographicClassification,
    bool $palaeographicClassificationSure,
    ?string $provenance,
    ?int $cthClassification,
    ?string $bibliography,
    ManuscriptStatus $status,
    string $creatorUsername
  ) {
    $this->mainIdentifier = $mainIdentifier;
    $this->otherIdentifiers = $otherIdentifiers;
    $this->palaeographicClassification = $palaeographicClassification;
    $this->palaeographicClassificationSure = $palaeographicClassificationSure;
    $this->provenance = $provenance;
    $this->cthClassification = $cthClassification;
    $this->bibliography = $bibliography;
    $this->status = $status;
    $this->creatorUsername = $creatorUsername;
  }

  static function fromDbAssocArray(array $row): ManuscriptMetaData {
    return new ManuscriptMetaData(
      ManuscriptIdentifier::new(
        new ManuscriptIdentifierType($row['main_identifier_type']),
        $row['main_identifier']
      ),
      [],
      new PalaeographicClassification($row['palaeo_classification']),
      $row['palaeo_classification_sure'],
      $row['provenance'],
      $row['cth_classification'],
      $row['bibliography'],
      new ManuscriptStatus($row['status']),
      $row['creator_username']
    );
  }

  static function fromGraphQLInput(array $input, string $creatorUsername): ManuscriptMetaData {
    $otherIdentifiers = array_key_exists('otherIdentifiers', $input) ?
      array_map(function ($x) {
        return ManuscriptIdentifier::fromGraphQLInput($x);
      }, $input['otherIdentifiers'])
      : null;

    return new ManuscriptMetaData(
      ManuscriptIdentifier::fromGraphQLInput($input['mainIdentifier']),
      $otherIdentifiers,
      new PalaeographicClassification($input['palaeographicClassification']),
      $input['palaeographicClassificationSure'],
      $input['provenance'],
      $input['cthClassification'],
      $input['bibliography'],
      ManuscriptStatus::InCreation(),
      $creatorUsername
    );
  }
}

ManuscriptMetaData::$graphQLType = new ObjectType([
  'name' => 'ManuscriptMetaData',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLType),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
    'creatorUsername' => Type::nonNull(Type::string()),
    'palaeographicClassification' => [
      'type' => Type::nonNull(PalaeographicClassification::$graphQLEnumType),
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): ?string {
        return $manuscriptMetaData->palaeographicClassification->getValue();
      }
    ],
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'status' => [
      'type' => ManuscriptStatus::$enumType,
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): ?string {
        return $manuscriptMetaData->status->getValue();
      }
    ],
    'otherIdentifiers' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLType))),
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): array {
        return [];
      }
    ],
    'pictureUrls' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): array {
        return getPictures($manuscriptMetaData->mainIdentifier->identifier);
      }
    ]
  ]
]);

ManuscriptMetaData::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptMetaDataInput',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType),
    'otherIdentifiers' => Type::listOf(ManuscriptIdentifier::$graphQLInputObjectType),
    'palaeographicClassification' => Type::nonNull(PalaeographicClassification::$graphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
  ]
]);
