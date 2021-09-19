import printer from "./printer.js";
import sqlite from "./db.js";
import storage from "./storage.js";

const messages = {
    invite: "Run SQL query to see the results",
    empty: "The query returned nothing",
};

const ui = {
    execute: document.querySelector("#execute"),
    clear: document.querySelector("#clear"),
    editor: document.querySelector("#editor"),
    message: document.querySelector("#message"),
    result: document.querySelector("#result"),
};

function focus() {
    ui.editor.focus();
    document.execCommand("selectAll", false, null);
    document.getSelection().collapseToEnd();
}

function execute(db, sql) {
    if (sql === undefined) {
        sql = ui.editor.innerText;
    }
    storage.save(sql);
    try {
        const result = db.exec(sql);
        showResult(result);
    } catch (exc) {
        showError(exc);
    }
}

function showResult(result) {
    console.log(result);
    if (result.length > 0) {
        ui.result.innerHTML = printer.asTable(result);
        ui.message.innerHTML = "";
    } else {
        ui.result.innerHTML = "";
        ui.message.innerHTML = messages.empty;
    }
}

function showError(exc) {
    const err = exc.toString().split("\n")[0];
    ui.result.innerHTML = "";
    ui.message.innerHTML = err;
}

ui.execute.addEventListener("click", () => {
    execute(db);
    focus();
});
ui.clear.addEventListener("click", () => {
    ui.editor.innerHTML = "";
    ui.result.innerHTML = "";
    ui.message.innerHTML = messages.invite;
    focus();
});
ui.editor.addEventListener("keydown", (event) => {
    if (
        (event.keyCode == 10 || event.keyCode == 13) &&
        (event.ctrlKey || event.metaKey)
    ) {
        execute(db);
        return false;
    }
    return true;
});

storage.load(ui.editor);
focus();
const path = sqlite.loadPath();
const db = await sqlite.init(path);
ui.message.innerHTML = messages.invite;
