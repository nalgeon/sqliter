function asTable(result) {
    const last = result[result.length - 1];
    const [columns, values] = [last.columns, last.values];
    var html = "<thead>" + join(columns, "th") + "</thead>";
    var rows = values.map(function (v) {
        return join(v, "td");
    });
    html += "<tbody>" + join(rows, "tr") + "</tbody>";
    return html;
}

function join(values, tagName) {
    if (values.length === 0) {
        return "";
    }
    var open = "<" + tagName + ">",
        close = "</" + tagName + ">";
    return open + values.join(close + open) + close;
}

const printer = { asTable };
export default printer;
