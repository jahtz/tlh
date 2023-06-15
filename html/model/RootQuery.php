<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/ExecutiveEditor.php';
require_once __DIR__ . '/Manuscript.php';
require_once __DIR__ . '/Reviewer.php';
require_once __DIR__ . '/User.php';

use GraphQL\Type\Definition\{ObjectType, Type};

abstract class RootQuery
{
  static ObjectType $queryType;
}

RootQuery::$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'manuscriptCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(): int => Manuscript::selectManuscriptsCount()
    ],
    'allManuscripts' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Manuscript::$graphQLType))),
      'args' => [
        'page' => Type::nonNull(Type::int())
      ],
      'resolve' => fn(?int $_rootValue, array $args): array => Manuscript::selectAllManuscriptsPaginated($args['page'])
    ],
    'myManuscripts' => [
      'type' => Type::listOf(Type::nonNull(Type::string())),
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?array => !is_null($user)
        ? Manuscript::selectManuscriptIdentifiersForUser($user->username)
        : null,
    ],
    'manuscript' => [
      'type' => Manuscript::$graphQLType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(?int $_rootValue, array $args): ?Manuscript => Manuscript::selectManuscriptById($args['mainIdentifier'])
    ],
    'reviewerQueries' => [
      'type' => Reviewer::$queryType,
      'resolve' => fn(?int $_rootValue, array $args, ?User $user): ?User => !is_null($user) && $user->isReviewer() ? $user : null
    ],
    'executiveEditorQueries' => [
      # TODO: make userQueries with field execEditorQueries, reviewerQueries and myManuscripts?
      'type' => ExecutiveEditor::$queryType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isExecutiveEditor() ? $user : null
    ]
  ]
]);


