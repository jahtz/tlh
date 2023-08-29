<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Rights.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/ManuscriptStatus.php';
require_once __DIR__ . '/ManuscriptLanguage.php';
require_once __DIR__ . '/AbstractManuscript.php';
require_once __DIR__ . '/HasTransliterationReview.php';
require_once __DIR__ . '/HasXmlConversion.php';
require_once __DIR__ . '/XmlReviewType.php';
require_once __DIR__ . '/HasFirstXmlReview.php';
require_once __DIR__ . '/HasSecondXmlReview.php';
require_once __DIR__ . '/../mailer.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

/** @return string[] */
function getPictures(string $manuscriptMainIdentifier): array
{
  $folder = __DIR__ . "/../uploads/$manuscriptMainIdentifier/";

  return file_exists($folder) && is_dir($folder)
    ? array_filter(scandir($folder), fn(string $value): bool => !in_array($value, ['.', '..']))
    : [];
}

class Manuscript extends AbstractManuscript
{
  static ObjectType $graphQLType;
  static ObjectType $graphQLMutationsType;

  use HasTransliterationReview, HasXmlConversion, HasFirstXmlReview, HasSecondXmlReview;

  public string $status;
  public string $creationDate;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    string               $palaeographicClassification,
    bool                 $palaeographicClassificationSure,
    string               $defaultLanguage,
    ?string              $provenance,
    ?int                 $cthClassification,
    ?string              $bibliography,
    string               $status,
    string               $creatorUsername,
    string               $creationDate
  )
  {
    parent::__construct($mainIdentifier, $palaeographicClassification, $palaeographicClassificationSure, $defaultLanguage, $provenance, $cthClassification, $bibliography, $creatorUsername);
    $this->status = $status;
    $this->creationDate = $creationDate;
  }

  static function fromDbAssocArray(array $row): Manuscript
  {
    return new Manuscript(
      new ManuscriptIdentifier($row['main_identifier_type'], $row['main_identifier']),
      $row['palaeo_classification'],
      $row['palaeo_classification_sure'],
      $row['default_language'],
      $row['provenance'],
      $row['cth_classification'],
      $row['bibliography'],
      $row['status'],
      $row['creator_username'],
      $row['creation_date']
    );
  }

  static function selectManuscriptsCount(?string $username): int
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as manuscript_count from tlh_dig_manuscripts where status = 'Approved' or creator_username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): int => (int)$row['manuscript_count']
    ) ?? -1;
  }

  /** @return Manuscript[] */
  static function selectAllManuscriptsPaginated(int $page, ?string $creatorUsername): array
  {
    $pageSize = 10;
    $first = $page * $pageSize;

    return SqlHelpers::executeMultiSelectQuery(
      "select * from tlh_dig_manuscripts where status = 'Approved' or creator_username = ? order by creation_date desc limit ?, ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sii', $creatorUsername, $first, $pageSize),
      fn(array $row): Manuscript => Manuscript::fromDbAssocArray($row)
    );
  }

  /** @return string[] */
  static function selectManuscriptIdentifiersForUser(string $username): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "select main_identifier from tlh_dig_manuscripts where creator_username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): string => (string)$row['main_identifier'],
    );
  }

  static function selectManuscriptById(string $mainIdentifier): ?Manuscript
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select * from tlh_dig_manuscripts where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): Manuscript => Manuscript::fromDbAssocArray($row)
    );
  }

  /** @throws MySafeGraphQLException */
  static function resolveManuscriptById(string $mainIdentifier): Manuscript
  {
    $manuscript = Manuscript::selectManuscriptById($mainIdentifier);

    if (is_null($manuscript)) {
      throw new MySafeGraphQLException("Manuscript $mainIdentifier does not exist!");
    } else {
      return $manuscript;
    }
  }

  /** @return ManuscriptIdentifier[] */
  function selectOtherIdentifiers(): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "select identifier_type, identifier from tlh_dig_manuscript_other_identifiers where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ManuscriptIdentifier => ManuscriptIdentifier::fromDbAssocArray($row),
    );
  }

  // Provisional Transliteration

  function insertProvisionalTransliteration(string $transliteration): bool
  {
    return SqlHelpers::executeSingleChangeQuery(
      "insert into tlh_dig_provisional_transliterations (main_identifier, input) values (?, ?) on duplicate key update input = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $transliteration, $transliteration)
    );
  }

  function selectProvisionalTransliteration(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select input from tlh_dig_provisional_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['input']
    );
  }

  // Released Transliteration

  function selectTransliterationReleaseDate(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select release_date from tlh_dig_released_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['release_date']
    );
  }

  function selectReleasedTransliteration(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select main_identifier from tlh_dig_released_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['main_identifier']
    );
  }

  function selectTransliterationIsReleased(): bool
  {
    return !is_null($this->selectReleasedTransliteration());
  }

  /** @throws MySafeGraphQLException */
  function insertReleasedTransliteration(): string
  {
    try {
      $inserted = SqlHelpers::executeQueriesInTransactions(
        function ($conn): string {
          $transliterationInserted = SqlHelpers::executeSingleChangeQuery(
            "insert into tlh_dig_released_transliterations (main_identifier) values (?);",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
            $conn
          );

          if (!$transliterationInserted) {
            return false;
          }

          return SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'TransliterationReleased' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
            $conn
          );
        }
      );
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not release transliteration of manuscript " . $this->mainIdentifier->identifier);
    }

    if (!$inserted) {
      throw new MySafeGraphQLException("Couldn't insert transliteration release of manuscript " . $this->mainIdentifier->identifier);
    }

    return SqlHelpers::executeSingleReturnRowQuery(
      "select release_date from tlh_dig_released_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['release_date']
    );
  }
}

// GraphQL

/**
 * @param Manuscript $manuscript
 * @param User|null $user
 * @param callable(Manuscript):(null|ReviewData) $selectStepData
 *
 * @return ?string
 *
 * @throws MySafeGraphQLException
 */
function resolveStepData(Manuscript $manuscript, ?User $user, callable $selectStepData): ?string
{
  if (is_null($user)) {
    throw new MySafeGraphQLException("User is not logged in!");
  }

  $data = $selectStepData($manuscript);

  if (is_null($data)) {
    return null;
  }

  if ($user->username != $data->username) {
    return null;
  }

  return $data->input;
}

Manuscript::$graphQLType = new ObjectType([
  'name' => 'ManuscriptMetaData',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLType),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
    'creatorUsername' => Type::nonNull(Type::string()),
    'creationDate' => Type::nonNull(Type::string()),
    'palaeographicClassification' => Type::nonNull(AbstractManuscript::$palaeographicClassificationGraphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'defaultLanguage' => Type::nonNull(ManuscriptLanguage::$enumType),
    'status' => Type::nonNull(ManuscriptStatus::$graphQLType),
    'otherIdentifiers' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLType))),
      'resolve' => fn(Manuscript $manuscript): array => $manuscript->selectOtherIdentifiers()
    ],
    'pictureCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(Manuscript $manuscript): int => count(getPictures($manuscript->mainIdentifier->identifier))
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
      'resolve' => fn(Manuscript $manuscript): bool => $manuscript->selectTransliterationIsReleased()
    ],
    'transliterationReleaseDate' => [
      'type' => Type::string(),
      'resolve' => fn(Manuscript $manuscript): ?string => $manuscript->selectTransliterationReleaseDate()
    ],
    'transliterationReviewData' => [
      'type' => Type::string(),
      'resolve' => fn(Manuscript $manuscript, array $args, ?User $user): ?string => resolveStepData(
        $manuscript,
        $user,
        fn(Manuscript $manuscript): ?ReviewData => $manuscript->selectTransliterationReviewData()
      )
    ],
    'xmlConversionData' => [
      'type' => Type::string(),
      'resolve' => fn(Manuscript $manuscript, array $args, ?User $user): ?string => resolveStepData(
        $manuscript,
        $user,
        fn(Manuscript $manuscript): ?ReviewData => $manuscript->selectXmlConversionData()
      )
    ],
    'xmlReviewData' => [
      'type' => Type::string(),
      'args' => [
        'reviewType' => Type::nonNull(XmlReviewType::$graphQLType)
      ],
      'resolve' => fn(Manuscript $manuscript, array $args, ?User $user): ?string => resolveStepData(
        $manuscript,
        $user,
        fn(Manuscript $manuscript): ?ReviewData => $args['reviewType'] === XmlReviewType::firstXmlReview
          ? $manuscript->selectFirstXmlReviewData()
          : $manuscript->selectSecondXmlReviewData()
      )
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
        if (is_null($user)) {
          throw new MySafeGraphQLException('User is not logged in!');
        }
        if ($manuscript->creatorUsername !== $user->username) {
          throw new MySafeGraphQLException("Can only change own transliterations!");
        }
        if ($manuscript->selectTransliterationIsReleased()) {
          throw new MySafeGraphQLException("Transliteration is already released!");
        }

        return $manuscript->insertProvisionalTransliteration($args['input']);
      }
    ],
    'releaseTransliteration' => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => function (Manuscript $manuscript, array $args, ?User $user): bool {
        if (is_null($user)) {
          throw new MySafeGraphQLException('User is not logged in!');
        } else if ($manuscript->creatorUsername !== $user->username) {
          throw new MySafeGraphQLException('Only the owner can release the transliteration!');
        } else if ($manuscript->selectTransliterationIsReleased()) {
          return true;
        }

        $provisionalTransliteration = $manuscript->selectProvisionalTransliteration();

        if (is_null($provisionalTransliteration)) {
          throw new MySafeGraphQLException('Can\'t release a non-existing transliteration!');
        }

        $inserted = $manuscript->insertReleasedTransliteration();

        sendMailToAdmins(
          "New transliteration released for manuscript " . $manuscript->mainIdentifier->identifier,
          "A new transliteration was released for manuscript " . $manuscript->mainIdentifier->identifier
        );

        return $inserted;
      }
    ],
    'deletePicture' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'pictureName' => Type::nonNull(Type::string())
      ],
      'resolve' => function (Manuscript $manuscript, array $args, ?User $user): bool {
        if (is_null($user)) {
          throw new MySafeGraphQLException('Not logged in!');
        }
        if ($manuscript->creatorUsername !== $user->username || $user->rights !== Rights::ExecutiveEditor) {
          throw new MySafeGraphQLException('Insufficient rights!');
        }

        $mainIdentifier = $manuscript->mainIdentifier->identifier;
        $pictureName = $args['pictureName'];

        return unlink("./uploads/$mainIdentifier/$pictureName");
      }
    ]
  ]
]);

