class Api {
    constructor() {
        this.url = '/api/item';
    }

    /**
     * Create item
     * 
     * @param {Item} item
     * @throws {Error}
     * @returns {Item}
     */
    async create(item) {
        try {
            const res = await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(item)
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
     * @param {Item} item
     * @throws {Error}
     * @returns {Item}
     */
    async update(item) {
        try {
            const res = await fetch(this.url, {
                method: 'PATCH',
                body: JSON.stringify(item)
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
     * @param {Item} item
     * @throws {Error}
     */
    async delete(item) {
        try {
            const res = await fetch(this.url, {
                method: 'DELETE',
                body: JSON.stringify(item)
            });

            if (!res.ok) {
                throw Error(res.statusText);
            }
        } catch (e) {
            throw new Error(e);
        }
    }
}