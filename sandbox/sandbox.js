// SQL Sandbox page

import dumper from "./dumper.js";
import gister from "./gister.js";
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
    save: document.querySelector("#save"),
    name: document.querySelector("#db-name"),
    editor: document.querySelector("#editor"),
    status: document.querySelector("#status"),
    result: document.querySelector("#result"),
};

let database;

// startFromUrl loads existing database or creates a new one
// using location hash as database path
async function startFromUrl() {
    const name = sqlite.loadName() || "new.db";
    let path = sqlite.loadPath();
    if (path && !path.startsWith("https://")) {
        // local databases are located one level up
        path = `../${path}`;
    }
    start(name, path);
}

// start loads existing database or creates a new one
// using specified database path
async function start(name, path) {
    ui.result.clear();
    ui.status.info(messages.loading);

    const db = await sqlite.init(name, path);
    if (!db) {
        ui.status.error(`Failed to load database from URL: ${path}`);
        return false;
    }

    database = db;

    storage.load(database.name, ui.editor);
    document.title = database.name;
    ui.name.innerHTML = database.name;
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
        storage.save(database.name, sql);
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
    const path = prompt(
        "Enter database file URL:",
        "https://raw.githubusercontent.com/username/repo/branch/..."
    );
    const parts = path.split("/");
    const name = parts[parts.length - 1];
    start(name, path).then((success) => {
        if (!success) {
            return;
        }
        history.pushState(database.name, null, `#${database.path}`);
    });
});

// Toolbar 'save' button click
ui.save.addEventListener("click", () => {
    const schema = dumper.toSql(database, ui.editor.value);
    const query = ui.editor.value;
    let promise;
    if (!database.id) {
        promise = gister.create(database.name, schema, query);
    } else {
        promise = gister.update(database.id, schema, query);
    }
    promise.then((resp) => {
        database.id = resp.id;
        const url = gister.getUrl(database.id);
        ui.status.success(`Saved to ${url}`);
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

gister.loadCredentials();
startFromUrl();
