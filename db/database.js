const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'db.json');

class JSONDatabase {
  constructor() {
    this.data = {};
    this.init();
  }

  init() {
    const dataDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database file. Initializing empty DB.', err);
        this.data = {};
      }
    } else {
      this.data = {};
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file.', err);
    }
  }

  // Helper to match filter conditions
  _matches(item, filter) {
    if (!filter) return true;
    for (const key in filter) {
      if (item[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  }

  // Get a collection array (or initialize it)
  _getCollection(collectionName) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    return this.data[collectionName];
  }

  // CRUD Interface
  find(collectionName, filter = null) {
    const collection = this._getCollection(collectionName);
    if (!Array.isArray(collection)) {
      return [collection];
    }
    if (!filter) return [...collection];
    return collection.filter(item => this._matches(item, filter));
  }

  findOne(collectionName, filter) {
    const collection = this._getCollection(collectionName);
    if (!Array.isArray(collection)) {
      return collection;
    }
    return collection.find(item => this._matches(item, filter)) || null;
  }

  insertOne(collectionName, doc) {
    const collection = this._getCollection(collectionName);
    if (!Array.isArray(collection)) {
      // Convert to array if it was somehow an object
      this.data[collectionName] = [collection];
    }
    const newDoc = {
      _id: doc._id || Math.random().toString(36).substr(2, 9),
      ...doc
    };
    this.data[collectionName].push(newDoc);
    this.save();
    return newDoc;
  }

  updateOne(collectionName, filter, updateData) {
    const collection = this._getCollection(collectionName);
    if (!Array.isArray(collection)) {
      const updated = {
        ...collection,
        ...updateData
      };
      this.data[collectionName] = updated;
      this.save();
      return updated;
    }

    const index = collection.findIndex(item => this._matches(item, filter));
    if (index === -1) return null;

    // Support both direct set and standard merge updates
    const currentDoc = collection[index];
    const updatedDoc = {
      ...currentDoc,
      ...updateData,
      _id: currentDoc._id // Protect primary key
    };

    collection[index] = updatedDoc;
    this.save();
    return updatedDoc;
  }

  deleteOne(collectionName, filter) {
    const collection = this._getCollection(collectionName);
    const index = collection.findIndex(item => this._matches(item, filter));
    if (index === -1) return false;

    collection.splice(index, 1);
    this.save();
    return true;
  }

  // Specific helper to save/overwrite collection items (e.g. for reordering)
  saveCollection(collectionName, items) {
    this.data[collectionName] = items;
    this.save();
  }
}

module.exports = new JSONDatabase();
