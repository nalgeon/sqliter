const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

function loadName() {
    if (!window.location.hash) {
        return "";
    }
    return window.location.hash.slice(1);
}

function loadPath() {
    if (!window.location.hash) {
        return null;
    }
    const filename = window.location.hash.slice(1);
    return `../${filename}`;
}

async function init(name) {
    const path = loadPath();
    if (path) {
        return await load(name, path);
    } else {
        return await create(name);
    }
}

async function create(name) {
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    return new SQLite(name, db);
}

async function load(name, path) {
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path).then((res) => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    const db = new SQL.Database(new Uint8Array(buf));
    return new SQLite(name, db);
}

class SQLite {
    constructor(name, db) {
        this.name = name;
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

const sqlite = { loadName, init };
export default sqlite;
