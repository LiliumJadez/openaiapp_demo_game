// ============================================
// 图片缓存管理器 - 使用 IndexedDB 存储
// ============================================

interface CachedImage {
  key: string;        // 缓存键（基于鱼的templateId或特征）
  url: string;        // 图片URL
  blob?: Blob;        // 图片二进制数据（可选）
  timestamp: number;  // 缓存时间
}

const DB_NAME = 'imaginary-sea-image-cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7天

class ImageCacheManager {
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, string> = new Map(); // 内存缓存（快速访问）

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB 初始化失败，将使用内存缓存');
        resolve(); // 不阻塞，降级到内存缓存
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('图片缓存数据库已初始化');
        this.cleanOldCache(); // 清理过期缓存
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 生成缓存键
  private generateKey(templateId: string, rarity: string, weather: string): string {
    return `${templateId}_${rarity}_${weather}`;
  }

  // 获取缓存的图片URL
  async get(templateId: string, rarity: string, weather: string): Promise<string | null> {
    const key = this.generateKey(templateId, rarity, weather);
    
    // 先检查内存缓存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }
    
    // 检查IndexedDB
    if (!this.db) return null;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = () => {
          const cached = request.result as CachedImage | undefined;
          
          if (cached) {
            // 检查是否过期
            if (Date.now() - cached.timestamp < MAX_CACHE_AGE) {
              this.memoryCache.set(key, cached.url);
              resolve(cached.url);
            } else {
              // 过期，删除
              this.delete(key);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.warn('读取缓存失败:', key);
          resolve(null);
        };
      } catch (error) {
        console.warn('缓存读取错误:', error);
        resolve(null);
      }
    });
  }

  // 保存图片到缓存
  async set(templateId: string, rarity: string, weather: string, url: string): Promise<void> {
    const key = this.generateKey(templateId, rarity, weather);
    
    // 保存到内存缓存
    this.memoryCache.set(key, url);
    
    // 保存到IndexedDB
    if (!this.db) return;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const cached: CachedImage = {
          key,
          url,
          timestamp: Date.now(),
        };
        
        store.put(cached);
        
        transaction.oncomplete = () => {
          console.log('图片已缓存:', key);
          resolve();
        };
        
        transaction.onerror = () => {
          console.warn('缓存保存失败:', key);
          resolve(); // 失败不阻塞
        };
      } catch (error) {
        console.warn('缓存保存错误:', error);
        resolve();
      }
    });
  }

  // 删除缓存
  private async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (!this.db) return;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  // 清理过期缓存
  private async cleanOldCache(): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const cached = cursor.value as CachedImage;
            if (Date.now() - cached.timestamp > MAX_CACHE_AGE) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
        
        transaction.oncomplete = () => {
          console.log('过期缓存已清理');
          resolve();
        };
        
        transaction.onerror = () => resolve();
      } catch (error) {
        console.warn('清理缓存错误:', error);
        resolve();
      }
    });
  }

  // 清空所有缓存
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    
    if (!this.db) return;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        
        transaction.oncomplete = () => {
          console.log('所有缓存已清空');
          resolve();
        };
        
        transaction.onerror = () => resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  // 获取缓存统计
  async getStats(): Promise<{ count: number; size: number }> {
    if (!this.db) return { count: this.memoryCache.size, size: 0 };
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          resolve({ count: countRequest.result, size: 0 });
        };
        
        countRequest.onerror = () => {
          resolve({ count: 0, size: 0 });
        };
      } catch (error) {
        resolve({ count: 0, size: 0 });
      }
    });
  }
}

// 单例
export const imageCache = new ImageCacheManager();

// 初始化缓存（在应用启动时调用）
export async function initImageCache() {
  await imageCache.init();
}

