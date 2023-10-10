const fs = require('fs').promises;
const path = require('path');

const DB_FOLDER = './db'; 
const DB_FILE = 'session.json';
const LOG_FILE = 'log.json'

const dbService = {

  async getLog() {
    try {
      const filePath = this._getFilePath(LOG_FILE); 
      let data = [];
      if (fs.existsSync(filePath)) data = JSON.parse(await fs.readFile(filePath));
      return data;
    } catch (err) {
      console.error('Error getting logs', err);
      return [];
    }
  },

  async saveLog(id) {
    try {
      await this._ensureFolder();
      const filePath = this._getFilePath(LOG_FILE);
      let data = [];
      if (fs.existsSync(filePath)) data = JSON.parse(await fs.readFile(filePath));
      if (!data.includes(id)) {
        data.push(id);
        await fs.writeFile(filePath, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error saving log', err);
    }
  },

  async saveSession(session) {
    await this._ensureFolder(); 
    const data = { session };
    await fs.writeFile(this._getFilePath(DB_FILE), JSON.stringify(data));
  },

  async getSession() {
    const data = JSON.parse(await fs.readFile(this._getFilePath(DB_FILE)));
    return data.session; 
  },

  async _ensureFolder() {
    try {
      await fs.mkdir(DB_FOLDER);
    } catch {}
  },

  _getFilePath(FILE_PATH) {
    return path.join(DB_FOLDER, FILE_PATH);
  }

};

module.exports = dbService;