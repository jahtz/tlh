use hpm;

drop table if exists tlh_dig_transliterations;

drop table if exists tlh_dig_transliteration_lines;

drop table if exists tlh_dig_manuscript_other_identifiers;

drop table if exists tlh_dig_manuscript_metadatas;

drop table if exists tlh_dig_users;

-- users

create table if not exists tlh_dig_users
(
    username    varchar(100) primary key,
    pw_hash     varchar(255)        not null,
    name        varchar(255)        not null,
    affiliation varchar(255),
    email       varchar(255) unique not null
);

insert into tlh_dig_users (username, pw_hash, name, email)
values ('jack', '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy', 'Jack Bourne', 'j.bourne@example.com');

-- manuscripts

create table if not exists tlh_dig_manuscript_metadatas
(
    main_identifier            varchar(20) primary key,
    main_identifier_type       enum ('ExcavationNumber', 'CollectionNumber') not null default 'ExcavationNumber',
    palaeo_classification      varchar(100)                                  not null default 'OldScript',
    palaeo_classification_sure boolean                                       not null default false,
    provenance                 varchar(255),
    cth_classification         integer,
    bibliography               text,
    status                     varchar(50)                                   not null default 'InCreation',
    creator_username           varchar(100)                                  not null references tlh_dig_users (username) on update cascade on delete cascade
);

create table if not exists tlh_dig_manuscript_other_identifiers
(
    main_identifier varchar(20)
        references tlh_dig_manuscript_metadatas (main_identifier)
            on update cascade on delete cascade,

    identifier      varchar(20) unique,
    identifier_type enum ('ExcavationNumber', 'CollectionNumber', 'PublicationShortReference') not null default 'ExcavationNumber',

    primary key (main_identifier, identifier, identifier_type)
);

-- transliteration results

create table if not exists tlh_dig_transliteration_lines
(
    main_identifier         varchar(20)
        references tlh_dig_manuscript_metadatas (main_identifier)
            on update cascade on delete cascade,
    line_index              integer,

    transliteration_input   varchar(255) not null,
    result_line_number      integer,
    result_line_is_absolute boolean,

    primary key (main_identifier, line_index)
);


create table if not exists tlh_dig_words
(
    main_identifier varchar(20),
    line_index      integer,
    word_index      integer,

    word_input      varchar(100) not null,
    content         json,

    primary key (main_identifier, line_index, word_index),
    foreign key (main_identifier, line_index)
        references tlh_dig_transliteration_lines (main_identifier, line_index)
        on update cascade on delete cascade
);
