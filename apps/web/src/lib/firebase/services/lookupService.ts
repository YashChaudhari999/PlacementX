import { ref, get } from 'firebase/database';
import { database } from '../config/firebaseApp';

export class LookupService {
  static async getDepartments(): Promise<
    Record<string, { id: string; name: string; code?: string }>
  > {
    const dbRef = ref(database, 'lookup/departments');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as Record<string, { id: string; name: string; code?: string }>;
    }
    return {};
  }

  static async getBranches(): Promise<
    Record<string, { id: string; name: string; departmentId: string }>
  > {
    const dbRef = ref(database, 'lookup/branches');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as Record<string, { id: string; name: string; departmentId: string }>;
    }
    return {};
  }
}
