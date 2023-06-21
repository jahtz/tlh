<?php

namespace sql_helpers;

use Exception;
use mysqli;
use mysqli_result;
use mysqli_stmt;

require_once __DIR__ . '/mysqliconn.php';

abstract class SqlHelpers
{
  /**
   * @template T
   *
   * @param mysqli_stmt $statement
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(mysqli_stmt):T $f
   *
   * @return T
   *
   * @throws Exception
   */
  private static function executeStatement(mysqli_stmt $statement, ?callable $bindParams, callable $f)
  {
    $paramsBound = is_null($bindParams) || $bindParams($statement);
    if (!$paramsBound) {
      throw new Exception("Could not bind params: " . $statement->error);
    }

    if (!$statement->execute()) {
      throw new Exception("Could not execute statement: " . $statement->error);
    }

    try {
      return $f($statement);
    } catch (Exception $e) {
      error_log("Could not transform: " . $statement->error);
      throw $e;
    }
  }

  /**
   * @template T
   *
   * @param mysqli $connection
   * @param string $sql
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(mysqli_stmt):T $f
   *
   * @return T
   *
   * @throws Exception
   */
  private static function executeQueryWithConnection(mysqli $connection, string $sql, ?callable $bindParams, callable $f)
  {
    $statement = $connection->prepare($sql);
    if ($statement === false) {
      throw new Exception("Could not prepare statement: " . $connection->error);
    }

    try {
      $result = SqlHelpers::executeStatement($statement, $bindParams, $f);
    } catch (Exception $exception) {
      $statement->close();
      throw $exception;
    }

    $statement->close();
    return $result;
  }

  /**
   * @template T
   *
   * @param mysqli|null $conn
   * @param string $sql
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(mysqli_stmt):T $f
   *
   * @return T
   *
   * @throws Exception
   */
  static function executeQuery(?mysqli $maybeConn, string $sql, ?callable $bindParams, callable $f)
  {
    $conn = is_null($maybeConn)
      ? connect_to_db()
      : $maybeConn;

    try {
      $result = SqlHelpers::executeQueryWithConnection($conn, $sql, $bindParams, $f);
    } catch (Exception $e) {
      if (is_null($maybeConn)) {
        $conn->close();
      }
      throw $e;
    }

    if (is_null($maybeConn)) {
      $conn->close();
    }
    return $result;
  }

  /**
   * @template T
   *
   * @param mysqli|null $conn
   * @param string $sql
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(mysqli_result):T $f
   *
   * @return T
   *
   * @throws Exception
   */
  private static function __executeSelectQuery(?mysqli $conn, string $sql, ?callable $bindParams, callable $f)
  {
    return SqlHelpers::executeQuery($conn, $sql, $bindParams, function (mysqli_stmt $stmt) use ($f) {
      $stmtResult = $stmt->get_result();

      if ($stmtResult === false) {
        throw new Exception("Could not get result: " . $stmt->error);
      }

      $result = $f($stmtResult);

      $stmtResult->close();
      return $result;
    });
  }

  /**
   * @template T
   *
   * @param mysqli|null $conn
   * @param string $sql
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(array): T $f
   *
   * @return T|null
   */
  static function executeSingleSelectQuery(string $sql, ?callable $bindParams, callable $f, ?mysqli $conn = null)
  {
    try {
      return SqlHelpers::__executeSelectQuery($conn, $sql, $bindParams,
        function (mysqli_result $result) use ($f) {
          $row = $result->fetch_assoc();

          return $row === false || is_null($row) ? null : $f($row);
        }
      );
    } catch (Exception $exception) {
      error_log($exception);
      return null;
    }
  }

  /**
   * @template T
   *
   * @param string $sql
   * @param null|callable(mysqli_stmt):bool $bindParams
   * @param callable(array):T $f
   * @param mysqli|null $conn
   *
   * @return T[]
   */
  static function executeMultiSelectQuery(string $sql, ?callable $bindParams, callable $f, ?mysqli $conn = null): array
  {
    try {
      return SqlHelpers::__executeSelectQuery($conn, $sql, $bindParams,
        fn(mysqli_result $result) => array_map(
          fn(array $row) => $f($row),
          $result->fetch_all(MYSQLI_ASSOC)
        )
      );
    } catch (Exception $exception) {
      error_log($exception);
      return [];
    }
  }

  /**
   * @param mysqli|null $conn
   * @param string $sql
   * @param callable(mysqli_stmt):bool $bindParams
   *
   * @return bool
   */
  static function executeSingleChangeQuery(string $sql, callable $bindParams, ?mysqli $conn = null): bool
  {
    try {
      return SqlHelpers::executeQuery($conn, $sql, $bindParams, fn() => true);
    } catch (Exception $exception) {
      error_log($exception);
      return false;
    }
  }

  /**
   * @template T
   *
   * @param string $sql
   * @param T[] $data
   * @param callable(mysqli_stmt, T):bool $bindParams
   * @param mysqli|null $maybeConn
   *
   * @return bool
   */
  static function executeMultiInsertQuery(string $sql, array $data, callable $bindParams, ?mysqli $maybeConn = null): bool
  {
    $connection = is_null($maybeConn)
      ? connect_to_db()
      : $maybeConn;

    // prepare statement
    $stmt = $connection->prepare($sql);
    if ($stmt === false) {
      if (is_null($maybeConn)) {
        $connection->close();
      }
      return false;
    }

    foreach ($data as $datum) {
      $paramsBound = $bindParams($stmt, $datum);
      if (!$paramsBound) {
        error_log("Could not bind params: " . $stmt->error);
        $stmt->close();
        if (is_null($maybeConn)) {
          $connection->close();
        }
        return false;
      }

      $executed = $stmt->execute();
      if (!$executed) {
        error_log("Could not execute statement: " . $stmt->error);
        $stmt->close();
        if (is_null($maybeConn)) {
          $connection->close();
        }
        return false;
      }
    }

    $stmt->close();
    if (is_null($maybeConn)) {
      $connection->close();
    }
    return true;
  }


  /**
   * @param callable(mysqli):bool $f
   * @return bool
   */
  static function executeQueriesInTransactions(callable $f): bool
  {
    $conn = connect_to_db();

    $conn->begin_transaction();

    try {
      $result = $f($conn);
    } catch (Exception $exception) {
      $conn->rollback();
      $conn->close();

      return false;
    }

    if ($result) {
      $conn->commit();
    } else {
      $conn->rollback();
    }

    $conn->close();
    return $result;
  }
}
