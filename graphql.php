<?php

require_once 'sql_queries.inc';

require_once 'vendor/autoload.php';

require_once 'graphql/ManuscriptMetaData.inc';
require_once 'graphql/ManuscriptMetaDataInput.inc';
require_once 'graphql/User.inc';
require_once 'graphql/LoggedInUser.inc';

use GraphQL\GraphQL;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use ReallySimpleJWT\Token;
use tlh_dig\graphql\LoggedInUser;
use tlh_dig\graphql\ManuscriptMetaData;
use tlh_dig\graphql\ManuscriptMetaDataInput;
use tlh_dig\graphql\User;

# Must be 12 characters in length, contain upper and lower case letters, a number, and a special character `*&!@%^#$``
$jwtSecret = '1234%ASDf_0aosd';

$queryType = new ObjectType([
  'name' => 'Query',
  'fields' => [
    'allManuscripts' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptMetaData::$graphQLType))),
      'resolve' => function (): array {
        return allManuscriptMetaData();
      }
    ],
    'manuscript' => [
      'type' => ManuscriptMetaData::$graphQLType,
      'args' => [
        'id' => Type::nonNull(Type::int())
      ],
      'resolve' => function ($rootValue, array $args): ?ManuscriptMetaData {
        return manuscriptMetaDataById($args['id']);
      }
    ]
  ]
]);

$loggedInUserMutationsType = new ObjectType([
  'name' => 'LoggedInUserMutations',
  'fields' => [
    'createManuscript' => [
      'type' => Type::int(),
      'args' => [
        'values' => ManuscriptMetaDataInput::$graphQLInputObjectType
      ],
      'resolve' => function (string $username, array $args): ?int {
        return insertManuscriptMetaData(
          ManuscriptMetaDataInput::fromGraphQLArray($args['values'], $username)
        );
      }
    ]
  ]
]);

$mutationType = new ObjectType([
  "name" => "Mutation",
  'fields' => [
    'register' => [
      'args' => [
        'userInput' => Type::nonNull(User::$graphQLInputObjectType)
      ],
      'type' => Type::string(),
      'resolve' => function ($rootValue, array $args): ?string {
        $user = User::fromGraphQLInput($args['userInput']);

        if ($user === null) {
          return null;
        }

        return insertUserIntoDatabase($user) ? $user->username : null;
      }
    ],
    'login' => [
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'password' => Type::nonNull(Type::string())
      ],
      'type' => LoggedInUser::$graphQLType,
      'resolve' => function ($rootValue, array $args): ?LoggedInUser {
        global $jwtSecret;

        $user = maybeUserFromDatabase($args['username']);

        if ($user !== null && password_verify($args['password'], $user->pwHash)) {
          return new LoggedInUser(
            $user->username,
            $user->name,
            $user->affiliation,
            Token::create($user->username, $jwtSecret, time() + 3600, 'localhost')
          );
        } else {
          return null;
        }
      }
    ],
    'me' => [
      'args' => [
        'jwt' => Type::nonNull(Type::string())
      ],
      'type' => $loggedInUserMutationsType,
      'resolve' => function ($rootValue, array $args): ?string {
        global $jwtSecret;

        $jwt = $args['jwt'];

        if (!Token::validate($jwt, $jwtSecret)) {
          error_log('Token not valid!');
          return null;
        }

        try {
          return Token::getPayload($jwt, $jwtSecret)['user_id'];
        } catch (Exception $e) {
          return null;
        }
      }
    ]
  ]
]);

$schema = new Schema(
  SchemaConfig::create()
    ->setQuery($queryType)
    ->setMutation($mutationType)
);

try {
  $rawInput = file_get_contents('php://input');
  $input = json_decode($rawInput, true);

  $variablesValues = isset($input['variables']) ? $input['variables'] : null;
  $operationName = isset($input['operationName']) ? $input['operationName'] : null;

  $result = GraphQL::executeQuery($schema, $input['query'], null, null, $variablesValues, $operationName);

  $output = $result->toArray();
} catch (Exception $e) {
  $output = ['error' => ['message' => $e->getMessage()]];
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
