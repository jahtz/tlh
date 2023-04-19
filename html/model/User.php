<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';

use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli_stmt;
use function sql_helpers\{executeSingleInsertQuery, executeSingleSelectQuery};

class User
{
  static InputObjectType $graphQLInputObjectType;

  public string $username;
  public string $pwHash;
  public string $name;
  public ?string $affiliation;
  public string $email;

  function __construct(string $username, string $pwHash, string $name, ?string $affiliation, string $email)
  {
    $this->username = $username;
    $this->pwHash = $pwHash;
    $this->name = $name;
    $this->affiliation = $affiliation;
    $this->email = $email;
  }

  static function selectUserFromDatabase(string $username): ?User
  {
    return executeSingleSelectQuery(
      "select username, pw_hash, name, affiliation, email from tlh_dig_users where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): User => new User($row['username'], $row['pw_hash'], $row['name'], $row['affiliation'], $row['email'])
    );
  }

  function insertUserIntoDatabase(): bool
  {
    return executeSingleInsertQuery(
      "insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('sssss', $this->username, $this->pwHash, $this->name, $this->affiliation, $this->email)
    );
  }

  static function fromGraphQLInput(array $graphQLInputObject): ?User
  {
    $password = $graphQLInputObject['password'];
    $passwordRepeat = $graphQLInputObject['passwordRepeat'];

    if ($password !== $passwordRepeat) {
      return null;
    }

    return new User(
      $graphQLInputObject['username'],
      password_hash($password, PASSWORD_DEFAULT),
      $graphQLInputObject['name'],
      $graphQLInputObject['affiliation'] ?? null,
      $graphQLInputObject['email']
    );
  }
}

User::$graphQLInputObjectType = new InputObjectType([
  'name' => 'UserInput',
  'fields' => [
    'username' => Type::nonNull(Type::string()),
    'password' => Type::nonNull(Type::string()),
    'passwordRepeat' => Type::nonNull(Type::string()),
    'name' => Type::nonNull(Type::string()),
    'affiliation' => Type::string(),
    'email' => Type::nonNull(Type::string())
  ]
]);
