const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

function loadPath() {
    if (!window.location.hash) {
        return null;
    }
    const filename = window.location.hash.slice(1);
    return `../${filename}`;
}

async function init(path) {
    if (path) {
        return await load(path);
    } else {
        return await create();
    }
}

async function create() {
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    return new SQLite(db);
}

async function load(path) {
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path).then((res) => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    const db = new SQL.Database(new Uint8Array(buf));
    return new SQLite(db);
}

class SQLite {
    constructor(db) {
        this.db = db;
    }

    execute(sql) {
        const result = this.db.exec(sql);
        console.log(result);
        if (!result.length) {
            return null;
        }
        return result[result.length - 1];
    }
}

const sqlite = { loadPath, init };
export default sqlite;
