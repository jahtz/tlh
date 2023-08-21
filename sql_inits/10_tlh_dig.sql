use hpm;

drop table if exists
  tlh_dig_approved_transliterations,
  tlh_dig_second_xml_reviews,
  tlh_dig_second_xml_review_appointments,
  tlh_dig_first_xml_reviews,
  tlh_dig_first_xml_review_appointments,
  tlh_dig_xml_conversions,
  tlh_dig_xml_conversion_appointments,
  tlh_dig_transliteration_reviews,
  tlh_dig_transliteration_review_appointments,
  tlh_dig_released_transliterations,
  tlh_dig_provisional_transliterations,
  tlh_dig_manuscript_other_identifiers,
  tlh_dig_manuscripts,
  tlh_dig_users;

-- users

create table if not exists tlh_dig_users (
  username    varchar(100) primary key                       not null,
  pw_hash     varchar(255)                                   not null,
  name        varchar(255)                                   not null,
  affiliation varchar(255),
  email       varchar(255) unique                            not null,
  rights      enum ('Author', 'Reviewer', 'ExecutiveEditor') not null default 'Author'
);

-- manuscripts

create table if not exists tlh_dig_manuscripts (
  main_identifier            varchar(20)                                              not null primary key,
  main_identifier_type       enum ( 'ExcavationNumber', 'CollectionNumber' )          not null default 'ExcavationNumber',
  palaeo_classification      varchar(100)                                             not null default 'OldScript',
  palaeo_classification_sure boolean                                                  not null default false,
  default_language           enum ( 'Hit', 'Luw', 'Pal', 'Hat', 'Hur', 'Akk', 'Sum' ) not null default 'Hit',
  provenance                 varchar(255),
  cth_classification         integer,
  bibliography               text,
  creator_username           varchar(100)                                             not null references tlh_dig_users (username) on update cascade on delete cascade,
  creation_date              date                                                     not null default now(),
  status                     enum (
    'Created', 'TransliterationReleased', 'TransliterationReviewPerformed', 'XmlConversionPerformed',
    'FirstXmlReviewPerformed', 'SecondXmlReviewPerformed', 'Approved'
    )                                                                                 not null default 'Created'
);

create table if not exists tlh_dig_manuscript_other_identifiers (
  main_identifier varchar(20)                                                                  not null references tlh_dig_manuscripts (main_identifier) on update cascade on delete cascade,

  identifier      varchar(20)                                                                  not null unique,
  identifier_type enum ( 'ExcavationNumber', 'CollectionNumber', 'PublicationShortReference' ) not null default 'ExcavationNumber',

  primary key (main_identifier, identifier, identifier_type)
);

-- transliterations

create table if not exists tlh_dig_provisional_transliterations (
  main_identifier varchar(20) not null primary key references tlh_dig_manuscripts (main_identifier) on update cascade on delete cascade,
  input           text        not null,
  creation_date   date        not null default now()
);

create table if not exists tlh_dig_released_transliterations (
  main_identifier varchar(20) not null primary key references tlh_dig_manuscripts (main_identifier) on update cascade on delete cascade,
  release_date    date        not null default now()
);

-- transliteration review

create table if not exists tlh_dig_transliteration_review_appointments (
  main_identifier       varchar(20)  not null primary key references tlh_dig_released_transliterations (main_identifier) on update cascade on delete cascade,
  username              varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointed_by_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointment_date      date         not null default now(),

  unique (main_identifier, username)
);

create table if not exists tlh_dig_transliteration_reviews (
  main_identifier   varchar(20)  not null primary key references tlh_dig_released_transliterations (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  reviewer_username varchar(100) not null,
  review_date       date         not null default now(),

  foreign key (main_identifier, reviewer_username) references tlh_dig_transliteration_review_appointments (main_identifier, username) on update cascade on delete cascade
);

-- xml conversion

create table if not exists tlh_dig_xml_conversion_appointments (
  main_identifier       varchar(20)  not null primary key references tlh_dig_released_transliterations (main_identifier) on update cascade on delete cascade,
  username              varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointed_by_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointment_date      date         not null default now(),

  unique (main_identifier, username)
);

create table if not exists tlh_dig_xml_conversions (
  main_identifier    varchar(20)  not null primary key references tlh_dig_transliteration_reviews (main_identifier) on update cascade on delete cascade,
  input              text         not null,
  converter_username varchar(100) not null,
  conversion_date    date         not null default now(),

  foreign key (main_identifier, converter_username) references tlh_dig_xml_conversion_appointments (main_identifier, username) on update cascade on delete cascade
);

-- first xml review

create table if not exists tlh_dig_first_xml_review_appointments (
  main_identifier       varchar(20)  not null primary key references tlh_dig_released_transliterations (main_identifier) on update cascade on delete cascade,
  username              varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointed_by_username varchar(100) references tlh_dig_users (username) on update cascade on delete restrict,
  appointment_date      date         not null default now(),

  unique (main_identifier, username)
);

create table if not exists tlh_dig_first_xml_reviews (
  main_identifier   varchar(20)  not null primary key references tlh_dig_xml_conversions (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  reviewer_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  review_date       date         not null default now(),

  foreign key (main_identifier, reviewer_username) references tlh_dig_first_xml_review_appointments (main_identifier, username) on update cascade on delete cascade
);

-- second xml review

create table if not exists tlh_dig_second_xml_review_appointments (
  main_identifier       varchar(20)  not null primary key references tlh_dig_released_transliterations (main_identifier) on update cascade on delete cascade,
  username              varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  appointed_by_username varchar(100) references tlh_dig_users (username) on update cascade on delete restrict,
  appointment_date      date         not null default now(),

  unique (main_identifier, username)
);

create table if not exists tlh_dig_second_xml_reviews (
  main_identifier   varchar(20)  not null primary key references tlh_dig_first_xml_reviews (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  reviewer_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  review_date       date         not null default now(),

  foreign key (main_identifier, reviewer_username) references tlh_dig_second_xml_review_appointments (main_identifier, username) on update cascade on delete cascade
);

-- final approval

create table if not exists tlh_dig_approved_transliterations (
  main_identifier   varchar(20)  not null primary key references tlh_dig_second_xml_reviews (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  approval_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict,
  approval_date     date         not null default now()
);
