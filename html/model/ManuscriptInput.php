<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/ManuscriptLanguage.php';
require_once __DIR__ . '/AbstractManuscript.php';


use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

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
    return SqlHelpers::executeQueriesInTransactions(function (mysqli $conn) {
      # insert main data
      $mainDataInserted = SqlHelpers::executeSingleChangeQuery(
        "
insert into tlh_dig_manuscripts (main_identifier, main_identifier_type, default_language, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography, creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);",
        fn(mysqli_stmt $mainInsertStatement) => $mainInsertStatement->bind_param(
          'ssssisiss',
          $this->mainIdentifier->identifier, $this->mainIdentifier->identifierType, $this->defaultLanguage, $this->palaeographicClassification, $this->palaeographicClassificationSure,
          $this->provenance, $this->cthClassification, $this->bibliography, $this->creatorUsername
        ),
        $conn,
      );

      if (!$mainDataInserted) {
        return false;
      }

      return SqlHelpers::executeMultiInsertQuery(
        "
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)",
        $this->otherIdentifiers,
        fn(mysqli_stmt $stmt, ManuscriptIdentifier $identifier): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $identifier->identifier, $identifier->identifierType),
        $conn
      );
    });
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
