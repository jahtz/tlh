<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_stmt;
use function sql_helpers\executeMultiSelectQuery;

class DocumentInPipeline
{
  static ObjectType $queryType;

  public string $manuscriptIdentifier;
  public ?string $appointedTransliterationReviewer;
  public ?string $transliterationReviewDateString;
  public ?string $appointedXmlConverter;

  function __construct(
    string  $manuscriptIdentifier,
    ?string $appointedTransliterationReviewer,
    ?string $transliterationReviewDate,
    ?string $appointedXmlConverter
  )
  {
    $this->manuscriptIdentifier = $manuscriptIdentifier;
    $this->appointedTransliterationReviewer = $appointedTransliterationReviewer;
    $this->transliterationReviewDateString = $transliterationReviewDate;
    $this->appointedXmlConverter = $appointedXmlConverter;
  }

  static function selectCount(): int
  {
    // FIXME: implement with query!
    return 0;
  }

  static function selectDocumentsInPipeline(int $page = 0): array
  {
    $pageSize = 10;
    $firstIndex = $page * $pageSize;

    return executeMultiSelectQuery(
      "
select prov_trans.main_identifier,
       trans_rev_app.username as app_translit_reviewer,
       translit_revs.review_date as translit_review_date,
       xml_conv_app.username as app_xml_converter
from tlh_dig_provisional_transliterations as prov_trans
    left outer join tlh_dig_transliteration_review_appointments as trans_rev_app
        on trans_rev_app.main_identifier = prov_trans.main_identifier
    left outer join tlh_dig_transliteration_reviews as translit_revs
        on translit_revs.main_identifier = trans_rev_app.main_identifier
    left outer join tlh_dig_xml_conversion_appointments as xml_conv_app
        on xml_conv_app.main_identifier = trans_rev_app.main_identifier
limit ?, ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ii', $firstIndex, $pageSize),
      fn(array $row): DocumentInPipeline => new DocumentInPipeline(
        $row['main_identifier'],
        $row['app_translit_reviewer'],
        $row['translit_review_date'],
        $row['app_xml_converter']
      )
    );
  }
}


DocumentInPipeline::$queryType = new ObjectType([
  'name' => 'DocumentInPipeline',
  'fields' => [
    'manuscriptIdentifier' => Type::nonNull(Type::string()),
    'appointedTransliterationReviewer' => Type::string(),
    'transliterationReviewDateString' => Type::string(),
    'appointedXmlConverter' => Type::string(),
  ]
]);