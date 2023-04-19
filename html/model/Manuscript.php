<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/Transliteration.php';
require_once __DIR__ . '/../sql_queries.php';
require_once __DIR__ . '/../sql_helpers.php';

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleInsertQuery, executeSingleSelectQuery};

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

class Manuscript
{
  static ObjectType $graphQLType;
  static InputObjectType $graphQLInputObjectType;

  public ManuscriptIdentifier $mainIdentifier;
  /** @var ManuscriptIdentifier[] | null */
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

  static function fromDbAssocArray(array $row): Manuscript
  {
    return new Manuscript(
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

  static function fromGraphQLInput(array $input, string $creatorUsername): Manuscript
  {
    $otherIdentifiers = array_key_exists('otherIdentifiers', $input)
      ? array_map(fn(array $x): ManuscriptIdentifier => ManuscriptIdentifier::fromGraphQLInput($x), $input['otherIdentifiers'])
      : null;

    return new Manuscript(
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

  static function selectManuscriptsCount(): int
  {
    return executeSingleSelectQuery(
      "select count(*) as manuscript_count from tlh_dig_manuscript_metadatas;",
      null,
      fn(array $row): int => (int)$row['manuscript_count']
    ) ?? -1;
  }

  /**
   * @return Manuscript[]
   */
  static function selectAllManuscriptsPaginated(int $paginationSize, int $page): array
  {
    $paginationSize = max(10, $paginationSize);

    $first = $page * $paginationSize;
    $last = ($page + 1) * $paginationSize;

    return executeMultiSelectQuery(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    limit ?, ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('ii', $first, $last),
      fn(array $row): Manuscript => Manuscript::fromDbAssocArray($row)
    );
  }

  /**
   * @return string[]
   */
  static function selectOwnManuscriptIdentifiers(string $username): array
  {
    return executeMultiSelectQuery(
      "select main_identifier from tlh_dig_manuscript_metadatas where creator_username = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('i', $username),
      fn(array $row): string => (string)$row['main_identifier'],
    );
  }

  static function selectManuscriptById(string $mainIdentifier): ?Manuscript
  {
    return executeSingleSelectQuery(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, status, creator_username
    from tlh_dig_manuscript_metadatas
    where main_identifier = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): Manuscript => Manuscript::fromDbAssocArray($row)
    );
  }

  /**
   * @return ManuscriptIdentifier[]
   */
  function selectOtherIdentifiers(): array
  {
    return executeMultiSelectQuery(
      "select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier),
      fn(array $row): ManuscriptIdentifier => ManuscriptIdentifier::fromDbAssocArray($row),
    );
  }

  // Transliterations

  function insertProvisionalTransliteration(string $transliteration): bool
  {
    return executeSingleInsertQuery(
      "insert into tlh_dig_provisional_transliterations (main_identifier, input) values (?, ?);",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('ss', $this->mainIdentifier->identifier, $transliteration)
    );
  }

  function selectProvisionalTransliteration(): ?string
  {
    return executeSingleSelectQuery(
      "select input from tlh_dig_provisional_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): string => $row['input']
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

Manuscript::$graphQLType = new ObjectType([
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
      'resolve' => fn(Manuscript $manuscript): array => $manuscript->selectOtherIdentifiers()
    ],
    'pictureUrls' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(Manuscript $manuscript): array => getPictures($manuscript->mainIdentifier->identifier)
    ],
    'provisionalTransliteration' => [
      'type' => Type::string(),
      'resolve' => fn(Manuscript $manuscript): ?string => $manuscript->selectProvisionalTransliteration()
    ]
  ]
]);

Manuscript::$graphQLInputObjectType = new InputObjectType([
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
