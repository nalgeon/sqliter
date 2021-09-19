// Browser local storage.

// save saves SQL query to the local storage
function save(sql) {
    if (!sql) {
        return;
    }
    localStorage.setItem("sql", sql);
}

// load loads SQL query from local storage
// and sets it as a value for the specified element
function load(el) {
    const sql = localStorage.getItem("sql");
    if (!sql) {
        return;
    }
    el.value = sql;
}

const storage = { save, load };
export default storage;
