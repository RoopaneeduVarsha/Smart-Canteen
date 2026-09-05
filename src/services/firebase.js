import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  query, 
  orderBy,
  updateDoc,
  deleteDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkoYqJ_IRqbEfGdBsVAzksqq3iPK35vVc",
  authDomain: "canteen-9f534.firebaseapp.com",
  projectId: "canteen-9f534",
  storageBucket: "canteen-9f534.firebasestorage.app",
  messagingSenderId: "592840710616",
  appId: "1:592840710616:web:0f5e5e2627f7e63a7dbaad",
  measurementId: "G-FTBPV8CE89"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Firestore Collections helpers with graceful fallback
export const COLLECTIONS = {
  MENU: "canteen_menu",
  ORDERS: "canteen_orders",
  INVENTORY: "canteen_inventory",
  FEEDBACK: "canteen_feedback",
  USERS: "canteen_users",
};

/**
 * Save or update an order in Firestore
 */
export async function syncOrderToFirestore(order) {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, order.order_id);
    await setDoc(orderRef, order, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore sync order notice:", error.message);
    return false;
  }
}

/**
 * Save or update a menu item in Firestore
 */
export async function syncMenuItemToFirestore(item) {
  try {
    const itemRef = doc(db, COLLECTIONS.MENU, item.id);
    await setDoc(itemRef, item, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore sync menu notice:", error.message);
    return false;
  }
}

/**
 * Save or update an inventory item in Firestore
 */
export async function syncInventoryToFirestore(invItem) {
  try {
    const invRef = doc(db, COLLECTIONS.INVENTORY, invItem.id);
    await setDoc(invRef, invItem, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore sync inventory notice:", error.message);
    return false;
  }
}

/**
 * Save feedback to Firestore
 */
export async function syncFeedbackToFirestore(feedback) {
  try {
    const fbRef = doc(db, COLLECTIONS.FEEDBACK, feedback.feedback_id);
    await setDoc(fbRef, feedback, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore sync feedback notice:", error.message);
    return false;
  }
}
