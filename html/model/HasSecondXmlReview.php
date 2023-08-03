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
  /** @throws MySafeGraphQLException */
  function upsertSecondXmlReviewAppointment(string $reviewer, string $appointedBy): string
  {
    try {
      return SqlHelpers::executeSingleChangeQuery(
        "
insert into tlh_dig_second_xml_review_appointments (main_identifier, username, appointed_by_username)
values (?, ?, ?)
on duplicate key update username = ?, appointed_by_username = ?, appointment_date = now();",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $this->mainIdentifier->identifier, $reviewer, $appointedBy, $reviewer, $appointedBy)
      );
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save appointment!");
    }
  }

  function selectUserAppointedForSecondXmlReview(): ?string
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
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }

  /** @throws MySafeGraphQLException */
  function insertSecondXmlReview(string $reviewerUsername, string $xml): string
  {
    try {
      SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($reviewerUsername, $xml): void {
          SqlHelpers::executeSingleReturnRowQuery(
            "insert into tlh_dig_second_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?);",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $xml, $reviewerUsername),
            fn(array $row): string => $row['review_date'],
            $conn
          );

          SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'SecondXmlReviewPerformed' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
            $conn
          );
        }
      );

      $reviewDate = SqlHelpers::executeSingleReturnRowQuery(
        "select review_date from tlh_dig_second_xml_reviews where main_identifier = ?;",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
        fn(array $row): string => $row['review_date']
      );

      if (is_null($reviewDate)) {
        throw new Exception("Could not select previously inserted second xml review!");
      }

      return $reviewDate;
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save second xml review for manuscript " . $this->mainIdentifier->identifier . "!");
    }
  }
}