class History {
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
            created: Date.now(),
            modified: Date.now()
        }
    
        let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
        history.unshift(item);
        localStorage.setItem('history', JSON.stringify(history));
    
        return item;
    }

    /**
     * Add updated item to localStorage
     * @param {Item} item
     * @param {Object} update
     */
    update(item) {
        let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

        // Apply update
        item.action = 'update';

        // Update history
        history.unshift(item);
        localStorage.setItem('history', JSON.stringify(history));

        return item;
    }

    /**
     * Save item for deletion in localStorage
     * @param {Item} item
     * @returns {Item}
     */
    delete(item) {
        let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

        item.action = 'delete';

        // Update history
        history.unshift(item);
        localStorage.setItem('history', JSON.stringify(history));

        return item;
    }

    /**
     * Sync all pending updates from localStorage to server
     */
    async sync() {
        let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

        for (let i = history.length - 1; i >= 0; i--) {
            const item = history[i];

            switch (item.action) {
                case 'create':
                    try {
                        await api.create(item);
                        history.splice(i, 1);
                        localStorage.setItem('history', history);
                    } catch (err) {
                        console.error(err);
                    }
                    break;
                case 'update':
                    try {
                        await api.update(item);
                        history.splice(i, 1);
                        localStorage.setItem('history', history);
                    } catch (err) {
                        console.error(err);
                    }
                    break;
                case 'delete':
                    try {
                        await api.delete(item);
                        history.splice(i, 1);
                        localStorage.setItem('history', history);
                    } catch (err) {
                        console.error(err);
                    }
                    break;
            }
        }
    }

    async rebuild(items) {
        const history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
    
        for (let i = history.length - 1; i >= 0; i--) {
            const item = history[i];

            switch (item.action) {
                case 'create':
                    if (item.pos) {
                        // Insert new item at index
                        items.splice(item.pos, 0, item);
                    }
                    else {
                        // Insert new item at the end
                        items.push(item);
                    }
    
                    break;
    
                case 'update':
                    // Update items array
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].id === item.id) {
                            delete item.action;
    
                            if (item.pos != items[i].pos) {
                                // We can't use the old pos as reference for splicing
                                // as it doesn't get updated on create/delete (only on server)
                                items.splice(i, 1);
                                items.splice(item.pos, 0, item);
                            }
                            else {
                                items[i] = item;
                            }
    
                            break;
                        }
                    }
    
                    break;
    
                case 'delete':
                    // Update items array
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].id === item.id) {
                            items.splice(i, 1);
                            break;
                        }
                    }
    
                    break;
            }
        }
    
        return items;
    }
    
}