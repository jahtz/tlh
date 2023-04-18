<?php

require_once __DIR__ . '/sql_queries.php';
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/MySafeGraphQLException.php';

require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/model/ManuscriptMetaData.php';
require_once __DIR__ . '/model/ManuscriptLanguage.php';
require_once __DIR__ . '/model/ManuscriptIdentifier.php';
require_once __DIR__ . '/model/User.php';
require_once __DIR__ . '/model/Transliteration.php';

use GraphQL\Error\{DebugFlag, FormattedError};
use GraphQL\GraphQL;
use GraphQL\Type\{Schema, SchemaConfig};
use GraphQL\Type\Definition\{ObjectType, Type};
use model\{ManuscriptLanguage, ManuscriptMetaData, User};
use ReallySimpleJWT\Token;
use function model\allManuscriptLanguages;


# Must be 12 characters in length, contain upper and lower case letters, a number, and a special character `*&!@%^#$``
$jwtSecret = '1234%ASDf_0aosd';

$jwtValidityTime = 24 * 60 * 60; // 24 h

$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'manuscriptLanguages' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptLanguage::$graphQLType))),
      'resolve' => fn(): array => allManuscriptLanguages()
    ],
    'manuscriptCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(): int => allManuscriptsCount()
    ],
    'allManuscripts' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptMetaData::$graphQLType))),
      'args' => [
        'paginationSize' => Type::nonNull(Type::int()),
        'page' => Type::nonNull(Type::int())
      ],
      'resolve' => fn(?int $_rootValue, array $args): array => allManuscriptMetaData($args['paginationSize'], $args['page'])
    ],
    'manuscript' => [
      'type' => ManuscriptMetaData::$graphQLType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(?int $_rootValue, array $args): ?ManuscriptMetaData => manuscriptMetaDataById($args['mainIdentifier'])
    ]
  ]
]);

$manuscriptMutationsType = new ObjectType([
  'name' => 'ManuscriptMutations',
  'fields' => [
    'updateTransliteration' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'input' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(ManuscriptMetaData $manuscriptMetaData, array $args): bool => $manuscriptMetaData->saveNewTransliteration($args['input'])
    ]
  ]
]);

$loggedInUserMutationsType = new ObjectType([
  'name' => 'LoggedInUserMutations',
  'fields' => [
    'createManuscript' => [
      'type' => Type::string(),
      'args' => [
        'values' => ManuscriptMetaData::$graphQLInputObjectType
      ],
      'resolve' => function (string $username, array $args): string {
        $manuscript = ManuscriptMetaData::fromGraphQLInput($args['values'], $username);

        $manuscriptIdentifier = $manuscript->mainIdentifier->identifier;

        $manuscriptInserted = insertManuscriptMetaData($manuscript);

        if ($manuscriptInserted) {
          return $manuscriptIdentifier;
        } else {
          throw new MySafeGraphQLException("Could not save manuscript $manuscriptIdentifier to Database!");
        }
      }
    ],
    'manuscript' => [
      'type' => $manuscriptMutationsType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(string $_username, array $args): ?ManuscriptMetaData => manuscriptMetaDataById($args['mainIdentifier'])
    ]
  ]
]);

/**
 * @throws MySafeGraphQLException
 */
function register(array $args): string
{
  $user = User::fromGraphQLInput($args['userInput']);

  if ($user === null) {
    throw new MySafeGraphQLException("Could not read input!");
  }

  if (insertUserIntoDatabase($user)) {
    return $user->username;
  } else {
    throw new MySafeGraphQLException("Could not insert user into database!");
  }
}

function verifyUser(string $username, string $password): ?string
{
  global $jwtSecret, $jwtValidityTime;

  $user = maybeUserFromDatabase($username);

  if ($user === null) {
    return null;
  }

  if (password_verify($password, $user->pwHash)) {
    return Token::create($user->username, $jwtSecret, time() + $jwtValidityTime, 'localhost');
  } else {
    return null;
  }
}

/**
 * @throws MySafeGraphQLException
 */
function resolveUser(): ?string
{
  global $jwtSecret;

  $jwt = $_SERVER['HTTP_AUTHORIZATION'];

  if (!Token::validate($jwt, $jwtSecret)) {
    throw new MySafeGraphQLException('Invalid login information. Maybe your login is expired? Try logging out and logging back in again.');
  }

  try {
    return Token::getPayload($jwt, $jwtSecret)['user_id'];
  } catch (Exception $e) {
    throw new MySafeGraphQLException('Invalid login information. Maybe your login is expired? Try logging out and logging back in again.');
  }
}

$mutationType = new ObjectType([
  "name" => "Mutation",
  'fields' => [
    'register' => [
      'args' => [
        'userInput' => Type::nonNull(User::$graphQLInputObjectType)
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => register($args)
    ],
    'login' => [
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'password' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => verifyUser($args['username'], $args['password'])
    ],
    'me' => [
      'type' => $loggedInUserMutationsType,
      'resolve' => fn(?int $_rootValue, array $_args): ?string => resolveUser()
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

  $authHeader = apache_request_headers()['Authorization'] ?? null;

  if ($input != null) {

    $variablesValues = $input['variables'] ?? null;
    $operationName = $input['operationName'] ?? null;

    $debug = DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE | DebugFlag::RETHROW_INTERNAL_EXCEPTIONS | DebugFlag::RETHROW_UNSAFE_EXCEPTIONS;

    $query = $input['query'];

    /** @psalm-suppress UndefinedDocblockClass */
    $output = GraphQL::executeQuery($schema, $query, null, $authHeader, $variablesValues, $operationName)->toArray($debug);
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
