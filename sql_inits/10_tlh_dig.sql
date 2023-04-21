use hpm;

drop table if exists
  tlh_dig_approved_transliterations,
  tlh_dig_second_reviews,
  tlh_dig_first_reviews,
  tlh_dig_initial_transliterations,
  tlh_dig_provisional_transliterations,
  tlh_dig_manuscript_other_identifiers,
  tlh_dig_manuscript_metadatas,
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

insert into tlh_dig_users (username, pw_hash, name, email, rights)
values ('jack', '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy', 'Jack Bourne', 'jack.bourne@example.com', 'ExecutiveEditor');

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

insert into tlh_dig_manuscript_metadatas (main_identifier, status, creator_username)
values ('KBo 08/15', 'InCreation', 'jack');

create table if not exists tlh_dig_manuscript_other_identifiers (
  main_identifier varchar(20)                                                                not null references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,

  identifier      varchar(20)                                                                not null unique,
  identifier_type enum ('ExcavationNumber', 'CollectionNumber', 'PublicationShortReference') not null default 'ExcavationNumber',

  primary key (main_identifier, identifier, identifier_type)
);

-- transliterations

create table if not exists tlh_dig_provisional_transliterations (
  main_identifier varchar(20) not null primary key references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,
  input           text        not null
);

create table if not exists tlh_dig_initial_transliterations (
  main_identifier varchar(20) not null primary key references tlh_dig_manuscript_metadatas (main_identifier) on update cascade on delete cascade,
  input           text        not null
);

create table if not exists tlh_dig_first_reviews (
  main_identifier   varchar(20)  not null primary key references tlh_dig_initial_transliterations (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  reviewer_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict
);

create table if not exists tlh_dig_second_reviews (
  main_identifier   varchar(20)  not null primary key references tlh_dig_first_reviews (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  reviewer_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict
);

create table if not exists tlh_dig_approved_transliterations (
  main_identifier   varchar(20)  not null primary key references tlh_dig_second_reviews (main_identifier) on update cascade on delete cascade,
  input             text         not null,
  approval_username varchar(100) not null references tlh_dig_users (username) on update cascade on delete restrict
);
