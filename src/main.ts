import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

/**
 * Initialize the application with SQLite support
 * This function handles the initialization of SQLite for web platform
 * and mounts the Vue application
 */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (Capacitor.getPlatform() === 'web') {
      // Initialize SQLite for web platform
      await jeepSqlite(window);
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqliteEl);
      await customElements.whenDefined('jeep-sqlite');
      
      // Initialize SQLite web store
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.initWebStore();
    }

    // Create and mount Vue application
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
