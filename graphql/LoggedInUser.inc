<?php

namespace tlh_dig\graphql;

use GraphQL\Type\Definition\{ObjectType, Type};

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
