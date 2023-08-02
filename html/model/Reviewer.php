<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/TransliterationReviewer.php';
require_once __DIR__ . '/XmlConverter.php';
require_once __DIR__ . '/XmlReviewType.php';
require_once __DIR__ . '/FirstXmlReviewer.php';
require_once __DIR__ . '/SecondXmlReviewer.php';
require_once __DIR__ . '/../mailer.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;

abstract class Reviewer
{
  /* TODO: make subclass of User? */

  static ObjectType $queryType;
  static ObjectType $mutationType;
}

Reviewer::$queryType = new ObjectType([
  'name' => 'Reviewer',
  'fields' => [
    'appointments' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Appointment::$queryType))),
      'resolve' => fn(User $user): array => array_merge(
        TransliterationReviewer::selectUnfinishedTransliterationReviewAppointments($user->username),
        XmlConverter::selectUnfinishedXmlConversionAppointments($user->username),
        FirstXmlReviewer::selectUnfinishedFirstXmlReviewAppointments($user->username),
        SecondXmlReviewer::selectUnfinishedSecondXmlReviewAppointments($user->username)
      )
    ]
  ]
]);

/**
 * @param string $stepName
 * @param User $user
 * @param string $mainIdentifier
 * @param callable(Manuscript):bool $selectPriorStepPerformed
 * @param callable(Manuscript):null|string $selectAppointedUsername
 * @param callable(Manuscript):bool $selectStepIsAlreadyPerformed
 * @param callable(Manuscript):bool $insertStepData
 *
 * @return bool
 *
 * @throws MySafeGraphQLException
 */
function resolveSubmitStep(
  string   $stepName,
  User     $user,
  string   $mainIdentifier,
  callable $selectPriorStepPerformed,
  callable $selectAppointedUsername,
  callable $selectStepIsAlreadyPerformed,
  callable $insertStepData
): bool
{
  $manuscript = Manuscript::resolveManuscriptById($mainIdentifier);

  // ensure that prior step is performed
  if (!$selectPriorStepPerformed($manuscript)) {
    throw new MySafeGraphQLException("Prior step for $stepName is not performed yet!");
  }

  // ensure that user is appointed
  $appointedUsername = $selectAppointedUsername($manuscript);
  if (is_null($appointedUsername)) {
    throw new MySafeGraphQLException("No user is appointed for $stepName of manuscript " . $manuscript->mainIdentifier->identifier);
  }
  if ($appointedUsername != $user->username) {
    throw new MySafeGraphQLException("User $user->username is not appointed for $stepName of manuscript " . $manuscript->mainIdentifier->identifier);
  }

  if ($selectStepIsAlreadyPerformed($manuscript)) {
    throw new MySafeGraphQLException("$stepName of manuscript " . $manuscript->mainIdentifier->identifier . " is already performed!");
  }

  $inserted = $insertStepData($manuscript);
  if (!$inserted) {
    return false;
  }

  // send mails...
  sendMailToAdmins(
    "$stepName performed for manuscript $mainIdentifier",
    "$stepName was performed for manuscript $mainIdentifier by " . $user->username,
  );

  return true;
}

/** @throws MySafeGraphQLException */
function resolveSubmitTransliterationReview(User $user, string $mainIdentifier, string $review): bool
{
  return resolveSubmitStep(
    "Transliteration review",
    $user,
    $mainIdentifier,
    fn(Manuscript $manuscript): bool => $manuscript->selectTransliterationIsReleased(),
    fn(Manuscript $manuscript): ?string => $manuscript->selectUserAppointedForTransliterationReview(),
    fn(Manuscript $manuscript): bool => $manuscript->selectTransliterationReviewPerformed(),
    fn(Manuscript $manuscript): bool => TransliterationReviewer::insertTransliterationReview($mainIdentifier, $user->username, $review)
  );
}

/** @throws MySafeGraphQLException */
function resolveSubmitXmlConversion(User $user, string $mainIdentifier, string $conversion): bool
{
  // TODO: check if $conversion is xml and fulfills schema?
  return resolveSubmitStep(
    "Xml conversion",
    $user,
    $mainIdentifier,
    fn(Manuscript $manuscript): bool => $manuscript->selectTransliterationReviewPerformed(),
    fn(Manuscript $manuscript): ?string => $manuscript->selectUserAppointedForXmlConversion(),
    fn(Manuscript $manuscript): bool => $manuscript->selectXmlConversionPerformed(),
    fn(Manuscript $manuscript): bool => XmlConverter::insertXmlConversion($manuscript->mainIdentifier->identifier, $user->username, $conversion)
  );
}

/** @throws MySafeGraphQLException */
function resolveSubmitFirstXmlReview(User $user, string $mainIdentifier, string $review): bool
{
  return resolveSubmitStep(
    "First xml review",
    $user,
    $mainIdentifier,
    fn(Manuscript $manuscript): bool => $manuscript->selectXmlConversionPerformed(),
    fn(Manuscript $manuscript): ?string => $manuscript->selectUserAppointedForFirstXmlReview(),
    fn(Manuscript $manuscript): bool => $manuscript->selectFirstXmlReviewPerformed(),
    fn(Manuscript $manuscript): bool => FirstXmlReviewer::insertFirstXmlReview($manuscript->mainIdentifier->identifier, $user->username, $review)
  );
}

/** @throws MySafeGraphQLException */
function resolveSubmitSecondXmlReview(User $user, string $mainIdentifier, string $review): bool
{
  return resolveSubmitStep(
    "Second xml review",
    $user,
    $mainIdentifier,
    fn(Manuscript $manuscript): bool => $manuscript->selectFirstXmlReviewPerformed(),
    fn(Manuscript $manuscript): ?string => $manuscript->selectUserAppointedForSecondXmlReview(),
    fn(Manuscript $manuscript): bool => $manuscript->selectSecondXmlReviewPerformed(),
    fn(Manuscript $manuscript): bool => SecondXmlReviewer::insertSecondXmlReview($manuscript->mainIdentifier->identifier, $user->username, $review)
  );
}

Reviewer::$mutationType = new ObjectType([
  'name' => 'ReviewerMutations',
  'fields' => [
    'submitTransliterationReview' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'review' => Type::nonNull(Type::string()),
      ],
      'resolve' => fn(User $user, array $args): bool => resolveSubmitTransliterationReview($user, $args['mainIdentifier'], $args['review'])
    ],
    'submitXmlConversion' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'conversion' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): bool => resolveSubmitXmlConversion($user, $args['mainIdentifier'], $args['conversion'])
    ],
    'submitXmlReview' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'review' => Type::nonNull(Type::string()),
        'reviewType' => Type::nonNull(XmlReviewType::$graphQLType)
      ],
      'resolve' => fn(User $user, array $args): bool => $args['reviewType'] === XmlReviewType::firstXmlReview
        ? resolveSubmitFirstXmlReview($user, $args['mainIdentifier'], $args['review'])
        : resolveSubmitSecondXmlReview($user, $args['mainIdentifier'], $args['review'])
    ]
  ]
]);