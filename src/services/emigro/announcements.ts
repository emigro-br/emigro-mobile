// src/services/emigro/announcements.ts
import { api } from './api';
import { AnnouncementDTO } from './types';

function normalize(a: any): AnnouncementDTO {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? null,
    imageUrl: a.imageUrl ?? a.image_url ?? null,
    deepLinkUrl: a.deepLinkUrl ?? a.deep_link_url ?? null,
    startsAt: a.startsAt ?? a.starts_at ?? null,
    endsAt: a.endsAt ?? a.ends_at ?? null,
    priority: a.priority ?? null,
    dismissed: a.dismissed ?? null,
  };
}

// Tiny helper to wait until we actually have a token (preload races)
async function waitForToken(maxMs = 3000): Promise<string | null> {
  const { sessionStore } = require('@/stores/SessionStore');
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const t = sessionStore?.accessToken;
    if (t) return t;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

export async function fetchAnnouncements(): Promise<AnnouncementDTO[]> {
  const { sessionStore } = require('@/stores/SessionStore');
  const client = api();

  // Logs that tell us EXACTLY what's happening
  console.log('[announcements][FE] baseURL =', client.defaults.baseURL);
  console.log(
    '[announcements][FE] sessionStore.loaded =',
    !!sessionStore?.isLoaded,
    '| tokenLen =',
    sessionStore?.accessToken ? sessionStore.accessToken.length : 0
  );

  // Ensure we really have a token before calling (handles preload races)
  let token: string | null = sessionStore?.accessToken ?? null;
  if (!token) {
    console.log('[announcements][FE] no token yet — waiting up to 3s…');
    token = await waitForToken(3000);
  }
  console.log('[announcements][FE] using tokenLen =', token ? token.length : 0);

  try {
    console.log('[announcements][FE] GET /announcements (with explicit Authorization)');
    const res = await client.get('/announcements', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    console.log('[announcements][FE] status', res.status, '| type =', typeof res.data);
    if (!Array.isArray(res.data)) {
      console.log('[announcements][FE] response was not array ->', res.data);
      return [];
    }

    const out = res.data.map(normalize);
    console.log('[announcements][FE] items =', out.length);
    return out;
  } catch (err: any) {
    const s = err?.response?.status;
    const body =
      typeof err?.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err?.response?.data);
    console.warn('[announcements][FE] ERROR status =', s, '| body =', body);
    throw err; // bubble up so the store can log too
  }
}

export async function dismissAnnouncement(announcementId: string): Promise<void> {
  const { sessionStore } = require('@/stores/SessionStore');
  const client = api();
  const token = sessionStore?.accessToken ?? null;

  console.log('[announcements][FE] POST /announcements/:id/dismiss', announcementId, '| tokenLen =', token ? token.length : 0);

  try {
    const res = await client.post(
      `/announcements/${announcementId}/dismiss`,
      null,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    console.log('[announcements][FE] dismiss status', res.status);
  } catch (err: any) {
    const s = err?.response?.status;
    const body =
      typeof err?.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err?.response?.data);
    console.warn('[announcements][FE] dismiss ERROR status =', s, '| body =', body);
    throw err;
  }
}
