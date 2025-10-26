// src/stores/AnnouncementStore.ts
import * as SecureStore from 'expo-secure-store';
import { makeAutoObservable, runInAction } from 'mobx';
import { AnnouncementDTO } from '@/services/emigro/types';
import { fetchAnnouncements, dismissAnnouncement } from '@/services/emigro/announcements';

const DISMISSED_KEY = 'announcements.dismissed.v1';

class AnnouncementStore {
  announcements: AnnouncementDTO[] = [];
  dismissedIds: Set<string> = new Set();
  isLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  async preload(): Promise<void> {
    // Load dismissed locally first so UI doesn't "flash"
    const raw = await SecureStore.getItemAsync(DISMISSED_KEY);
    if (raw) {
      try {
        this.dismissedIds = new Set(JSON.parse(raw));
      } catch {}
    }

	try {
	  const list = await fetchAnnouncements();
	  console.log('[AnnouncementStore] fetched', Array.isArray(list) ? list.length : list);

	  // Auto-heal: if the server returns an announcement id that we had locally dismissed,
	  // it means the server no longer considers it dismissed (or it was re-created).
	  // Remove those ids from the local dismissal cache and persist the fix.
	  const incomingIds = new Set(list.map(a => a.id));
	  const staleLocalIds: string[] = [];
	  for (const id of Array.from(this.dismissedIds)) {
	    if (incomingIds.has(id)) staleLocalIds.push(id);
	  }
	  if (staleLocalIds.length > 0) {
	    runInAction(() => {
	      staleLocalIds.forEach(id => this.dismissedIds.delete(id));
	    });
	    await SecureStore.setItemAsync(DISMISSED_KEY, JSON.stringify(Array.from(this.dismissedIds)));
	    console.log('[AnnouncementStore] auto-healed local dismissals removed =', staleLocalIds);
	  }

	  runInAction(() => {
	    // Server already filters server-side dismissals; only apply local instant-dismiss filter.
	    this.announcements = list.filter(a => !this.dismissedIds.has(a.id));
	    console.log('[AnnouncementStore] after filter', this.announcements.length);
	    this.isLoaded = true;
	  });
	} catch (e) {
	  // Fail-safe: keep whatever we have; don't block UI
	  runInAction(() => {
	    this.isLoaded = true;
	  });
	  console.warn('[AnnouncementStore] Failed to fetch announcements', e);
	}

  }

  async close(id: string): Promise<void> {
    // Optimistic update
    runInAction(() => {
      this.dismissedIds.add(id);
      this.announcements = this.announcements.filter(a => a.id !== id);
    });
    await SecureStore.setItemAsync(DISMISSED_KEY, JSON.stringify(Array.from(this.dismissedIds)));

    // Tell API (non-blocking for UX)
    try {
      await dismissAnnouncement(id);
    } catch (e) {
      console.warn('[AnnouncementStore] Failed to dismiss remotely', e);
      // Don't roll back; we keep it dismissed locally
    }
  }
}

export const announcementStore = new AnnouncementStore();
