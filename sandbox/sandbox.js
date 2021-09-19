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
    editor: document.querySelector("#editor"),
    status: document.querySelector("#status"),
    result: document.querySelector("#result"),
};

// execute runs SQL query on the database
// and shows results
function execute(db, sql) {
    if (!sql) {
        ui.status.info(messages.invite);
        return;
    }
    try {
        ui.status.info(messages.executing);
        storage.save(sql);
        timeit.start();
        const result = db.execute(sql);
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
    execute(db, ui.editor.value);
    ui.editor.focus();
});

// Toolbar 'clear' button click
ui.clear.addEventListener("click", () => {
    ui.editor.clear();
    ui.result.clear();
    ui.status.info(messages.invite);
    ui.editor.focus();
});

// SQL editor 'execute' event
ui.editor.addEventListener("execute", (event) => {
    execute(db, event.detail);
});

// Load last SQL query and show it in the editor
storage.load(ui.editor);
ui.editor.focus();

// Load existing database or create a new one
ui.status.info(messages.loading);
const path = sqlite.loadPath();
const db = await sqlite.init(path);
ui.status.info(messages.invite);
