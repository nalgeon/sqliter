create table currency (code text primary key, abbr text, name text, rate real);
create table area (id integer primary key, parent_id integer, name text);
create table employer (id integer primary key, name text, trusted integer, open_vacancies integer);
create table vacancy (id integer primary key, name text, premium integer, has_test integer, response_letter_required integer, area_id integer, salary_from integer, salary_to integer, salary_currency text, salary_gross integer, type_id text, metro_station_id text, employer_id integer, published_at text, schedule_id text);
.import --csv --skip 1 currency.csv currency
.import --csv --skip 1 area.csv area
.import --csv --skip 1 employer.csv employer
.import --csv --skip 1 vacancy.csv vacancy
update area set parent_id = null where parent_id = '';
create table address as select coalesce(city.id, region.id, country.id) as id, country.name as country, region.name as region, city.name as city from area as country left join area as region on country.id = region.parent_id left join area as city on region.id = city.parent_id where country.parent_id is null;