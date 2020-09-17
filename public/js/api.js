class Api {
    constructor() {
        this.url = '/api/item';
    }

    async fetch(callback) {
        let networkDataReceived = false;
        let items;

        // Fetch network data
        let networkUpdate = fetch(this.url).then(function(response) {
            return response.json();
        }).then(async function(data) {
            networkDataReceived = true;
            items = await history.rebuild(data);
            callback(items);
        });
    
        // Fetch cached data
        caches.match(this.url).then(function(response) {
            if (!response) throw Error("No data");
            return response.json();
        }).then(async function(data) {
            // Only update if there was no network update (yet)
            if (!networkDataReceived) {
                items = await history.rebuild(data);
                callback(items);
            }
        }).catch(function() {
            return networkUpdate;
        }).catch(function(e) {
            console.error("Error fetching data", e);
        });
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