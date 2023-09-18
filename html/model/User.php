<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptInput.php';
require_once __DIR__ . '/Rights.php';

use Exception;
use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};
use MySafeGraphQLException;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

class User
{
  static InputObjectType $graphQLInputObjectType;
  static ObjectType $graphQLQueryType;

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

  private static function fromDbAssocRow(array $row): User
  {
    return new User($row['username'], $row['pw_hash'], $row['name'], $row['affiliation'], $row['email'], $row['rights']);
  }

  // GraphQL

  /** @throws MySafeGraphQLException */
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
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as user_count from tlh_dig_users;",
      null,
      fn(array $row): int => (int)$row['user_count']
    );
  }

  static function selectUserFromDatabase(string $username): ?User
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select * from tlh_dig_users where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): User => User::fromDbAssocRow($row)
    );
  }

  static function selectUserByMail(string $mail): ?User
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select * from tlh_dig_users where email = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mail),
      fn(array $row): User => User::fromDbAssocRow($row)
    );
  }

  static function selectUserByPwRecoveryUuid(string $uuid): ?User
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select * from tlh_dig_users where pw_recovery_key = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $uuid),
      fn(array $row): User => User::fromDbAssocRow($row)
    );
  }

  /** @return User[] */
  static function selectUsersPaginated(int $page): array
  {
    $pageSize = 10;
    $first = $page * $pageSize;

    return SqlHelpers::executeMultiSelectQuery(
      "select * from tlh_dig_users order by username limit ?, ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ii', $first, $pageSize),
      fn(array $row): User => new User($row['username'], $row['pw_hash'], $row['name'], $row['affiliation'], $row['email'], $row['rights'])
    );
  }

  /** @return string[] */
  static function selectAllReviewers(): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "select username from tlh_dig_users where rights <> 'Author';",
      null,
      fn(array $row): string => $row['username']
    );
  }

  /** @throws Exception */
  function insert(): bool
  {
    return SqlHelpers::executeSingleChangeQuery(
      "insert into tlh_dig_users (username, pw_hash, name, affiliation, email) values (?, ?, ?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $this->username, $this->pwHash, $this->name, $this->affiliation, $this->email)
    );
  }

  /** @throws Exception */
  function upsertPasswortRecoveryToken(?string $token): bool
  {
    return SqlHelpers::executeSingleChangeQuery(
      "update tlh_dig_users set pw_recovery_key = ? where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $token, $this->username)
    );
  }

  /** @throws Exception */
  function updatePasswordHashAfterRecovery(string $newPwHash): bool
  {
    return SqlHelpers::executeSingleChangeQuery(
      "update tlh_dig_users set pw_hash = ?, pw_recovery_key = null where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $newPwHash, $this->username)
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
    'rights' => Type::nonNull(Rights::$graphQLType)
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
