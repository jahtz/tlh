<?php

namespace model;

use GraphQL\Type\Definition\EnumType;

class ManuscriptIdentifierType
{
  static EnumType $graphQLType;
}

ManuscriptIdentifierType::$graphQLType = new EnumType([
  'name' => 'ManuscriptIdentifierType',
  'values' => ['ExcavationNumber', 'CollectionNumber', 'PublicationShortReference']
]);
