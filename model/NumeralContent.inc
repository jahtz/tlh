<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class NumeralContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphqlInputObjectType;

  private string $type = 'numeral';
  public bool $isSubscript;
  public string $content;

  public function __construct(bool $isSubscript, string $content) {
    $this->isSubscript = $isSubscript;
    $this->content = $content;
  }

  static function readFromGraphQLInput(array $input): NumeralContent {
    return new NumeralContent($input['isSubscript'], urldecode($input['content']));
  }

  protected function getType(): string {
    return 'numeral';
  }

  protected function isSubscript(): ?bool {
    return $this->isSubscript;
  }

  function graphQLType(): ObjectType {
    return NumeralContent::$graphQLObjectType;
  }
}

NumeralContent::$graphQLObjectType = new ObjectType([
  'name' => 'NumeralContent',
  'fields' => [
    'isSubscript' => Type::nonNull(Type::boolean()),
    'content' => Type::nonNull(Type::string())
  ]
]);

NumeralContent::$graphqlInputObjectType = new InputObjectType([
  'name' => 'NumeralContentInput',
  'fields' => [
    'isSubscript' => Type::nonNull(Type::boolean()),
    'content' => Type::nonNull(Type::string())
  ]
]);
