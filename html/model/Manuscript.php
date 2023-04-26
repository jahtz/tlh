<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_queries.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/AllTransliterations.php';
require_once __DIR__ . '/AbstractManuscript.php';

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MySafeGraphQLException;
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleChangeQuery, executeSingleSelectQuery};

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

class Manuscript extends AbstractManuscript
{
  static ObjectType $graphQLType;
  static ObjectType $graphQLMutationsType;

  public string $status;

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
    parent::__construct($mainIdentifier, $palaeographicClassification, $palaeographicClassificationSure, $provenance, $cthClassification, $bibliography, $creatorUsername);
    $this->status = $status;
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
      /* $row['status'] */ 'InCreation',
      $row['creator_username']
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

  /** @return Manuscript[] */
  static function selectAllManuscriptsPaginated(int $page): array
  {
    $pageSize = 10;
    $first = $page * $pageSize;

    return executeMultiSelectQuery(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, creator_username
    from tlh_dig_manuscript_metadatas
    order by creation_date desc
    limit ?, ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('ii', $first, $pageSize),
      fn(array $row): Manuscript => Manuscript::fromDbAssocArray($row)
    );
  }

  /** @return string[] */
  static function selectManuscriptIdentifiersForUser(string $username): array
  {
    return executeMultiSelectQuery(
      "select main_identifier from tlh_dig_manuscript_metadatas where creator_username = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $username),
      fn(array $row): string => (string)$row['main_identifier'],
    );
  }

  static function selectManuscriptById(string $mainIdentifier): ?Manuscript
  {
    return executeSingleSelectQuery(
      "
select main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, creator_username
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
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ManuscriptIdentifier => ManuscriptIdentifier::fromDbAssocArray($row),
    );
  }

  // Transliterations

  function upsertProvisionalTransliteration(string $transliteration): bool
  {
    return executeSingleChangeQuery(
      "
insert into tlh_dig_provisional_transliterations (main_identifier, input)
    values (?, ?)
    on duplicate key update input = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $transliteration, $transliteration)
    );
  }

  function selectProvisionalTransliteration(): ?string
  {
    return executeSingleSelectQuery(
      "select input from tlh_dig_provisional_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['input']
    );
  }

  function selectInitialTransliteration(): ?string
  {
    return executeSingleSelectQuery(
      "select input from tlh_dig_initial_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['input']
    );
  }

  function insertInitialTransliteration(string $input): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_initial_transliterations (main_identifier, input) values (?, ?)",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $this->mainIdentifier->identifier, $input)
    );
  }

  function selectAllTransliterations(): ?AllTransliterations
  {
    return executeSingleSelectQuery(
      "
select pt.input             as p_input,
       it.input             as i_input,
       fr.input             as fr_input,
       fr.reviewer_username as fr_username,
       sr.input             as sr_input,
       sr.reviewer_username as sr_username,
       at.input             as at_input,
       at.approval_username as at_username
from tlh_dig_manuscript_metadatas as m
       left outer join tlh_dig_provisional_transliterations as pt on pt.main_identifier = m.main_identifier
       left outer join tlh_dig_initial_transliterations as it on it.input = pt.input
       left outer join tlh_dig_first_reviews as fr on fr.main_identifier = it.main_identifier
       left outer join tlh_dig_second_reviews as sr on sr.main_identifier = fr.main_identifier
       left outer join tlh_dig_approved_transliterations as at on at.main_identifier = sr.main_identifier
where m.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): AllTransliterations => new AllTransliterations(
        $row['p_input'],
        $row['i_input'],
        isset($row['fr_input']) && isset($row['fr_username'])
          ? new Review($row['fr_input'], $row['fr_username'])
          : null,
        isset($row['sr_input']) && isset($row['sr_username'])
          ? new Review($row['sr_input'], $row['sr_username'])
          : null,
        isset($row['at_input']) && isset($row['at_username'])
          ? new Review($row['at_input'], $row['at_username'])
          : null
      )
    );
  }
}

// GraphQL

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
    'palaeographicClassification' => Type::nonNull(AbstractManuscript::$palaeographicClassificationGraphQLEnumType),
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
    ],
    'transliterationReleased' => [
      'type' => Type::nonNull(Type::boolean()),
      'resolve' => fn(Manuscript $manuscript) => !is_null($manuscript->selectInitialTransliteration())
    ],
    'allTransliterations' => [
      'type' => AllTransliterations::$graphQLType,
      'resolve' => fn(Manuscript $manuscript): ?AllTransliterations => $manuscript->selectAllTransliterations()
    ]
  ]
]);

Manuscript::$graphQLMutationsType = new ObjectType([
  'name' => 'ManuscriptMutations',
  'fields' => [
    'updateTransliteration' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'input' => Type::nonNull(Type::string())
      ],
      'resolve' => function (Manuscript $manuscript, array $args, ?User $user): bool {
        if ($manuscript->creatorUsername !== $user->username) {
          // make sure manuscript is from user
          throw new MySafeGraphQLException("Can only change own transliterations!");
        }

        // FIXME: make sure transliteration is released yet (-> initialTransliteration!)!

        return $manuscript->upsertProvisionalTransliteration($args['input']);
      }
    ],
    'releaseTransliteration' => [
      'type' => Type::nonNull(Type::boolean()),
      'resolve' => function (Manuscript $manuscript, array $args, ?User $user): bool {
        if ($manuscript->creatorUsername !== $user->username) {
          throw new MySafeGraphQLException('Can only release own transliterations!');
        }

        if (!is_null($manuscript->selectInitialTransliteration())) {
          // check if transliteration is already released...
          return true;
        }

        // FIXME: check if there is a provisional transliteration!

        $provisionalTransliteration = $manuscript->selectProvisionalTransliteration();

        if (is_null($provisionalTransliteration)) {
          throw new MySafeGraphQLException('Can\'t release a non-existing transliteration!');
        }

        return $manuscript->insertInitialTransliteration($provisionalTransliteration);
      }
    ]
  ]
]);

