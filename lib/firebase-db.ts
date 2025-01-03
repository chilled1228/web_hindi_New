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

export interface PromptHistoryItem {
  id?: string;
  userId: string;
  promptType: string;
  inputImage?: string;
  outputText: string;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  lastDoc: DocumentData | null;
  hasMore: boolean;
}

export async function savePromptToHistory(data: Omit<PromptHistoryItem, 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'prompt_history'), {
      ...data,
      createdAt: new Date(),
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error saving prompt history:', error);
    throw error;
  }
}

export async function getPromptHistory(
  userId: string, 
  pageSize: number = 10,
  lastDocId?: string
): Promise<PaginatedResponse<PromptHistoryItem>> {
  try {
    let queryRef = query(
      collection(db, 'prompt_history'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Get one extra to check if there are more items
    );

    // If we have a last document ID, start after it
    if (lastDocId) {
      const lastDocRef = doc(db, 'prompt_history', lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        queryRef = query(queryRef, startAfter(lastDocSnap));
      }
    }

    const snapshot = await getDocs(queryRef);
    const items = snapshot.docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as PromptHistoryItem[];

    const hasMore = snapshot.docs.length > pageSize;
    const lastDoc = items[items.length - 1];

    return {
      items,
      lastDoc: lastDoc || null,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting prompt history:', error);
    throw error;
  }
} 