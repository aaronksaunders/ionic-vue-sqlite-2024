<template>
  <ion-modal :is-open="isOpen" @didDismiss="onClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingItem ? 'Edit Item' : 'Add Item' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onClose">Cancel</ion-button>
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
        <ion-textarea v-model="formData.description" placeholder="Enter description" :rows=4></ion-textarea>
      </ion-item>

      <!-- Image Selection -->
      <ion-item>
        <ion-label position="stacked">Image</ion-label>
        <div class="image-controls">
          <div v-if="formData.imageUrl" class="preview-container">
            <img :src="formData.imageUrl" class="image-preview" alt="Selected image" />
            <ion-button fill="clear" color="danger" @click="removeImage">
              <ion-icon :icon="trash" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
          <ion-button v-if="!formData.imageUrl" @click="selectImage">
            <ion-icon :icon="camera" slot="start"></ion-icon>
            Select Image
          </ion-button>
        </div>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" @click="onSave">
        {{ editingItem ? 'Update' : 'Add' }}
      </ion-button>
      <ion-button expand="block" color="medium" @click="onClose">
        Cancel
      </ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonIcon
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { camera, trash } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface Props {
  isOpen: boolean;
  editingItem?: any;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { title: string; description: string; imageUrl?: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Form data for adding/editing item
 */
 const formData = ref({
  title: '',
  description: '',
  imageUrl: ''
}); 

// Watch for editingItem changes to update form
watch(() => props.editingItem, (newItem) => {
  if (newItem) {
    formData.value = {
      title: newItem.title,
      description: newItem.description,
      imageUrl: newItem.imageUrl || ''
    };
  } else {
    formData.value = {
      title: '',
      description: '',
      imageUrl: ''
    };
  }
}, { immediate: true });



const removeImage = () => {
  formData.value.imageUrl = '';
};

/**
 * Handle save button click
 */
 const onSave = () => {
  if (!formData.value.title.trim()) return;
  
  emit('save', {
    title: formData.value.title,
    description: formData.value.description,
    imageUrl: formData.value.imageUrl || undefined
  });
};

const selectImage = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      width: 1024,
      correctOrientation: true
    });

    if (image.base64String) {
      formData.value.imageUrl = `data:image/${image.format};base64,${image.base64String}`;
    }
  } catch (error) {
    console.error('Error selecting image:', error);
  }
};



/**
 * Handle modal close
 */
const onClose = () => {
  emit('close');
  formData.value = {
    title: '',
    description: '',
    imageUrl: ''
  };
};
</script>

<style scoped>
.image-controls {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
</style>