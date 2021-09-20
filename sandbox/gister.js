// Github Gist API client

class Gister {
    constructor() {
        this.url = "https://api.github.com/gists";
        this.headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };
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

    create(name, schema, query) {
        const data = buildData(schema, query);
        const promise = fetch(this.url, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }

    update(id, schema, query) {
        const data = buildData(schema, query);
        const promise = fetch(`${this.url}/${id}`, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }
}

function buildData(schema, query) {
    return {
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
