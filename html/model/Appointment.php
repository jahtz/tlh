<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/AppointmentType.php';

use GraphQL\Type\Definition\{ObjectType, Type};

class Appointment
{
  static ObjectType $queryType;

  public string $manuscriptIdentifier;
  public string $type;
  public ?string $waitingFor;

  function __construct(string $manuscriptIdentifier, string $type, ?string $waitingFor)
  {
    $this->manuscriptIdentifier = $manuscriptIdentifier;
    $this->type = $type;
    $this->waitingFor = $waitingFor;
  }
}

Appointment::$queryType = new ObjectType([
  'name' => 'Appointment',
  'fields' => [
    'type' => Type::nonNull(AppointmentType::$enumType),
    'manuscriptIdentifier' => Type::nonNull(Type::string()),
    'waitingFor' => AppointmentType::$enumType
  ]
]);