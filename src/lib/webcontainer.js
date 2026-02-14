import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let bootPromise = null;

export const getWebContainer = async () => {
  // 1. Agar pehle se booted hai, turant return karo
  if (webContainerInstance) return webContainerInstance;

  // 2. Agar boot process chal raha hai, toh wait karo (Naya shuru mat karo)
  if (bootPromise) return bootPromise;

  // 3. Naya Boot Process Start karo
  bootPromise = (async () => {
    try {
      console.log("🚀 Pre-booting WebContainer in background...");
      
      // Boot process
      webContainerInstance = await WebContainer.boot();
      
      console.log("✅ WebContainer Ready!");
      return webContainerInstance;
    } catch (error) {
      bootPromise = null; // Reset taaki retry kar sakein
      console.error("❌ Boot failed:", error);
      throw error;
    }
  })();

  return bootPromise;
};