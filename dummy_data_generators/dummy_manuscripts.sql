delete from tlh_dig_manuscript_metadatas where main_identifier like 'Man%';

SET
  @count = 20,
  @creator = 'jack';

DELIMITER //

for var in 0..@count
  do
    set @identifier = concat('Man', lpad(var, 2, '0'));

    insert into tlh_dig_manuscript_metadatas(main_identifier, creator_username)
    values (@identifier, @creator);
end for;
//

DELIMITER ;