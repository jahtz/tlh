<?php

require_once __DIR__ . '/sql_queries.php';
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/jwt_helpers.php';
require_once __DIR__ . '/MySafeGraphQLException.php';

require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/ManuscriptLanguage.php';
require_once __DIR__ . '/model/ManuscriptIdentifier.php';
require_once __DIR__ . '/model/User.php';

use GraphQL\Error\{DebugFlag, FormattedError};
use GraphQL\GraphQL;
use GraphQL\Type\{Schema, SchemaConfig};
use GraphQL\Type\Definition\{ObjectType, Type};
use model\{Manuscript, ManuscriptLanguage, User};
use function jwt_helpers\createJsonWebToken;
use function jwt_helpers\extractJsonWebToken;
use function model\allManuscriptLanguages;


$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'userCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => function (?int $_rootValue, array $_args, ?User $user): int {
        if (is_null($user)) {
          throw new MySafeGraphQLException('User is not logged in!');
        }
        if($user->rights !== 'ExecutiveEditor') {
          throw new MySafeGraphQLException('Only executive editors can view users!');
        }

        return User::selectCount();
      }
    ],
    'users' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(User::$graphQLQueryType))),
      'args' => [
        'page' => Type::nonNull(Type::int())
      ],
      'resolve' => function (?int $_rootValue, array $args, ?User $user): array {
        if (is_null($user)) {
          throw new MySafeGraphQLException('User is not logged in!');
        }
        if ($user->rights !== 'ExecutiveEditor') {
          throw new MySafeGraphQLException('Only executive editors can view users!');
        }

        return User::selectUsersPaginated($args['page']);
      }
    ],

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
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?array => $user !== null ? Manuscript::selectManuscriptIdentifiersForUser($user->username) : null,
    ],
    'manuscriptsToReview' => [
      'type' => Type::listOf(Type::nonNull(Type::string())),
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?array => $user !== null && $user->isReviewer() ? selectManuscriptsToReview($user->username) : null
    ],
    'manuscript' => [
      'type' => Manuscript::$graphQLType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(?int $_rootValue, array $args): ?Manuscript => Manuscript::selectManuscriptById($args['mainIdentifier'])
    ]
  ]
]);

/**
 * @throws MySafeGraphQLException
 */
function resolveRegister(array $args): string
{
  $user = User::fromGraphQLInput($args['userInput']);

  if ($user->insert()) {
    return $user->username;
  } else {
    throw new MySafeGraphQLException("Could not insert user into database!");
  }
}

/**
 * @throws MySafeGraphQLException
 */
function resolveLogin(string $username, string $password): ?string
{
  $user = User::selectUserFromDatabase($username);

  return $user !== null && password_verify($password, $user->pwHash)
    ? createJsonWebToken($user)
    : null;
}

/**
 * @throws MySafeGraphQLException
 */
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
} catch (Throwable $e) {
  error_log($e->getMessage());

  $output = [
    'data' => null,
    'errors' => [FormattedError::createFromException($e)]
  ];
}

header('Content-Type: application/json; charset=UTF-8', true, 200);
echo json_encode($output);
