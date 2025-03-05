import { MemStorage } from './storage';
import { DbStorage } from './db-storage';

// Choose which storage implementation to use
// For development, you can switch between MemStorage and DbStorage
// export const storage = new MemStorage();
export const storage = new DbStorage(); 