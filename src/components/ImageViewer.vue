<template>
  <div class="image-viewer" @click="showFullImage">
    <img
      :src="imageUrl"
      :class="{ 'thumb': !isExpanded, 'full': isExpanded }"
      :alt="alt"
    />
    <ion-modal
      :is-open="isExpanded"
      @didDismiss="isExpanded = false"
      class="auto-height"
    >
      <ion-content>
        <div class="image-container">
          <img :src="imageUrl" :alt="alt" />
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { IonModal, IonContent } from '@ionic/vue';
import { ref } from 'vue';

interface Props {
  imageUrl: string;
  alt?: string;
}

defineProps<Props>();
const isExpanded = ref(false);

const showFullImage = () => {
  isExpanded.value = true;
};
</script>

<style scoped>
.image-viewer {
  display: inline-block;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.image-container img {
  max-width: 100%;
  height: auto;
}

@media (min-width: 768px) {
  .image-container img {
    max-width: 600px;
  }
}

.auto-height {
  --height: auto;
}
</style>
