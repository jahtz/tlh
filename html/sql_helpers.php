<?php

namespace sql_helpers;

use Exception;
use mysqli;
use mysqli_result;
use mysqli_stmt;

require_once __DIR__ . '/mysqliconn.php';

/**
 * @template T
 *
 * @param mysqli $connection
 * @param string $sql
 * @param ?callable(mysqli_stmt):bool $bindParams
 * @param callable(mysqli_stmt):T $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_query_with_connection(mysqli $connection, string $sql, ?callable $bindParams, callable $f)
{
  $statement = $connection->prepare($sql);
  if ($statement === false) {
    throw new Exception("Could not prepare statement: " . $connection->error);
  }

  $paramsBound = is_null($bindParams) || $bindParams($statement);
  if (!$paramsBound) {
    $errorMsg = $statement->error;
    $statement->close();
    throw new Exception("Could not bind params: " . $errorMsg);
  }

  $executed = $statement->execute();
  if ($executed === false) {
    $errorMsg = $statement->error;
    $statement->close();
    throw new Exception("Could not execute statement: " . $errorMsg);
  }

  try {
    $result = $f($statement);
  } catch (Exception $e) {
    error_log("Could not transform: " . $statement->error);
    $statement->close();
    throw $e;
  }

  $statement->close();

  return $result;
}

/**
 * @template T
 *
 * @param string $sql
 * @param ?callable(mysqli_stmt):bool $bindParams
 * @param callable(mysqli_stmt):T $f
 * @return mixed
 *
 * @throws Exception
 */
function executeQuery(string $sql, ?callable $bindParams, callable $f)
{
  $conn = connect_to_db();

  try {
    $executed = execute_query_with_connection($conn, $sql, $bindParams, $f);
  } catch (Exception $e) {
    $conn->close();
    throw $e;
  }

  $conn->close();
  return $executed;
}

/**
 * @template T
 *
 * @param string $sql
 * @param ?callable(mysqli_stmt):bool $bindParams
 * @param callable(mysqli_result):T $f
 *
 * @return mixed
 *
 * @throws Exception
 */
function execute_select_query(string $sql, ?callable $bindParams, callable $f)
{
  return executeQuery($sql, $bindParams, function (mysqli_stmt $stmt) use ($f) {
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
 * @param string $sql
 * @param ?callable(mysqli_stmt):bool $bindParams
 * @param callable(array): T $f
 *
 * @return ?T
 */
function executeSingleSelectQuery(string $sql, ?callable $bindParams, callable $f)
{
  try {
    return execute_select_query($sql, $bindParams,
      function (mysqli_result $result) use ($f) {
        $row = $result->fetch_assoc();

        return $row === false || is_null($row) ? null : $f($row);
      }
    );
  } catch (Exception $exception) {
    error_log($exception->getMessage());
    return null;
  }
}

/**
 * @template T
 *
 * @param string $sql
 * @param ?callable(mysqli_stmt):bool $bindParams
 * @param callable(array):T $f
 *
 * @return T[]
 */
function executeMultiSelectQuery(string $sql, ?callable $bindParams, callable $f): array
{
  try {
    return execute_select_query($sql, $bindParams,
      fn(mysqli_result $result) => array_map(
        fn(array $row) => $f($row),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $exception) {
    error_log($exception->getMessage());
    return [];
  }
}

function executeSingleInsertQuery(string $sql, callable $bindParams): bool
{
  try {
    return executeQuery($sql, $bindParams, fn() => true);
  } catch (Exception $exception) {
    error_log($exception->getMessage());
    return false;
  }
}