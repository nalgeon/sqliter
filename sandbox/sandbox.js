// SQL Sandbox page

import sqlite from "./db.js";
import storage from "./storage.js";
import timeit from "./timeit.js";

const messages = {
    empty: "The query returned nothing",
    executing: "Executing query...",
    invite: "Run SQL query to see the results",
    loading: "Loading database...",
};

const ui = {
    execute: document.querySelector("#execute"),
    clear: document.querySelector("#clear"),
    openUrl: document.querySelector("#open-url"),
    name: document.querySelector("#db-name"),
    editor: document.querySelector("#editor"),
    status: document.querySelector("#status"),
    result: document.querySelector("#result"),
};

let database, dbName, dbPath;

// startFromUrl loads existing database or creates a new one
// using location hash as database path
async function startFromUrl() {
    const newName = sqlite.loadName() || "new.db";
    let newPath = sqlite.loadPath();
    if (newPath && !newPath.startsWith("https://")) {
        // local databases are located one level up
        newPath = `../${newPath}`;
    }
    start(newName, newPath);
}

// start loads existing database or creates a new one
// using specified database path
async function start(newName, newPath) {
    ui.result.clear();
    ui.status.info(messages.loading);

    const db = await sqlite.init(newName, newPath);
    if (!db) {
        ui.status.error(`Failed to load database from URL: ${dbPath}`);
        return false;
    }

    database = db;
    dbName = newName;
    dbPath = newPath;

    storage.load(dbName, ui.editor);
    ui.name.innerHTML = dbName;
    ui.status.info(messages.invite);
    ui.editor.focus();

    return true;
}

// execute runs SQL query on the database
// and shows results
function execute(sql) {
    if (!sql) {
        ui.status.info(messages.invite);
        return;
    }
    try {
        ui.status.info(messages.executing);
        storage.save(dbName, sql);
        timeit.start();
        const result = database.execute(sql);
        const elapsed = timeit.finish();
        showResult(result, elapsed);
    } catch (exc) {
        showError(exc);
    }
}

// showResult shows results and timing
// of the SQL query execution
function showResult(result, elapsed) {
    ui.result.print(result);
    if (result?.values?.length) {
        ui.status.success(`${result.values.length} rows, took ${elapsed} ms`);
    } else {
        ui.status.success(`Took ${elapsed} ms`);
    }
}

// showError shows an error occured
// during SQL query execution
function showError(exc) {
    const err = exc.toString().split("\n")[0];
    ui.result.clear();
    ui.status.error(err);
}

// Toolbar 'run sql' button click
ui.execute.addEventListener("click", () => {
    execute(ui.editor.value);
});

// Toolbar 'clear' button click
ui.clear.addEventListener("click", () => {
    ui.editor.clear();
    ui.result.clear();
    ui.status.info(messages.invite);
});

// Toolbar 'open url' button click
ui.openUrl.addEventListener("click", () => {
    const newPath = prompt(
        "Enter database file URL:",
        "https://raw.githubusercontent.com/username/repo/branch/..."
    );
    const parts = newPath.split("/");
    const newName = parts[parts.length - 1];
    start(newName, newPath).then((success) => {
        if (!success) {
            return;
        }
        history.pushState(dbName, null, `#${dbPath}`);
    });
});

// Navigate back to previous database
window.addEventListener("popstate", () => {
    startFromUrl();
});

// SQL editor 'execute' event
ui.editor.addEventListener("execute", (event) => {
    execute(event.detail);
});

startFromUrl();
