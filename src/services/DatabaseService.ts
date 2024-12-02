import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Service class for handling SQLite database operations
 * @class DatabaseService
 * @description Manages SQLite database connections and operations for both web and mobile platforms
 */
class DatabaseService {
  /** SQLite connection instance */
  private sqlite: SQLiteConnection;
  /** Active database connection */
  private db!: SQLiteDBConnection;
  /** Flag indicating if database is initialized */
  private initialized: boolean = false;
  /** Name of the database */
  private readonly DB_NAME = 'my_db';

  /**
   * Creates an instance of DatabaseService
   * Initializes SQLite connection
   */
  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initializes the database connection and creates necessary tables
   * @returns {Promise<void>}
   * @throws {Error} If database initialization fails
   */
  public async initializeDatabase(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const isConnection = await this.sqlite.isConnection(this.DB_NAME, false);
      if (isConnection.result) {
        this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      
      // Create tables
      const schema = `
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await this.db.execute(schema);
      
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }

  /**
   * Create a new item
   * @param {string} title - The item title
   * @param {string} description - The item description
   * @param {string} imageUrl - The item image URL
   * @returns {Promise<number>} The ID of the created item
   * @throws {Error} If the insert operation fails
   */
  public async createItem(title: string, description: string, imageUrl?: string): Promise<number> {
    try {
      if (!this.initialized) {
        await this.initializeDatabase();
      }
      const now = new Date().toISOString();
      const query = 'INSERT INTO items (title, description, imageUrl, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
      const result = await this.db.run(query, [title, description, imageUrl || null, now, now]);
      return result.changes?.lastId || 0;
    } catch (err) {
      console.error('Error creating item:', err);
      throw err;
    }
  }

  /**
   * Get all items
   * @returns {Promise<any[]>} Array of items
   * @throws {Error} If the query operation fails
   */
  public async getItems(): Promise<any[]> {
    try {
      if (!this.initialized) {
        await this.initializeDatabase();
      }
      const query = 'SELECT * FROM items ORDER BY created_at DESC';
      const result = await this.db.query(query);
      return result.values || [];
    } catch (err) {
      console.error('Error getting items:', err);
      throw err;
    }
  }

  /**
   * Get item by ID
   * @param {number} id - The item ID
   * @returns {Promise<any>} The item object
   * @throws {Error} If the query operation fails
   */
  public async getItem(id: number): Promise<any> {
    try {
      if (!this.initialized) {
        await this.initializeDatabase();
      }
      const query = 'SELECT * FROM items WHERE id = ?';
      const result = await this.db.query(query, [id]);
      return result.values?.[0];
    } catch (err) {
      console.error('Error getting item:', err);
      throw err;
    }
  }

  /**
   * Update an item
   * @param {number} id - The item ID
   * @param {string} title - The new title
   * @param {string} description - The new description
   * @param {string} imageUrl - The new image URL
   * @returns {Promise<void>}
   * @throws {Error} If the update operation fails
   */
  public async updateItem(id: number, title: string, description: string, imageUrl?: string): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initializeDatabase();
      }
      const now = new Date().toISOString();
      const query = 'UPDATE items SET title = ?, description = ?, imageUrl = ?, updated_at = ? WHERE id = ?';
      await this.db.run(query, [title, description, imageUrl || null, now, id]);
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }

  /**
   * Delete an item
   * @param {number} id - The item ID
   * @returns {Promise<void>}
   * @throws {Error} If the delete operation fails
   */
  public async deleteItem(id: number): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initializeDatabase();
      }
      const query = 'DELETE FROM items WHERE id = ?';
      await this.db.run(query, [id]);
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }

  /**
   * Export database to a file and share it
   * @returns {Promise<string>} Path to the exported file
   * @throws {Error} If export fails or not running on device
   */
  public async exportDatabase(): Promise<string> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        throw new Error('Database export is only available on mobile devices');
      }

      if (!this.initialized) {
        await this.initializeDatabase();
      }

      // Export database to JSON
      const jsonExport = await this.db.exportToJson('full');
      const jsonString = JSON.stringify(jsonExport.export);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `sqlite-export-${timestamp}.json`;

      // Save to filesystem
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      // Get the full path of the saved file
      const filePath = result.uri;

      // Share the file
      await Share.share({
        title: 'Database Export',
        text: 'SQLite Database Export',
        url: filePath,
        dialogTitle: 'Share Database Export'
      });

      return filePath;
    } catch (err) {
      console.error('Error exporting database:', err);
      throw err;
    }
  }

  /**
   * Import database from a JSON file
   * @param {string | Blob} filePath - Path to the JSON file or a Blob
   * @returns {Promise<void>}
   * @throws {Error} If import fails or not running on device
   */
  public async importDatabase(filePath: string | Blob): Promise<void> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        throw new Error('Database import is only available on mobile devices');
      }

      // If a Blob is passed, convert it to a file path or content
      const actualFilePath = typeof filePath === 'string' 
        ? filePath 
        : URL.createObjectURL(filePath);

      if (!this.initialized) {
        await this.initializeDatabase();
      }

      // Read the file
      const fileContent = await Filesystem.readFile({
        path: actualFilePath,
        encoding: Encoding.UTF8
      });

      // Parse JSON and validate format
      const importData = JSON.parse(fileContent.data as string);
      if (!importData.export || typeof importData.export !== 'object') {
        throw new Error('Invalid database export file format');
      }

      // Import the data
      await this.sqlite.importFromJson(importData);
      
      // Close and reopen connection to ensure clean state
      await this.db.close();
      this.initialized = false;
      await this.initializeDatabase();

      // Revoke the object URL if a Blob was used
      if (typeof filePath !== 'string') {
        URL.revokeObjectURL(actualFilePath);
      }
    } catch (err) {
      console.error('Error importing database:', err);
      throw err;
    }
  }
}

/** Singleton instance of DatabaseService */
export const db = new DatabaseService();
