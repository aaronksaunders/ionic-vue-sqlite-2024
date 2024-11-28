<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>SQLite Demo</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddModal" :disabled="loading">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Error Alert -->
      <ion-alert
        :is-open="!!error"
        header="Error"
        :message="error"
        :buttons="['OK']"
        @didDismiss="error = null"
      />

      <!-- Loading Indicator -->
      <ion-loading :is-open="loading" message="Please wait..." />

      <!-- Items List -->
      <ion-list ref="listRef">
        <ion-item-sliding v-for="item in items" :key="item.id">
          <ion-item>
            <ion-label>
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
            </ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option @click="openEditModal(item)" color="primary">
              <ion-icon :icon="create" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option @click="confirmDelete(item)" color="danger">
              <ion-icon :icon="trash" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Add/Edit Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingItem ? 'Edit Item' : 'Add Item' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Cancel</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Title</ion-label>
            <ion-input v-model="formData.title" placeholder="Enter title"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea
              v-model="formData.description"
              placeholder="Enter description"
              rows="4"
            ></ion-textarea>
          </ion-item>

          <ion-button expand="block" class="ion-margin-top" @click="saveItem">
            {{ editingItem ? 'Update' : 'Add' }}
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * Home Page Component
 * @component
 * @description Main page displaying SQLite database operations demo
 */

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonInput,
  IonModal,
  IonAlert,
  IonLoading,
  IonNote,
  alertController,
  IonTextarea
} from '@ionic/vue';
import { add, create, trash } from 'ionicons/icons';
import { ref } from 'vue';
import { useItems } from '@/composables/useItems';

// Get items functionality from composable
const { items, loading, error, addItem, updateItem, deleteItem } = useItems();

/**
 * Modal open state
 * @type {boolean}
 */
const isModalOpen = ref(false);

/**
 * Currently editing item
 * @type {any|null}
 */
const editingItem = ref<any>(null);

/**
 * Form data for adding/editing item
 * @type {{ title: string, description: string }}
 */
const formData = ref({
  title: '',
  description: ''
});

/**
 * Reference to list element
 */
const listRef = ref();

/**
 * Close all open sliding items
 * @async
 */
const closeAllSlidingItems = async () => {
  const list = listRef.value?.$el as HTMLIonListElement;
  if (list) {
    await list.closeSlidingItems();
  }
};

/**
 * Open add item modal
 * @async
 */
const openAddModal = async () => {
  await closeAllSlidingItems();
  editingItem.value = null;
  formData.value = { title: '', description: '' };
  isModalOpen.value = true;
};

/**
 * Open edit item modal
 * @param {any} item
 */
const openEditModal = async (item: any) => {
  await closeAllSlidingItems();
  editingItem.value = item;
  formData.value = {
    title: item.title,
    description: item.description
  };
  isModalOpen.value = true;
};

/**
 * Close modal
 */
const closeModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
  formData.value = { title: '', description: '' };
};

/**
 * Save item
 * @async
 */
const saveItem = async () => {
  if (!formData.value.title.trim()) {
    return;
  }

  try {
    if (editingItem.value) {
      await updateItem(
        editingItem.value.id,
        formData.value.title,
        formData.value.description
      );
    } else {
      await addItem(formData.value.title, formData.value.description);
    }
    closeModal();
  } catch (err: any) {
    console.error('Error saving item:', err);
  }
};

/**
 * Confirm delete item
 * @param {any} item
 * @async
 */
const confirmDelete = async (item: any) => {
  await closeAllSlidingItems();
  
  const alert = await alertController.create({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await deleteItem(item.id);
        }
      }
    ]
  });
  await alert.present();
};
</script>
