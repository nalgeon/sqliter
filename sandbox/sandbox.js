// SQL Sandbox page

import gister from "./gister.js";
import { locator, DatabasePath } from "./locator.js";
import sqlite from "./sqlite.js";
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

// startFromCurrentUrl loads existing database or creates a new one
// using current window location as database path
async function startFromCurrentUrl() {
    const path = locator.path();
    const name = locator.name(path) || "new.db";
    if (path.type == "local") {
        // local databases are located one level up
        path.value = `../${path.value}`;
    }
    const success = await start(name, path);
    if (success && path.type == "id") {
        ui.editor.value = database.query;
    }
}

// startFromUrl loads existing database
// from specified url
async function startFromUrl(url) {
    const path = new DatabasePath(url);
    const name = locator.name(path);
    const success = await start(name, path);
    if (!success) {
        return;
    }
    history.pushState(database.name, null, `#${database.path.value}`);
}

// start loads existing database or creates a new one
// using specified database path
async function start(name, path) {
    ui.result.clear();
    ui.status.info(messages.loading);

    const loadedDatabase = await sqlite.init(name, path);
    console.log(loadedDatabase);
    if (!loadedDatabase) {
        ui.status.error(`Failed to load database from ${path}`);
        return false;
    }

    database = loadedDatabase;

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

// save persists database state and current query
// to remote storage
async function save() {
    ui.status.info("Saving...");
    ui.result.clear();
    const savedDatabase = await sqlite.save(database, ui.editor.value);
    if (!savedDatabase) {
        ui.status.error("Failed to save database");
        return;
    }
    database = savedDatabase;
    showDatabase(database);
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

// showDatabase shows saved database information
function showDatabase(database) {
    const url = gister.getUrl(database.id);
    const gistUrl = `<a href="${url}" target="_blank">gist</a>`;
    history.pushState(database.id, null, database.path.toHash());
    const shareUrl = `<copy-on-click href="${window.location}" class="button-small">
        copy share link</copy-on-click>`;
    ui.status.success(`Saved as ${gistUrl} ${shareUrl}`);
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
    const url = prompt("Enter database file URL:", "https://path/to/database");
    startFromUrl(url);
});

// Toolbar 'save' button click
ui.save.addEventListener("click", () => {
    save();
});

// Navigate back to previous database
window.addEventListener("popstate", () => {
    startFromCurrentUrl();
});

// SQL editor 'execute' event
ui.editor.addEventListener("execute", (event) => {
    execute(event.detail);
});

gister.loadCredentials();
startFromCurrentUrl();
