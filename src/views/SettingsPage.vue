<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Database</ion-label>
          </ion-item-divider>

          <ion-item button @click="exportDatabase" :disabled="!isNative">
            <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
            <ion-label>
              <h2>Export Database</h2>
              <p>Save or share your database file</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="importDatabase" :disabled="!isNative">
            <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
            <ion-label>
              <h2>Import Database</h2>
              <p>Restore from a database file</p>
            </ion-label>
          </ion-item>

          <ion-item lines="none" v-if="!isNative">
            <ion-note color="medium">
              Database operations are only available on mobile devices
            </ion-note>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonNote,
  IonIcon,
  IonButtons,
  IonBackButton,
  loadingController,
  toastController,
  alertController
} from '@ionic/vue';
import { downloadOutline, cloudUploadOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';
import { db } from '@/services/DatabaseService';
import { Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';

// Check if running on a native platform
const isNative = Capacitor.getPlatform() !== 'web';

/**
 * Export the database
 * Shows loading indicator and handles success/error states
 */
const exportDatabase = async () => {
  const loading = await loadingController.create({
    message: 'Exporting database...',
    duration: 0
  });
  
  try {
    await loading.present();
    await db.exportDatabase();
    
    const toast = await toastController.create({
      message: 'Database exported successfully',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error: any) {
    console.error('Error exporting database:', error);
    const toast = await toastController.create({
      message: error.message || 'Failed to export database',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    await loading.dismiss();
  }
};

/**
 * Import database from a file
 * Shows confirmation dialog and handles the import process
 */
const importDatabase = async () => {
  // Show confirmation dialog
  const alert = await alertController.create({
    header: 'Import Database',
    message: 'This will replace your current database. Are you sure you want to continue?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Import',
        role: 'confirm',
        handler: () => pickAndImportFile()
      }
    ]
  });
  await alert.present();
};

/**
 * Pick a file and import it
 * Shows loading indicator and handles success/error states
 */
const pickAndImportFile = async () => {
  try {
    // Pick file using Filesystem
    const result = await FilePicker.pickFiles({
      types: ['application/json']
    });

    if (!result.files || result.files.length === 0) {
      return;
    }

    const loading = await loadingController.create({
      message: 'Importing database...',
      duration: 0
    });
    await loading.present();

    try {
      await db.importDatabase(result.files[0].path!);
      const toast = await toastController.create({
        message: 'Database imported successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error: any) {
      console.error('Error importing database:', error);
      const toast = await toastController.create({
        message: error.message || 'Failed to import database',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  } catch (error: any) {
    console.error('Error picking file:', error);
    const toast = await toastController.create({
      message: 'Failed to select file',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};
</script>
