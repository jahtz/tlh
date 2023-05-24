<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/TransliterationReviewer.php';
require_once __DIR__ . '/XmlConverter.php';
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
    'firstXmlReview' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => FirstXmlReviewer::selectXmlForFirstXmlReviewAppointment($args['mainIdentifier'], $user->username)
    ],
    'secondXmlReview' => [
      'type' => Type::string(),
      'args' =>[
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args) : ?string => SecondXmlReviewer::selectXmlForSecondReviewAppointment($args['mainIdentifier'], $user->username)
    ]
  ]
]);

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
      'resolve' => function (User $user, array $args): bool {
        $mainIdentifier = $args['mainIdentifier'];
        $conversion = $args['conversion'];

        if (!TransliterationReviewer::selectTransliterationReviewPerformed($mainIdentifier)) {
          throw new MySafeGraphQLException("Transliteration review of manuscript $mainIdentifier is not yet performed!");
        }

        if (!XmlConverter::selectUserIsAppointedForXmlConversion($mainIdentifier, $user->username)) {
          throw new MySafeGraphQLException("User $user->username is not appointed for xml conversion of manuscript $mainIdentifier!");
        }

        if (XmlConverter::selectXmlConversionPerformed($mainIdentifier)) {
          throw new MySafeGraphQLException("Xml conversion for manuscript $mainIdentifier is already performed!");
        }

        // TODO: check if $conversion is xml and fulfills schema?

        return XmlConverter::insertXmlConversion($mainIdentifier, $user->username, $conversion);
      }
    ],
    'submitFirstXmlReview' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'review' => Type::nonNull(Type::string())
      ],
      'resolve' => function (User $user, array $args): bool {
        $mainIdentifier = $args['mainIdentifier'];
        $review = $args['review'];

        // TODO: check conditions!

        return false;
      }
    ]
  ]
]);