class Api {
    constructor() {
        this.url = '/api/item';
    }

    async create(name, ts = null) {
        const params = {name: name, ts: ts};

        try {
            const res = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!res.ok) {
                throw Error(res.statusText);
            }
    
            return await res.json();
        } catch (e) {
            throw new Error(e);
        }
    }
    
    async update(id, done, ts = null) {
        const params = {id: id, done: done, ts: ts};

        try {
            const res = await fetch(this.url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!res.ok) {
                throw Error(res.statusText);
            }

            return await res.json();
        } catch (e) {
            throw new Error(e);
        }
    }

    async delete(id, ts = null) {
        const params = {id: id, ts: ts};

        try {
            const res = await fetch(this.url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!res.ok) {
                throw Error(res.statusText);
            }
        } catch (e) {
            throw new Error(e);
        }
    }
}