const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

function loadName() {
    if (!window.location.hash) {
        return "";
    }
    const filename = window.location.hash.slice(1);
    if (filename.startsWith("https://")) {
        const parts = filename.split("/");
        return parts[parts.length - 1];
    }
    return filename;
}

function loadPath() {
    if (!window.location.hash) {
        return null;
    }
    return window.location.hash.slice(1);
}

async function init(name, path) {
    if (path) {
        return await load(name, path);
    } else {
        return await create(name);
    }
}

async function create(name) {
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    return new SQLite(name, null, db);
}

async function load(name, path) {
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path).then((response) => {
        if (!response.ok) {
            return null;
        }
        return response.arrayBuffer();
    });
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    if (!buf) {
        return null;
    }
    const db = new SQL.Database(new Uint8Array(buf));
    return new SQLite(name, path, db);
}

class SQLite {
    constructor(name, path, db) {
        this.id = null;
        this.name = name;
        this.path = path;
        this.db = db;
    }

    execute(sql) {
        const result = this.db.exec(sql);
        if (!result.length) {
            return null;
        }
        return result[result.length - 1];
    }

    each(sql, callback) {
        this.db.each(sql, [], callback);
    }
}

const sqlite = { loadName, loadPath, init };
export default sqlite;
