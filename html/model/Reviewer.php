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
    ],
    'xmlReview' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'reviewType' => Type::nonNull(XmlReviewType::$graphQLType)
      ],
      'resolve' => fn(User $user, array $args): ?string => $args['reviewType'] === XmlReviewType::firstXmlReview
        ? FirstXmlReviewer::selectXmlForFirstXmlReviewAppointment($args['mainIdentifier'], $user->username)
        : SecondXmlReviewer::selectXmlForSecondReviewAppointment($args['mainIdentifier'], $user->username)
    ]
  ]
]);

/** @throws MySafeGraphQLException */
function resolveSubmitTransliterationReview(User $user, string $mainIdentifier, string $review): bool
{
  $manuscript = Manuscript::selectManuscriptById($mainIdentifier);

  if (!$manuscript->selectTransliterationIsReleased()) {
    throw new MySafeGraphQLException("Transliteration of manuscript $mainIdentifier is not yet released!");
  }

  if (!TransliterationReviewer::selectUserIsAppointedForTransliterationReview($mainIdentifier, $user->username)) {
    throw new MySafeGraphQLException("User $user->username is not appointed for transliteration review of manuscript $mainIdentifier!");
  }

  // FIXME: check conditions!

  $inserted = TransliterationReviewer::insertTransliterationReview($mainIdentifier, $user->username, $review);

  sendMails(
    "Transliteration review performed for manuscript $mainIdentifier",
    "Transliteration review was performed for manuscript $mainIdentifier by " . $user->username,
  );

  return $inserted;
}

/** @throws MySafeGraphQLException */
function resolveSubmitXmlConversion(User $user, string $mainIdentifier, string $conversion): bool
{
  if (!TransliterationReviewer::selectTransliterationReviewPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("Transliteration review of manuscript $mainIdentifier is not yet performed!");
  }

  if (!XmlConverter::selectUserIsAppointedForXmlConversion($mainIdentifier, $user->username)) {
    throw new MySafeGraphQLException("User $user->username is not appointed for xml conversion of manuscript $mainIdentifier!");
  }

  if (XmlConverter::selectXmlConversionPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("Xml conversion for manuscript $mainIdentifier has already been performed!");
  }

  // TODO: check if $conversion is xml and fulfills schema?

  $inserted = XmlConverter::insertXmlConversion($mainIdentifier, $user->username, $conversion);

  sendMails(
    "Xml conversion performed for manuscript $mainIdentifier",
    "Xml conversion was performed for manuscript $mainIdentifier by " . $user->username,
  );

  return $inserted;
}

/** @throws MySafeGraphQLException */
function resolveSubmitFirstXmlReview(User $user, string $mainIdentifier, string $review): bool
{
  if (!XmlConverter::selectXmlConversionPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("Xml conversion for manuscript $mainIdentifier has not yet been performed!");
  }

  if (!FirstXmlReviewer::selectUserIsAppointedForFirstXmlReview($mainIdentifier, $user->username)) {
    throw new MySafeGraphQLException("User $user->username is not appointed for first xml review of manuscript $mainIdentifier!");
  }

  if (FirstXmlReviewer::selectFirstXmlReviewPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("First xml review of manuscript $mainIdentifier has already been performed!");
  }

  $inserted = FirstXmlReviewer::insertFirstXmlReview($mainIdentifier, $user->username, $review);

  sendMails(
    "First Xml review performed for manuscript $mainIdentifier",
    "First Xml review was performed for manuscript $mainIdentifier by " . $user->username,
  );

  return $inserted;
}

/** @throws MySafeGraphQLException */
function resolveSubmitSecondXmlReview(User $user, string $mainIdentifier, string $review): bool
{
  if (!FirstXmlReviewer::selectFirstXmlReviewPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("First xml review of manuscript $mainIdentifier has not yet been performed!");
  }

  if (!SecondXmlReviewer::selectUserIsAppointedForSecondXmlReview($mainIdentifier, $user->username)) {
    throw new MySafeGraphQLException("User $user->username is not appointed for second xml review of manuscript $mainIdentifier!");
  }

  if (SecondXmlReviewer::selectSecondXmlReviewPerformed($mainIdentifier)) {
    throw new MySafeGraphQLException("Second xml review of manuscript $mainIdentifier has already been performed!");
  }

  $inserted = SecondXmlReviewer::insertSecondXmlReview($mainIdentifier, $user->username, $review);

  sendMails(
    "Second Xml review performed for manuscript $mainIdentifier",
    "Second Xml review was performed for manuscript $mainIdentifier by " . $user->username,
  );

  return $inserted;
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