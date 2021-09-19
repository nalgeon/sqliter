function save(sql) {
    if (!sql) {
        return;
    }
    localStorage.setItem("sql", sql);
}

function load(el) {
    const sql = localStorage.getItem("sql");
    if (!sql) {
        return;
    }
    el.innerHTML = sql;
}

const storage = { save, load };
export default storage;
