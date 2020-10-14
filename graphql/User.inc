<?php

namespace tlh_dig\graphql;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;

class User
{

  static /*InputObjectType*/
    $graphQLInputObjectType;

  public /*string*/
    $username;
  public /*string*/
    $pwHash;
  public /*string*/
    $name;
  public /*?string*/
    $affiliation;
  public /*string*/
    $email;

  function __construct(string $username, string $pwHash, string $name, ?string $affiliation, string $email) {
    $this->username = $username;
    $this->pwHash = $pwHash;
    $this->name = $name;
    $this->affiliation = $affiliation;
    $this->email = $email;
  }

  static function fromGraphQLInput(array $graphQLInputObject): ?User {
    $password = $graphQLInputObject['password'];
    $passwordRepeat = $graphQLInputObject['passwordRepeat'];

    if ($password !== $passwordRepeat) {
      return null;
    }

    return new User(
      $username = $graphQLInputObject['username'],
      $pwHash = password_hash($password, PASSWORD_DEFAULT),
      $name = $graphQLInputObject['name'],
      $affiliation = $graphQLInputObject['affiliation'] ?? null,
      $email = $graphQLInputObject['email']
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
