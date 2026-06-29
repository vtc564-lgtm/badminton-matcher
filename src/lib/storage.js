import localforage from 'localforage';
import { extractDominantColor } from './colorLogic';

// Initialize stores
const topsStore = localforage.createInstance({
  name: 'badminton-outfits',
  storeName: 'tops'
});

const bottomsStore = localforage.createInstance({
  name: 'badminton-outfits',
  storeName: 'bottoms'
});

export const getTops = async () => {
  const tops = [];
  await topsStore.iterate((value, key) => {
    tops.push({ id: key, ...value });
  });
  return tops;
};

export const addTop = async (id, base64Image) => {
  const dominantColor = await extractDominantColor(base64Image);
  await topsStore.setItem(id, { image: base64Image, color: dominantColor, timestamp: Date.now() });
};

export const removeTop = async (id) => {
  await topsStore.removeItem(id);
};

export const getBottoms = async () => {
  const bottoms = [];
  await bottomsStore.iterate((value, key) => {
    bottoms.push({ id: key, ...value });
  });
  return bottoms;
};

export const addBottom = async (id, base64Image) => {
  const dominantColor = await extractDominantColor(base64Image);
  await bottomsStore.setItem(id, { image: base64Image, color: dominantColor, timestamp: Date.now() });
};

export const removeBottom = async (id) => {
  await bottomsStore.removeItem(id);
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
