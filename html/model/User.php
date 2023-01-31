<?php

namespace model;

use GraphQL\Type\Definition\{InputObjectType, Type};

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

  static function fromDbAssocArray(array $dbArray): User
  {
    return new User($dbArray['username'], $dbArray['pw_hash'], $dbArray['name'], $dbArray['affiliation'], $dbArray['email']);
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
