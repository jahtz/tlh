<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptInput.php';

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use MySafeGraphQLException;
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleChangeQuery, executeSingleSelectQuery};

$rightsGraphQLType = new EnumType([
  'name' => 'Rights',
  'values' => ['Author', 'Reviewer', 'ExecutiveEditor']
]);

class User
{
  static ObjectType $graphQLQueryType;
  static ObjectType $graphQLMutationsType;
  static InputObjectType $graphQLInputObjectType;

  public string $username;
  public string $pwHash;
  public string $name;
  public ?string $affiliation;
  public string $email;
  public string $rights;

  function __construct(string $username, string $pwHash, string $name, ?string $affiliation, string $email, string $rights = 'Author')
  {
    $this->username = $username;
    $this->pwHash = $pwHash;
    $this->name = $name;
    $this->affiliation = $affiliation;
    $this->email = $email;
    $this->rights = $rights;
  }

  function isReviewer(): bool
  {
    return $this->rights !== 'Author';
  }

  function isExecutiveEditor(): bool
  {
    return $this->rights === 'ExecutiveEditor';
  }

  // GraphQL

  /**
   * @param array $input
   * @return User
   * @throws MySafeGraphQLException
   */
  static function fromGraphQLInput(array $input): User
  {
    if ($input['password'] === $input['passwordRepeat']) {
      return new User($input['username'], password_hash($input['password'], PASSWORD_DEFAULT), $input['name'], $input['affiliation'] ?? null, $input['email']);
    } else {
      throw new MySafeGraphQLException("Password don't match!");
    }
  }

  // SQL

  static function selectCount(): int
  {
    return executeSingleSelectQuery(
      "select count(*) as user_count from tlh_dig_users;",
      null,
      fn(array $row): int => (int)$row['user_count']
    );
  }

  static function selectUserFromDatabase(string $username): ?User
  {
    return executeSingleSelectQuery(
      "select username, pw_hash, name, affiliation, email, rights from tlh_dig_users where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): User => new User($row['username'], $row['pw_hash'], $row['name'], $row['affiliation'], $row['email'], $row['rights'])
    );
  }

  static function selectUsersPaginated(int $page): array
  {
    $pageSize = 10;
    $first = $page * $pageSize;

    return executeMultiSelectQuery(
      "select username, pw_hash, name, affiliation, email, rights from tlh_dig_users order by username limit ?, ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ii', $first, $pageSize),
      fn(array $row): User => new User($row['username'], $row['pw_hash'], $row['name'], $row['affiliation'], $row['email'], $row['rights'])
    );
  }

  function insert(): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $this->username, $this->pwHash, $this->name, $this->affiliation, $this->email)
    );
  }

  static function updateRights(string $username, string $newRights): bool
  {
    return executeSingleChangeQuery(
      "update tlh_dig_users set rights = ? where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $newRights, $username)
    );
  }
}

User::$graphQLQueryType = new ObjectType([
  'name' => 'User',
  'fields' => [
    'username' => Type::nonNull(Type::string()),
    'name' => Type::nonNull(Type::string()),
    'affiliation' => Type::string(),
    'email' => Type::nonNull(Type::string()),
    'rights' => Type::nonNull($rightsGraphQLType)
  ]
]);

User::$graphQLMutationsType = new ObjectType([
  'name' => 'LoggedInUserMutations',
  'fields' => [
    'createManuscript' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'values' => ManuscriptInput::$graphQLInputObjectType
      ],
      'resolve' => function (User $user, array $args): string {
        $manuscript = ManuscriptInput::fromGraphQLInput($args['values'], $user->username);

        if ($manuscript->insert()) {
          return $manuscript->mainIdentifier->identifier;
        } else {
          throw new MySafeGraphQLException("Could not insert manuscript " . $manuscript->mainIdentifier->identifier);
        }
      }
    ],
    'manuscript' => [
      'type' => Manuscript::$graphQLMutationsType,
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $_user, array $args): ?Manuscript => Manuscript::selectManuscriptById($args['mainIdentifier'])
    ],
    'updateUserRights' => [
      'type' => Type::nonNull($rightsGraphQLType),
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'newRights' => Type::nonNull($rightsGraphQLType),
      ],
      'resolve' => function (User $user, array $args): string {
        if (!$user->isExecutiveEditor()) {
          throw new MySafeGraphQLException('Only executive editors can change user rights!');
        }

        $username = $args['username'];
        $newRights = $args['newRights'];

        if (User::updateRights($username, $args['newRights'])) {
          return $newRights;
        } else {
          throw new MySafeGraphQLException("Could not change rights for user $username to $newRights");
        }
      }
    ],
  ]
]);

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
