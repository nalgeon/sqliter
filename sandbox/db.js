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
        return await sqlite();
    }
}

async function create() {
    const SQL = await initSqlJs(CONFIG);
    return new SQL.Database();
}

async function load(path) {
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path).then((res) => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    return new SQL.Database(new Uint8Array(buf));
}

const sqlite = { loadPath, init };
export default sqlite;
