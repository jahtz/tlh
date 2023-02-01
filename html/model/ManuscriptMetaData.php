<?php

namespace model;

require_once __DIR__ . '/ManuscriptIdentifier.php';
// require_once __DIR__ . '/TransliterationLine.php';
require_once __DIR__ . '/TransliterationSide.php';

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};

/**
 * @param string $manuscriptMainIdentifier
 * @return string[]
 */
function getPictures(string $manuscriptMainIdentifier): array
{
  $folder = __DIR__ . "/../uploads/$manuscriptMainIdentifier/";

  if (!file_exists($folder) || !is_dir($folder)) {
    return [];
  }

  return array_filter(scandir($folder), fn(string $value): bool => !in_array($value, ['.', '..']));
}

class ManuscriptMetaData
{
  static ObjectType $graphQLType;
  static InputObjectType $graphQLInputObjectType;

  public ManuscriptIdentifier $mainIdentifier;
  /**
   * @var ManuscriptIdentifier[] | null
   */
  public ?array $otherIdentifiers;
  public string $palaeographicClassification;
  public bool $palaeographicClassificationSure;
  public ?string $provenance;
  public ?int $cthClassification;
  public ?string $bibliography;

  public string $status;
  public string $creatorUsername;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    ?array               $otherIdentifiers,
    string               $palaeographicClassification,
    bool                 $palaeographicClassificationSure,
    ?string              $provenance,
    ?int                 $cthClassification,
    ?string              $bibliography,
    string               $status,
    string               $creatorUsername
  )
  {
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

  static function fromDbAssocArray(array $row): ManuscriptMetaData
  {
    return new ManuscriptMetaData(
      new ManuscriptIdentifier($row['main_identifier_type'], $row['main_identifier']),
      [],
      $row['palaeo_classification'],
      $row['palaeo_classification_sure'],
      $row['provenance'],
      $row['cth_classification'],
      $row['bibliography'],
      $row['status'],
      $row['creator_username']
    );
  }

  static function fromGraphQLInput(array $input, string $creatorUsername): ManuscriptMetaData
  {
    $otherIdentifiers = array_key_exists('otherIdentifiers', $input)
      ? array_map(fn($x) => ManuscriptIdentifier::fromGraphQLInput($x), $input['otherIdentifiers'])
      : null;

    return new ManuscriptMetaData(
      ManuscriptIdentifier::fromGraphQLInput($input['mainIdentifier']),
      $otherIdentifiers,
      $input['palaeographicClassification'],
      $input['palaeographicClassificationSure'],
      $input['provenance'] ?? null,
      $input['cthClassification'] ?? null,
      $input['bibliography'] ?? null,
      'InCreation',
      $creatorUsername
    );
  }
}

// GraphQL

$palaeographicClassificationGraphQLEnumType = new EnumType([
  'name' => 'PalaeographicClassification',
  'values' => [
    'OldScript', 'MiddleScript', 'NewScript', 'LateNewScript', 'OldAssyrianScript', 'MiddleBabylonianScript',
    'MiddleAssyrianScript', 'AssyroMittanianScript', 'Unclassified']
]);

$manuscriptStatusEnumType = new EnumType([
  'name' => 'ManuscriptStatus',
  'values' => ['InCreation', 'Created', 'Reviewed', 'ReviewMerged', 'ExecutiveReviewed', 'ExecutiveReviewMerged', 'Approved']
]);

ManuscriptMetaData::$graphQLType = new ObjectType([
  'name' => 'ManuscriptMetaData',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLType),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
    'creatorUsername' => Type::nonNull(Type::string()),
    'palaeographicClassification' => Type::nonNull($palaeographicClassificationGraphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'status' => $manuscriptStatusEnumType,
    'otherIdentifiers' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLType))),
      'resolve' => fn(ManuscriptMetaData $manuscriptMetaData): array => getOtherIdentifiers($manuscriptMetaData->mainIdentifier->identifier)
    ],
    'pictureUrls' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(ManuscriptMetaData $manuscriptMetaData): array => getPictures($manuscriptMetaData->mainIdentifier->identifier)
    ],
    'transliterations' => [
      'type' => Type::listOf(Type::nonNull(TransliterationSide::$graphQLObjectType)),
      'resolve' => fn(ManuscriptMetaData $manuscriptMetaData): array => TransliterationSide::selectTransliterationSides($manuscriptMetaData->mainIdentifier->identifier)
    ]
  ]
]);

ManuscriptMetaData::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptMetaDataInput',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType),
    'otherIdentifiers' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType))),
    'palaeographicClassification' => Type::nonNull($palaeographicClassificationGraphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
  ]
]);
