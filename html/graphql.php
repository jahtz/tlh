<?php

require_once 'sql_queries.php';
require_once 'cors.php';

require_once 'vendor/autoload.php';

require_once 'model/ManuscriptMetaData.php';
require_once 'model/ManuscriptLanguages.php';
require_once 'model/User.php';

use GraphQL\Error\{ClientAware, DebugFlag, FormattedError};
use GraphQL\GraphQL;
use GraphQL\Type\{Schema, SchemaConfig};
use GraphQL\Type\Definition\{ObjectType, Type};
use ReallySimpleJWT\Token;
use tlh_dig\model\{ManuscriptLanguage, ManuscriptMetaData, Transliteration, User};
use function tlh_dig\model\allManuscriptLanguages;

class MySafeGraphQLException extends Exception implements ClientAware
{
  public function isClientSafe(): bool
  {
    return true;
  }
}

# Must be 12 characters in length, contain upper and lower case letters, a number, and a special character `*&!@%^#$``
$jwtSecret = '1234%ASDf_0aosd';

$jwtValidityTime = 24 * 60 * 60; // 24 h

$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'manuscriptLanguages' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptLanguage::$graphQLType))),
      'resolve' => fn() => allManuscriptLanguages()
    ],
    'manuscriptCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn() => allManuscriptsCount()
    ],
    'allManuscripts' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptMetaData::$graphQLType))),
      'args' => [
        'paginationSize' => Type::nonNull(Type::int()),
        'page' => Type::nonNull(Type::int())
      ],
      'resolve' => fn($rootValue, array $args) => allManuscriptMetaData($args['paginationSize'], $args['page'])
    ],
    'manuscript' => [
      'type' => ManuscriptMetaData::$graphQLType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn($rootValue, array $args) => manuscriptMetaDataById($args['mainIdentifier'])
    ]
  ]
]);

$manuscriptMutationsType = new ObjectType([
  'name' => 'ManuscriptMutations',
  'fields' => [
    'updateTransliteration' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'values' => Type::nonNull(Type::listOf(Type::nonNull(Transliteration::$graphQLInputObjectType)))
      ],
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData, array $args): ?string {
        $mainIdentifier = $manuscriptMetaData->mainIdentifier->identifier;

        $mapped = array_map(fn($x) => Transliteration::readFromGraphQLInput($mainIdentifier, $x), $args['values']);

        error_log(json_encode($mapped, JSON_PRETTY_PRINT));

        $allSaved = true;

        $connection = connect_to_db();

        $connection->begin_transaction();

        try {
          foreach ($mapped as $transliterationLine) {
            $allSaved &= $transliterationLine->saveToDb($connection);
          }

          error_log("All saved: " . ($allSaved ? "true" : "false"));

          if ($allSaved) {
            $connection->commit();
          } else {
            $connection->rollback();
          }
        } catch (mysqli_sql_exception $e) {
          $connection->rollback();
        }

        $connection->close();

        return $allSaved;
      }
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
      'resolve' => function (string $username, array $args): ?string {
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
      'resolve' => fn(string $username, array $args) => manuscriptMetaDataById($args['mainIdentifier'])
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
      'resolve' => fn($rootValue, array $args) => register($args)
    ],
    'login' => [
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'password' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn($rootValue, array $args) => verifyUser($args['username'], $args['password'])
    ],
    'me' => [
      'type' => $loggedInUserMutationsType,
      'resolve' => fn($rootValue, array $args) => resolveUser()
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

    $output = GraphQL::executeQuery($schema, $query, null, $authHeader, $variablesValues, $operationName)->toArray($debug);
  } else {
    $output = [
      'data' => null,
      'errors' => [FormattedError::createFromException(new Exception('No input given!'))]
    ];
  }
} catch (Throwable $e) {
  error_log($e);

  $output = [
    'data' => null,
    'errors' => [FormattedError::createFromException($e)]
  ];
}


header('Content-Type: application/json; charset=UTF-8', true, 200);

echo json_encode($output);
