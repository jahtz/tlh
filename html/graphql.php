<?php

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/jwt_helpers.php';
require_once __DIR__ . '/MySafeGraphQLException.php';

require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/ManuscriptLanguage.php';
require_once __DIR__ . '/model/ManuscriptIdentifier.php';
require_once __DIR__ . '/model/User.php';
require_once __DIR__ . '/model/Reviewer.php';
require_once __DIR__ . '/model/ExecutiveEditor.php';

use GraphQL\Error\{DebugFlag, FormattedError};
use GraphQL\GraphQL;
use GraphQL\Type\{Schema, SchemaConfig};
use GraphQL\Type\Definition\{ObjectType, Type};
use model\{ExecutiveEditor, Manuscript, ManuscriptLanguage, Reviewer, User};
use function jwt_helpers\{createJsonWebToken, extractJsonWebToken};
use function model\allManuscriptLanguages;

$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'manuscriptLanguages' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptLanguage::$graphQLType))),
      'resolve' => fn(): array => allManuscriptLanguages()
    ],
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
      'type' => ExecutiveEditor::$executiveEditorQueryType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isExecutiveEditor() ? $user : null
    ]
  ]
]);

/** @throws MySafeGraphQLException */
function resolveRegister(array $args): string
{
  $user = User::fromGraphQLInput($args['userInput']);

  if ($user->insert()) {
    return $user->username;
  } else {
    throw new MySafeGraphQLException("Could not insert user into database!");
  }
}

function resolveLogin(string $username, string $password): ?string
{
  $user = User::selectUserFromDatabase($username);

  return !is_null($user) && password_verify($password, $user->pwHash)
    ? createJsonWebToken($user)
    : null;
}

/** @throws MySafeGraphQLException */
function resolveUser(): ?User
{
  $jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? null;

  if (is_null($jwt)) {
    return null;
  }

  $username = extractJsonWebToken($jwt);

  return User::selectUserFromDatabase($username);
}

$mutationType = new ObjectType([
  "name" => "Mutation",
  'fields' => [
    'register' => [
      'args' => [
        'userInput' => Type::nonNull(User::$graphQLInputObjectType)
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveRegister($args)
    ],
    'login' => [
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'password' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveLogin($args['username'], $args['password'])
    ],
    'me' => [
      'type' => User::$graphQLMutationsType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => $user
    ],
    'reviewerMutations' => [
      'type' => Reviewer::$mutationType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isReviewer() ? $user : null
    ],
    'executiveEditor' => [
      'type' => ExecutiveEditor::$mutationsType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isExecutiveEditor() ? $user : null
    ]
  ]
]);

cors();

try {
  $schema = new Schema(
    SchemaConfig::create()
      ->setQuery($queryType)
      ->setMutation($mutationType)
  );

  $rawInput = file_get_contents('php://input');
  $input = json_decode($rawInput, true);

  if ($input != null) {

    $variablesValues = $input['variables'] ?? null;
    $operationName = $input['operationName'] ?? null;

    $debug = DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE | DebugFlag::RETHROW_INTERNAL_EXCEPTIONS | DebugFlag::RETHROW_UNSAFE_EXCEPTIONS;

    $output = GraphQL::executeQuery($schema, $input['query'], null, $contextValue = resolveUser(), $variablesValues, $operationName)->toArray($debug);
  } else {
    $output = [
      'data' => null,
      'errors' => [FormattedError::createFromException(new Exception('No input given!'))]
    ];
  }
} catch (Throwable $exception) {
  error_log($exception);

  $output = [
    'data' => null,
    'errors' => [FormattedError::createFromException($exception)]
  ];
}

header('Content-Type: application/json; charset=UTF-8', true, 200);
echo json_encode($output);
