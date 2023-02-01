use hpm;

drop table if exists
  tlh_dig_transliteration_lines,
  tlh_dig_transliteration_columns,
  tlh_dig_transliteration_sides,
  tlh_dig_manuscript_other_identifiers,
  tlh_dig_manuscript_metadatas,
  tlh_dig_users;

-- users

create table if not exists tlh_dig_users (
  username    varchar(100) primary key not null,
  pw_hash     varchar(255)             not null,
  name        varchar(255)             not null,
  affiliation varchar(255),
  email       varchar(255) unique      not null
);

insert into tlh_dig_users (username, pw_hash, name, email)
values ('jack', '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy', 'Jack Bourne', '');

-- manuscripts

create table if not exists tlh_dig_manuscript_metadatas (
  main_identifier            varchar(20) primary key                       not null,
  main_identifier_type       enum ('ExcavationNumber', 'CollectionNumber') not null default 'ExcavationNumber',
  palaeo_classification      varchar(100)                                  not null default 'OldScript',
  palaeo_classification_sure boolean                                       not null default false,
  provenance                 varchar(255),
  cth_classification         integer,
  bibliography               text,
  status                     varchar(50)                                   not null default 'InCreation',
  creator_username           varchar(100)                                  not null references tlh_dig_users (username) on update cascade on delete cascade
);

create table if not exists tlh_dig_manuscript_other_identifiers (
  main_identifier varchar(20)                                                                not null references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,

  identifier      varchar(20)                                                                not null unique,
  identifier_type enum ('ExcavationNumber', 'CollectionNumber', 'PublicationShortReference') not null default 'ExcavationNumber',

  primary key (main_identifier, identifier, identifier_type)
);

-- transliterations

create table if not exists tlh_dig_transliteration_sides (
  main_identifier varchar(20) not null references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,
  side_index      integer     not null,
  side            varchar(50) not null,
  version         int         not null,

  primary key (main_identifier, side_index, version)
  -- unique (main_identifier, side)
);

create table if not exists tlh_dig_transliteration_columns (
  main_identifier   varchar(20) not null,
  side_index        integer     not null,
  version           integer     not null,
  column_index      integer     not null,
  manuscript_column varchar(50) not null,
  column_modifier   varchar(30) not null,

  primary key (main_identifier, side_index, version, column_index),
  unique (main_identifier, side_index, manuscript_column),

  foreign key (main_identifier, side_index) references tlh_dig_transliteration_sides (main_identifier, side_index) on update cascade on delete cascade
);

create table if not exists tlh_dig_transliteration_lines (
  main_identifier          varchar(20) not null,
  side_index               integer     not null,
  column_index             integer     not null,
  version                  integer     not null,
  input_index              integer     not null,

  line_number              integer     not null,
  line_number_is_confirmed boolean     not null,
  input                    text        not null,
  result                   text,

  primary key (main_identifier, side_index, column_index, version, input_index),
  unique (main_identifier, side_index, column_index, version, line_number, line_number_is_confirmed),

  foreign key (main_identifier, side_index, version, column_index) references tlh_dig_transliteration_columns (main_identifier, side_index, version, column_index) on update cascade on delete cascade
);
