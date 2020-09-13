class Cache {
    constructor() {}

    /**
     * Create item in localStorage
     * @param {string} name
     */
    create(name) {
        const item = {
            id: uuidv4(),
            name: name,
            done: false,
            action: 'create',
            localOnly: true,
            created: Date.now(),
            modified: Date.now()
        }
    
        let cachedItems = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];
        cachedItems.push(item);
        localStorage.setItem('items', JSON.stringify(cachedItems));
    
        return item;
    }

    /**
     * Add updated item to localStorage
     * @param {Item} item
     * @param {Object} update
     */
    update(item, update) {
        let found = false;
        let cacheItems = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];

        // Apply update
        Object.assign(item, update);
        item.action = 'update';
        item.modified = Date.now();

        for (let i = 0; i < cacheItems.length - 1; i++) {
            if (cacheItems[i].id === item.id) {
                cacheItems[i] = item;

                found = true;
                break;
            }
        }

        if (!found) {
            cacheItems.push(item);
        }

        localStorage.setItem('items', JSON.stringify(cacheItems));

        return item;
    }

    /**
     * Save item for deletion in localStorage
     * @param {Item} item
     * @returns {Item}
     */
    delete(item) {
        let found = false;
        let cacheItems = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];

        item.action = 'delete';
        item.modified = Date.now();

        for (let i = cacheItems.length; i >= 0; i--) {
            if (cacheItems[i].id === id) {
                if (cacheItems[i].localOnly) {
                    cacheItems.splice(i, 1);
                }
                else {
                    cacheItems[i] = item;
                }

                found = true;
                break;
            }
        }

        if (!found) {
            cacheItems.push(item);
        }

        localStorage.setItem('items', JSON.stringify(cachedItems));

        return item;
    }

    /**
     * Sync all pending updates from localStorage to server
     */
    async sync() {
        let cachedItems = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];

        for (let i = cachedItems.length - 1; i >= 0; i--) {
            const item = cachedItems[i];

            switch (item.action) {
                case 'create':
                    try {
                        await api.create(item.name, item.created);
                        cachedItems.splice(i, 1);
                    } catch (e) {
                        console.log(e);
                    }
                    break;
                case 'update':
                    try {
                        await api.update(item.id, item.done, item.name, item.modified);
                        cachedItems.splice(i, 1);
                    } catch (e) {
                        console.log(e);
                    }
                    break;
                case 'delete':
                    try {
                        await api.delete(item.id, item.modified);
                        cachedItems.splice(i, 1);
                    } catch (e) {
                        console.log(e);
                    }
                    break;
            }
        }

        localStorage.setItem('items', cachedItems);
    }
}