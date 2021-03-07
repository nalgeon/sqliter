create table locations (geoname_id integer, locale_code text, continent_code text, continent_name text, country_iso_code text, country_name text, subdivision_1_iso_code text, subdivision_1_name text, subdivision_2_iso_code text, subdivision_2_name text, city_name text, metro_code text, time_zone text, is_in_european_union integer);
create table blocks (network text, geoname_id integer, registered_country_geoname_id integer, represented_country_geoname_id integer, is_anonymous_proxy integer, is_satellite_provider integer, postal_code text, latitude real, longitude real, accuracy_radius integer);
create table blocks_v6 (network text, geoname_id integer, registered_country_geoname_id integer, represented_country_geoname_id integer, is_anonymous_proxy integer, is_satellite_provider integer, postal_code text, latitude real, longitude real, accuracy_radius integer);
.import --csv --skip 1 iplocations.csv locations
.import --csv --skip 1 ipblocks.csv blocks
.import --csv --skip 1 ipblocks-v6.csv blocks_v6
update blocks set postal_code = null where postal_code = '';