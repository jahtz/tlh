<?php

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/jwt_helpers.php';
require_once __DIR__ . '/MySafeGraphQLException.php';
require_once __DIR__ . '/mailer.php';

require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/ManuscriptLanguage.php';
require_once __DIR__ . '/model/ManuscriptIdentifier.php';
require_once __DIR__ . '/model/User.php';
require_once __DIR__ . '/model/Reviewer.php';
require_once __DIR__ . '/model/ExecutiveEditor.php';
require_once __DIR__ . '/model/RootQuery.php';

use GraphQL\Error\{DebugFlag, FormattedError};
use GraphQL\GraphQL;
use GraphQL\Type\{Schema, SchemaConfig};
use GraphQL\Type\Definition\{ObjectType, Type};
use model\{ExecutiveEditor, Manuscript, ManuscriptInput, Reviewer, RootQuery, User};
use Ramsey\Uuid\Uuid;
use function jwt_helpers\{createJsonWebToken, extractJsonWebToken};

/** @throws MySafeGraphQLException */
function resolveRegister(array $args): string
{
  $user = User::fromGraphQLInput($args['userInput']);

  if ($user->insert()) {
    return $user->username;
  } else {
    throw new MySafeGraphQLException("Could not insert user into database!");
  }
}

function resolveLogin(string $username, string $password): ?string
{
  $user = User::selectUserFromDatabase($username);

  return !is_null($user) && password_verify($password, $user->pwHash)
    ? createJsonWebToken($user)
    : null;
}

/** @throws MySafeGraphQLException */
function resolveUser(): ?User
{
  $jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? null;

  if (is_null($jwt)) {
    return null;
  }

  $username = extractJsonWebToken($jwt);

  return User::selectUserFromDatabase($username);
}

/** @throws MySafeGraphQLException */
function resolveForgotPassword(string $mail): ?string
{
  // check if mail exists...
  $maybeUser = User::selectUserByMail($mail);

  if (is_null($maybeUser)) {
    return null;
  }

  // Save pw recovery code...

  $uuid = Uuid::uuid4()->toString();

  try {
    $maybeUser->upsertPasswortRecoveryToken($uuid);
  } catch (Exception $exception) {
    error_log($exception);
    throw new MySafeGraphQLException("Internal error...");
  }

  $serverUrl = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://{$_SERVER['HTTP_HOST']}";

  error_log($serverUrl);

  // generate mail with url...
  $url = "$serverUrl/tlh_editor/public/resetPassword?uuid=$uuid";

  $mailSent = sendSingleMail(
    $maybeUser->email,
    "Password reset",
    "Click on this link $url to reset your password!"
  );

  if (!$mailSent) {
    error_log("URL: $url");
  }

  return $mail;
}

/** @throws MySafeGraphQLException */
function resolveResetPassword(string $uuid, string $newPassword, string $newPasswordRepeat): ?string
{
  if ($newPassword !== $newPasswordRepeat) {
    throw new MySafeGraphQLException("Passwords don't match!");
  }

  $maybeUser = User::selectUserByPwRecoveryUuid($uuid);

  if (is_null($maybeUser)) {
    return null;
  }

  try {
    $maybeUser->updatePasswordHashAfterRecovery(password_hash($newPassword, PASSWORD_DEFAULT));

    return "Password successfully reset!";
  } catch (Exception $exception) {
    error_log($exception);
    return null;
  }
}

$mutationType = new ObjectType([
  'name' => 'Mutation',
  'fields' => [
    'register' => [
      'args' => [
        'userInput' => Type::nonNull(User::$graphQLInputObjectType)
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveRegister($args)
    ],
    'login' => [
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'password' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveLogin($args['username'], $args['password'])
    ],
    'forgotPassword' => [
      'args' => [
        'mail' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveForgotPassword($args['mail'])
    ],
    'resetPassword' => [
      'args' => [
        'uuid' => Type::nonNull(Type::string()),
        'newPassword' => Type::nonNull(Type::string()),
        'newPasswordRepeat' => Type::nonNull(Type::string())
      ],
      'type' => Type::string(),
      'resolve' => fn(?int $_rootValue, array $args) => resolveResetPassword($args['uuid'], $args['newPassword'], $args['newPasswordRepeat'])
    ],
    'createManuscript' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'values' => ManuscriptInput::$graphQLInputObjectType
      ],
      'resolve' => function (?int $_rootValue, array $args, ?User $user): string {
        if (is_null($user)) {
          throw new MySafeGraphQLException('Not logged in!');
        }

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
      'resolve' => fn(?int $_rootValue, array $args): ?Manuscript => Manuscript::selectManuscriptById($args['mainIdentifier'])
    ],
    'reviewerMutations' => [
      'type' => Reviewer::$mutationType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isReviewer() ? $user : null
    ],
    'executiveEditor' => [
      'type' => ExecutiveEditor::$mutationsType,
      'resolve' => fn(?int $_rootValue, array $_args, ?User $user): ?User => !is_null($user) && $user->isExecutiveEditor() ? $user : null
    ]
  ]
]);

cors();

try {
  $schema = new Schema(
    SchemaConfig::create()
      ->setQuery(RootQuery::$queryType)
      ->setMutation($mutationType)
  );

  $rawInput = file_get_contents('php://input');
  $input = json_decode($rawInput, true);

  if ($input != null) {

    $variablesValues = $input['variables'] ?? null;
    $operationName = $input['operationName'] ?? null;

    $debug = DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE | DebugFlag::RETHROW_INTERNAL_EXCEPTIONS | DebugFlag::RETHROW_UNSAFE_EXCEPTIONS;

    $output = GraphQL::executeQuery($schema, $input['query'], null, $contextValue = resolveUser(), $variablesValues, $operationName)->toArray($debug);
  } else {
    $output = [
      'data' => null,
      'errors' => [FormattedError::createFromException(new Exception('No input given!'))]
    ];
  }
} catch (Throwable $exception) {
  error_log($exception);

  $output = [
    'data' => null,
    'errors' => [FormattedError::createFromException($exception)]
  ];
}

header('Content-Type: application/json; charset=UTF-8', true, 200);
echo json_encode($output);
