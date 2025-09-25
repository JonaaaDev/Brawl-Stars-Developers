import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, serverTimestamp, DataSnapshot, remove } from "firebase/database";
import type { Country } from '../types';

// Your web app's Firebase configuration from user request
const firebaseConfig = {
  apiKey: "AIzaSyDB-p0cMBBUZ8mERZgAamAy98UIRnAnn_Q",
  authDomain: "thnn-8d394.firebaseapp.com",
  databaseURL: "https://thnn-8d394-default-rtdb.firebaseio.com",
  projectId: "thnn-8d394",
  storageBucket: "thnn-8d394.firebasestorage.app",
  messagingSenderId: "399428322629",
  appId: "1:399428322629:web:abad9b8cfaec9beb056a2c",
  measurementId: "G-RQV2KFBTCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const countriesRef = ref(db, 'countries');

export const saveCountry = async (countryName: string, batteryLevel?: number, isCharging?: boolean, postalCode?: string, city?: string): Promise<string | null> => {
  if (!countryName.trim()) {
    throw new Error("Country name cannot be empty.");
  }
  try {
    const dataToPush: { name: string; createdAt: object; battery?: number; isCharging?: boolean; postalCode?: string; city?: string; } = {
      name: countryName,
      createdAt: serverTimestamp(),
    };

    if (typeof batteryLevel === 'number') {
      dataToPush.battery = batteryLevel;
    }

    if (typeof isCharging === 'boolean') {
      dataToPush.isCharging = isCharging;
    }

    if (postalCode) {
      dataToPush.postalCode = postalCode;
    }
    
    if (city) {
      dataToPush.city = city;
    }

    const newEntryRef = await push(countriesRef, dataToPush);
    return newEntryRef.key;
  } catch (error) {
    console.error("Error saving country to Firebase:", error);
    throw error;
  }
};

export const deleteCountry = async (id: string): Promise<void> => {
  try {
    const countryToDeleteRef = ref(db, `countries/${id}`);
    await remove(countryToDeleteRef);
  } catch (error) {
    console.error("Error deleting country from Firebase:", error);
    throw error;
  }
};


export const onCountriesChange = (callback: (countries: Country[]) => void) => {
  const listener = onValue(countriesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    const countriesArray: Country[] = [];
    if (data) {
      for (const key in data) {
        countriesArray.push({ id: key, ...data[key] });
      }
    }
    // Sort by creation time, newest first
    countriesArray.sort((a, b) => b.createdAt - a.createdAt);
    callback(countriesArray);
  }, (error) => {
    console.error("Firebase read failed:", error);
  });

  // Return a function to unsubscribe from the listener
  return () => off(countriesRef, 'value', listener);
};