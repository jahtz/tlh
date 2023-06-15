<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/ManuscriptLanguage.php';
require_once __DIR__ . '/AbstractManuscript.php';


use Exception;
use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli_stmt;
use function sql_helpers\executeQueryWithConnection;

class ManuscriptInput extends AbstractManuscript
{
  static InputObjectType $graphQLInputObjectType;

  /** @var ManuscriptIdentifier[] | null */
  public ?array $otherIdentifiers;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    ?array               $otherIdentifiers,
    string               $palaeographicClassification,
    bool                 $palaeographicClassificationSure,
    string               $defaultLanguage,
    ?string              $provenance,
    ?int                 $cthClassification,
    ?string              $bibliography,
    string               $creatorUsername
  )
  {
    parent::__construct($mainIdentifier, $palaeographicClassification, $palaeographicClassificationSure, $defaultLanguage, $provenance, $cthClassification, $bibliography, $creatorUsername);
    $this->otherIdentifiers = $otherIdentifiers;
  }

  static function fromGraphQLInput(array $input, string $creatorUsername): ManuscriptInput
  {
    $otherIdentifiers = array_key_exists('otherIdentifiers', $input)
      ? array_map(fn(array $x): ManuscriptIdentifier => ManuscriptIdentifier::fromGraphQLInput($x), $input['otherIdentifiers'])
      : null;

    return new ManuscriptInput(
      ManuscriptIdentifier::fromGraphQLInput($input['mainIdentifier']),
      $otherIdentifiers,
      $input['palaeographicClassification'],
      $input['palaeographicClassificationSure'],
      $input['defaultLanguage'],
      $input['provenance'] ?? null,
      $input['cthClassification'] ?? null,
      $input['bibliography'] ?? null,
      $creatorUsername
    );
  }

  function insert(): bool
  {
    $db = connect_to_db();

    $db->begin_transaction();

    # insert main data
    try {
      executeQueryWithConnection(
        $db,
        "
insert into tlh_dig_manuscripts (main_identifier, main_identifier_type, default_language, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);",
        fn(mysqli_stmt $mainInsertStatement) => $mainInsertStatement->bind_param(
          'ssssisiss',
          $this->mainIdentifier->identifier, $this->mainIdentifier->identifierType, $this->defaultLanguage, $this->palaeographicClassification, $this->palaeographicClassificationSure,
          $this->provenance, $this->cthClassification, $this->bibliography, $this->creatorUsername
        ),
        fn(mysqli_stmt $_stmt) => null
      );
    } catch (Exception $e) {
      $db->rollback();
      $db->close();
      return false;
    }

    # insert other identifiers

    $mainIdentifier = $this->mainIdentifier->identifier;

    $otherIdentifierInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)");

    if (!$otherIdentifierInsertStatement) {
      error_log('Could not prepare insert statements: ' . $db->error);
      return false;
    }

    $allOtherIdentifiersInserted = true;

    foreach ($this->otherIdentifiers as $identifier) {
      $otherIdentifierInsertStatement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->identifierType);

      if (!$otherIdentifierInsertStatement->execute()) {
        error_log("Could not insert other identifier " . json_encode($identifier) . " into database: " . $otherIdentifierInsertStatement->error);

        $allOtherIdentifiersInserted = false;
        break;
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
}

// GraphQL

ManuscriptInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptMetaDataInput',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType),
    'otherIdentifiers' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType))),
    'palaeographicClassification' => Type::nonNull(AbstractManuscript::$palaeographicClassificationGraphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'defaultLanguage' => Type::nonNull(ManuscriptLanguage::$enumType),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
  ]
]);
