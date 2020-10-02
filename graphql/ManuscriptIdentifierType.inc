<?php

namespace tlh_dig\graphql;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

class ManuscriptIdentifierType extends Enum
{
  static /*EnumType*/
    $graphQLEnumType;

  const ExcavationNumber = 'ExcavationNumber';
  const CollectionNumber = 'CollectionNumber';
  const PublicationShortReference = 'PublicationShortReference';

}

ManuscriptIdentifierType::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptIdentifierType',
  'values' => ['ExcavationNumber', 'CollectionNumber', 'PublicationShortReference']
]);