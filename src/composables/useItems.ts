import { ref, onMounted } from 'vue';
import { db } from '@/services/DatabaseService';

/**
 * Composable for managing items in the SQLite database
 * @returns {Object} Object containing items state and CRUD operations
 * @property {Ref<any[]>} items - Reactive array of items
 * @property {Ref<boolean>} loading - Loading state indicator
 * @property {Ref<string|null>} error - Error message if any
 * @property {Function} init - Initialize database and load items
 * @property {Function} loadItems - Load all items from database
 * @property {Function} addItem - Add a new item
 * @property {Function} updateItem - Update an existing item
 * @property {Function} deleteItem - Delete an item
 */
export function useItems() {
  /** Reactive array of items */
  const items = ref<any[]>([]);
  /** Loading state indicator */
  const loading = ref(false);
  /** Error message if any */
  const error = ref<string | null>(null);

  /**
   * Initialize the database and load items
   * @async
   * @throws {Error} If database initialization fails
   */
  const init = async () => {
    try {
      await db.initializeDatabase();
      await loadItems();
    } catch (err: any) {
      error.value = err.message;
    }
  };

  /**
   * Load all items from the database
   * @async
   * @throws {Error} If loading items fails
   */
  const loadItems = async () => {
    loading.value = true;
    try {
      items.value = await db.getItems();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Add a new item to the database
   * @async
   * @param {string} title - Title of the item
   * @param {string} description - Description of the item
   * @param {string} imageUrl - Image URL of the item
   * @throws {Error} If adding item fails
   */
  const addItem = async (title: string, description: string, imageUrl?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const id = await db.createItem(title, description, imageUrl);
      items.value.push({ id, title, description, imageUrl });
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing item
   * @async
   * @param {number} id - ID of the item to update
   * @param {string} title - New title for the item
   * @param {string} description - New description for the item
   * @param {string} imageUrl - New image URL for the item
   * @throws {Error} If updating item fails
   */
  const updateItem = async (id: number, title: string, description: string, imageUrl?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await db.updateItem(id, title, description, imageUrl);
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = { id, title, description, imageUrl };
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete an item from the database
   * @async
   * @param {number} id - ID of the item to delete
   * @throws {Error} If deleting item fails
   */
  const deleteItem = async (id: number) => {
    try {
      await db.deleteItem(id);
      await loadItems();
    } catch (err: any) {
      error.value = err.message;
    }
  };

  // Initialize on mount
  onMounted(init);

  return {
    // State
    items,
    loading,
    error,
    // Methods
    init,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
  };
}
