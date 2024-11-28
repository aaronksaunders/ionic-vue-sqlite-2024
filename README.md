# Ionic Vue SQLite Demo

This project demonstrates how to use SQLite in an Ionic Vue application, supporting both web and mobile platforms.

## Installation Steps

### 1. Create a new Ionic Vue project (if starting from scratch)
```bash
npm init @ionic/app my-app --type vue
cd my-app
```

### 2. Install Required Dependencies
```bash
# Install SQLite plugin
npm install @capacitor-community/sqlite

# Install jeep-sqlite for web platform support
npm install jeep-sqlite

# Install PWA elements (required for web platform)
npm install @ionic/pwa-elements
```

### 3. Set Up SQLite WASM Files

For web platform support, you need to copy the SQLite WASM files to your public assets directory:

1. Create an assets directory in public if it doesn't exist:
```bash
mkdir -p public/assets
```

2. Copy the required files from node_modules:
```bash
# Copy SQLite WASM file
cp node_modules/sql.js/dist/sql-wasm.wasm public/assets/

# Copy SQLite Worker file
cp node_modules/@capacitor-community/sqlite/dist/sqlite.worker.js public/assets/
```

These files are essential for SQLite to work in the web browser. The paths should match what's being used in the initialization code (`/assets/sql-wasm.wasm` and `/assets/sqlite.worker.js`).

### 4. Configure Project for Web Platform

#### Update main.ts
Add the following imports and initialization code in your `src/main.ts`:

```typescript
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (Capacitor.getPlatform() === 'web') {
      // Web platform initialization
      await jeepSqlite(window);
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqliteEl);
      await customElements.whenDefined('jeep-sqlite');
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.initWebStore();
    }

    const app = createApp(App)
      .use(IonicVue)
      .use(router);

    await router.isReady();
    app.mount('#app');

  } catch (err) {
    console.error('Error initializing app:', err);
    throw err;
  }
});
```

### 5. Configure Native Platforms (Optional)

If you plan to deploy to iOS or Android:

```bash
# Add iOS platform
npm install @capacitor/ios
npx cap add ios

# Add Android platform
npm install @capacitor/android
npx cap add android
```

### 6. Database Service Implementation

Create a `src/services/DatabaseService.ts` file:

```typescript
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized: boolean = false;
  private readonly DB_NAME = 'my_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  public async initializeDatabase() {
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
      
      // Create your tables here
      const schema = `
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Add your database operations here
}

export const db = new DatabaseService();
```

## Data Storage

### Web Platform (Browser)
When running in a web browser, SQLite data is stored in the browser's IndexedDB:
- Location: Browser's IndexedDB storage under your app's domain
- Storage Name: `jeep-sqlite_store`
- Persistence: Data persists between browser sessions unless:
  - User clears browser data
  - User uses private/incognito mode
  - Browser storage quota is exceeded
- Storage Limits: Depends on browser and device
  - Chrome: Generally ~80% of available disk space
  - Safari: Generally limited to ~1GB
  - Firefox: Generally ~2GB
- Access: Data is isolated per domain and can only be accessed by your application

To view stored data in Chrome DevTools:
1. Open DevTools (F12 or Right Click -> Inspect)
2. Go to "Application" tab
3. Expand "IndexedDB" in the left sidebar
4. Look for `jeep-sqlite_store`

### Native Platforms (iOS/Android)
When running as a native app:
- iOS: Data is stored in the app's documents directory
- Android: Data is stored in the app's internal storage
- Data persists until the app is uninstalled

## Usage

1. Import the database service in your components:
```typescript
import { db } from '@/services/DatabaseService';
```

2. Initialize the database when your app starts:
```typescript
await db.initializeDatabase();
```

3. Use the database service for operations:
```typescript
// Example: Add an item
await db.addItem('Test Item');

// Example: Get all items
const items = await db.getItems();
```

## Important Notes

1. For web platform:
   - SQLite data is stored in IndexedDB
   - The database is initialized in `main.ts` before the app mounts
   - Make sure to handle the initialization properly as shown in the setup

2. For mobile platforms:
   - Native SQLite is used
   - After making changes to your native plugins, sync them:
     ```bash
     npx cap sync
     ```

## Common Issues

1. "Property 'setSQLiteWasm' does not exist on type 'SQLiteConnection'":
   - This error occurs if the SQLite initialization for web platform is not properly set up
   - Ensure the initialization in `main.ts` is exactly as shown above

2. "The jeep-sqlite element is not present in the DOM":
   - This error occurs if the SQLite web components are not properly initialized
   - Make sure the initialization in `main.ts` is complete before any database operations

3. "Failed to load WASM file" or "SQLite Worker not found":
   - This occurs when the WASM or worker files are not in the correct location
   - Verify that both files exist in `public/assets/`:
     - `sql-wasm.wasm`
     - `sqlite.worker.js`
   - Make sure the files were copied correctly from node_modules
   - Check that the paths in the initialization code match your actual file locations

4. Data Persistence Issues:
   - If data is not persisting in the browser:
     - Check if you're in private/incognito mode
     - Verify IndexedDB storage isn't being cleared by browser settings
     - Check browser storage quota using DevTools
   - If data is inconsistent between web and mobile:
     - Remember that web and mobile use different storage mechanisms
     - Data doesn't automatically sync between platforms
     - Consider implementing a sync mechanism if needed

## Resources

- [Capacitor SQLite Plugin Documentation](https://github.com/capacitor-community/sqlite)
- [Web Platform Usage Guide](https://github.com/capacitor-community/sqlite/blob/master/docs/Web-Usage.md)
- [Ionic Framework Documentation](https://ionicframework.com/docs)
