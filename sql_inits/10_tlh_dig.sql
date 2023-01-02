use hpm;

drop table if exists
  tlh_dig_transliteration_lines,
  tlh_dig_transliterations,
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
values ('jack', '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy', 'Jack Bourne', 'j.bourne@example.com');

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
  main_identifier varchar(20) references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,

  identifier      varchar(20) unique,
  identifier_type enum ('ExcavationNumber', 'CollectionNumber', 'PublicationShortReference') not null default 'ExcavationNumber',

  primary key (main_identifier, identifier, identifier_type)
);

-- transliterations

create table if not exists tlh_dig_transliterations (
  main_identifier varchar(20) not null references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,
  side            varchar(20) not null,
  version         integer     not null,

  primary key (main_identifier, side, version)
);

create table if not exists tlh_dig_transliteration_lines (
  main_identifier varchar(20) not null,
  side            varchar(20) not null,
  version         integer     not null,
  line_number     integer     not null,

  input           text        not null,
  is_error        boolean     not null,
  result          varchar(20) not null,

  primary key (main_identifier, side, version, line_number),
  foreign key (main_identifier, side, version) references tlh_dig_transliterations (main_identifier, side, version) on update cascade on delete cascade
);
