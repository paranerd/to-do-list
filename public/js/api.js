class Api {
    constructor() {
        this.url = '/api/item';
    }

    /**
     * Create item
     * 
     * @param {string} name
     * @param {number} ts
     * @throws {Error}
     * @returns {Item}
     */
    async create(name, ts = null) {
        const params = {name: name, ts: ts};

        try {
            const res = await fetch(this.url, {
                method: 'POST',
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
    
    /**
     * Update item
     * 
     * @param {string} id
     * @param {boolean} done
     * @param {number} ts
     * @throws {Error}
     * @returns {Item}
     */
    async update(item, ts = null) {
        const params = Object.assign(item, ts);

        try {
            const res = await fetch(this.url, {
                method: 'PATCH',
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

    /**
     * Delete item
     * 
     * @param {string} id
     * @param {number} ts
     * @throws {Error}
     */
    async delete(id, ts = null) {
        const params = {id: id, ts: ts};

        try {
            const res = await fetch(this.url, {
                method: 'DELETE',
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