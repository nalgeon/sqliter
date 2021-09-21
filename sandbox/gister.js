// Github Gist API client

const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

class Gister {
    constructor() {
        this.url = "https://api.github.com/gists";
        this.headers = Object.assign({}, HEADERS);
    }

    loadCredentials() {
        this.username = localStorage.getItem("github.username");
        this.password = localStorage.getItem("github.token");
        this.headers.Authorization =
            "Basic " + btoa(this.username + ":" + this.password);
    }

    getUrl(id) {
        return `https://gist.github.com/${this.username}/${id}`;
    }

    get(id) {
        const promise = fetch(`${this.url}/${id}`, {
            method: "get",
            headers: HEADERS,
        }).then((response) => response.json());
        return promise;
    }

    create(name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(this.url, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }

    update(id, name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(`${this.url}/${id}`, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }
}

function buildData(name, schema, query) {
    return {
        description: name,
        files: {
            "schema.sql": {
                content: schema,
            },
            "query.sql": {
                content: query,
            },
        },
    };
}

const gister = new Gister();

export default gister;
