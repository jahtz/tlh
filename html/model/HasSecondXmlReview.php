<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use Exception;
use MySafeGraphQLException;
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasSecondXmlReview
{
  static function selectUserAppointedForSecondXmlReview(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select username from tlh_dig_second_xml_review_appointments where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['username']
    );
  }

  function selectSecondXmlReviewPerformed(): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_second_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  function selectSecondXmlReviewData(): ?ReviewData
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select first_xml_rev.input, appointment.username
from tlh_dig_first_xml_reviews as first_xml_rev
    join tlh_dig_second_xml_review_appointments as appointment using(main_identifier)
where first_xml_rev.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }

  /** @throws MySafeGraphQLException */
  function insertSecondXmlReview(string $reviewerUsername, string $xml): string
  {
    try {
      return SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($reviewerUsername, $xml): string {
          $reviewDate = SqlHelpers::executeSingleReturnRowQuery(
            "insert into tlh_dig_second_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?) returning review_date;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $xml, $reviewerUsername),
            fn(array $row): string => $row['review_date'],
            $conn
          );

          if (is_null($reviewDate)) {
            throw new Exception("Could not insert second xml review!");
          }

          $statusUpdated = SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'SecondXmlReviewPerformed' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
            $conn
          );

          if (!$statusUpdated) {
            throw new Exception("Could not update status for manuscript " . $this->mainIdentifier->identifier);
          }

          return $reviewDate;
        }
      );
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save second xml review for manuscript " . $this->mainIdentifier->identifier . "!");
    }
  }
}