// Заглушка для работы с данными (MVP)
// В будущем будет заменена на реальное API

const storage = {
    tasks: [],
    notes: [],
    activity: []
};

export const DataService = {
    async get(collection) {
        console.log(`Fetching ${collection}...`);
        return storage[collection] || [];
    },
    
    async add(collection, item) {
        console.log(`Adding to ${collection}`, item);
        if (!storage[collection]) {
            storage[collection] = [];
        }
        storage[collection].push(item);
        return true;
    },
    
    async update(collection, id, updates) {
        console.log(`Updating ${collection} ${id}`, updates);
        const index = storage[collection]?.findIndex(item => item.id === id);
        if (index !== -1) {
            storage[collection][index] = { ...storage[collection][index], ...updates };
            return true;
        }
        return false;
    },
    
    async delete(collection, id) {
        console.log(`Deleting from ${collection} ${id}`);
        if (storage[collection]) {
            storage[collection] = storage[collection].filter(item => item.id !== id);
            return true;
        }
        return false;
    }
};