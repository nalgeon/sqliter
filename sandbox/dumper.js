// Dumps database schema and contents to plain text formats

const SCHEMA_SQL = `
select "name", "type", "sql"
from "sqlite_master"
where "sql" not null
  and "type" == 'table'
order by "name"
`;

const CREATE_TABLE_PREFIX = "CREATE TABLE ";

// toSql dumps database schema and contents
// as sql statements.
// Adapted from https://github.com/simonw/sqlite-dump
function toSql(database) {
    let script = [];
    script.push("BEGIN TRANSACTION;");
    script.push("PRAGMA writable_schema=ON;");
    database.each(SCHEMA_SQL, (item) => {
        const sql = schemaItemToSql(item);
        if (sql) {
            script.push(sql);
        }
    });
    database.each(SCHEMA_SQL, (item) => {
        const sql = tableContentsToSql(database, item);
        if (sql) {
            script.push(sql);
        }
    });
    script.push("PRAGMA writable_schema=OFF;");
    script.push("COMMIT;");
    return script.join("\n");
}

function schemaItemToSql(item) {
    if (item.name == "sqlite_sequence") {
        return 'DELETE FROM "sqlite_sequence";';
    } else if (item.name == "sqlite_stat1") {
        return 'ANALYZE "sqlite_master";';
    } else if (item.name.startsWith("sqlite_")) {
        return "";
    } else if (item.sql.startsWith("CREATE VIRTUAL TABLE")) {
        const qtable = item.name.replace("'", "''");
        return `INSERT INTO sqlite_master(type,name,tbl_name,rootpage,sql)
            "VALUES('table','${qtable}','${qtable}',0,'${item.sql}');`;
    } else if (item.sql.toUpperCase().startsWith(CREATE_TABLE_PREFIX)) {
        const qtable = item.sql.substr(CREATE_TABLE_PREFIX.length);
        return `CREATE TABLE IF NOT EXISTS ${qtable};`;
    } else {
        return `${item.sql};`;
    }
}

function tableContentsToSql(database, item) {
    if (
        item.name.startsWith("sqlite_") ||
        item.sql.startsWith("CREATE VIRTUAL TABLE")
    ) {
        return "";
    }
    item.nameIdent = item.name.replace('"', '""');
    let res = database.execute(`PRAGMA table_info("${item.nameIdent}")`);
    const columnNames = res.values.map((row) => row[1]);
    const valuesArr = columnNames.map((name) => {
        const col = name.replace('"', '""');
        return `'||quote("${col}")||'`;
    });
    const values = valuesArr.join(",");
    const sql = `SELECT 'INSERT INTO "${item.nameIdent}" VALUES(${values})' as stmt FROM "${item.nameIdent}";`;
    const contents = [];
    database.each(sql, (row) => {
        contents.push(`${row.stmt};`);
    });
    return contents.join("\n");
}

const dumper = { toSql };
export default dumper;
