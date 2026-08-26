const READ_KEY = 'ayinz_read_notifications';
const DELETED_KEY = 'ayinz_deleted_notifications';
const DISMISSED_KEY = 'ayinz_dismissed_notifications';

const getIds = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const addId = (key: string, id: string) => {
  const ids = getIds(key);
  if (!ids.includes(id)) localStorage.setItem(key, JSON.stringify([...ids, id]));
};

export const getReadIds = () => getIds(READ_KEY);
export const markAllRead = (ids: string[]) => {
  const merged = Array.from(new Set([...getReadIds(), ...ids]));
  localStorage.setItem(READ_KEY, JSON.stringify(merged));
  return merged;
};

export const getDeletedIds = () => getIds(DELETED_KEY);
export const deleteNotificationForMe = (id: string) => {
  addId(DELETED_KEY, id);
  addId(DISMISSED_KEY, id); // never auto-popup a deleted notification again
};
