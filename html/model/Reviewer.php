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

use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;

class Reviewer
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
    'transliterationReview' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => TransliterationReviewer::selectTransliterationReviewAppointment($args['mainIdentifier'], $user->username)
    ],
    'xmlConversion' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => XmlConverter::selectTransliterationInputForXmlConversionAppointment($args['mainIdentifier'], $user->username)
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

  return XmlConverter::insertXmlConversion($mainIdentifier, $user->username, $conversion);
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

  return FirstXmlReviewer::insertFirstXmlReview($mainIdentifier, $user->username, $review);
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

  return SecondXmlReviewer::insertSecondXmlReview($mainIdentifier, $user->username, $review);
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
      // FIXME: check conditions!
      'resolve' => fn(User $user, array $args): bool => TransliterationReviewer::insertTransliterationReview($args['mainIdentifier'], $user->username, $args['review'])
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