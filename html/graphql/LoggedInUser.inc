<?php

namespace tlh_dig\graphql;

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use ReallySimpleJWT\Token;
use tlh_dig\model\User;

class LoggedInUser
{

  static ObjectType $graphQLType;

  public string $username;
  public string $name;
  public ?string $affiliation;
  public string $jwt;

  function __construct(string $username, string $name, ?string $affiliation, string $jwt) {
    $this->username = $username;
    $this->name = $name;
    $this->jwt = $jwt;
    $this->affiliation = $affiliation;
  }
}

LoggedInUser::$graphQLType = new ObjectType([
  'name' => 'LoggedInUser',
  'fields' => [
    'username' => Type::nonNull(Type::string()),
    'name' => Type::nonNull(Type::string()),
    'affiliation' => Type::string(),
    'jwt' => Type::nonNull(Type::string())
  ]
]);


function verifyUser(string $username, string $password): ?LoggedInUser {
  global $jwtSecret, $jwtValidityTime;

  $user = maybeUserFromDatabase($username);

  if ($user === null) {
    return null;
  }

  if (password_verify($password, $user->pwHash)) {
    return new LoggedInUser(
      $user->username,
      $user->name,
      $user->affiliation,
      Token::create($user->username, $jwtSecret, time() + $jwtValidityTime, 'localhost')
    );
  } else {
    return null;
  }
}

/**
 * @throws MySafeGraphQLException
 */
function register(array $args): string {
  $user = User::fromGraphQLInput($args['userInput']);

  if ($user === null) {
    throw new MySafeGraphQLException("Could not read input!");
  }

  $inserted = insertUserIntoDatabase($user);

  if ($inserted) {
    return $user->username;
  } else {
    throw new MySafeGraphQLException("Could not insert user into database!");
  }
}

/**
 * @throws InvalidTokenException
 */
function resolveUser(): ?string {
  global $jwtSecret;

  $jwt = $_SERVER['HTTP_AUTHORIZATION'];

  if (!Token::validate($jwt, $jwtSecret)) {
    throw new InvalidTokenException('Invalid login information. Maybe your login is expired? Try logging out and logging back in again.');
  }

  try {
    return Token::getPayload($jwt, $jwtSecret)['user_id'];
  } catch (Exception $e) {
    throw new InvalidTokenException('Invalid login information. Maybe your login is expired? Try logging out and logging back in again.');
  }
}