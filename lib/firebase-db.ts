import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';

// Remove all prompt history related code and keep other functionality if any
// ... existing code ... 