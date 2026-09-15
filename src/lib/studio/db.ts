import { ListeningPass, QuickMarker, SectionAnalysis, Song, SongSection, TimelineEvent, VocabularyItem } from './types';

const NAME = 'earlab-deep-listening-v1';
const STORES = ['songs', 'audio', 'waveforms', 'sections', 'analysis', 'markers', 'events', 'vocabulary', 'passes'] as const;
type Store = typeof STORES[number];

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () => { const db = request.result; STORES.forEach((store) => { if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: store === 'audio' || store === 'waveforms' ? 'songId' : store === 'analysis' ? 'sectionId' : 'id' }); }); };
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
async function put(store: Store, value: unknown): Promise<void> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).put(value); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }
async function all<T>(store: Store): Promise<T[]> { const db = await open(); return new Promise((resolve, reject) => { const req = db.transaction(store, 'readonly').objectStore(store).getAll(); req.onsuccess = () => resolve(req.result as T[]); req.onerror = () => reject(req.error); }); }
async function get<T>(store: Store, id: string): Promise<T | undefined> { const db = await open(); return new Promise((resolve, reject) => { const req = db.transaction(store, 'readonly').objectStore(store).get(id); req.onsuccess = () => resolve(req.result as T | undefined); req.onerror = () => reject(req.error); }); }
async function remove(store: Store, id: string): Promise<void> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).delete(id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }

export const studioDb = {
  async saveSong(song: Song, audio: Blob, peaks: number[]) { await put('songs', song); await put('audio', { songId: song.id, blob: audio }); await put('waveforms', { songId: song.id, peaks }); },
  songs: () => all<Song>('songs'), audio: async (songId: string) => (await get<{ songId: string; blob: Blob }>('audio', songId))?.blob, peaks: async (songId: string) => (await get<{ songId: string; peaks: number[] }>('waveforms', songId))?.peaks ?? [],
  section: (value: SongSection) => put('sections', value), sections: async (songId: string) => (await all<SongSection>('sections')).filter((item) => item.songId === songId), deleteSection: (id: string) => remove('sections', id),
  analysis: (value: SectionAnalysis) => put('analysis', value), analyses: () => all<SectionAnalysis>('analysis'),
  marker: (value: QuickMarker) => put('markers', value), markers: async (songId: string) => (await all<QuickMarker>('markers')).filter((item) => item.songId === songId), deleteMarker: (id: string) => remove('markers', id),
  event: (value: TimelineEvent) => put('events', value), events: async (songId: string) => (await all<TimelineEvent>('events')).filter((item) => item.songId === songId), deleteEvent: (id: string) => remove('events', id),
  vocabulary: (value: VocabularyItem) => put('vocabulary', value), vocabularyItems: async (songId: string) => (await all<VocabularyItem>('vocabulary')).filter((item) => item.songId === songId), deleteVocabulary: (id: string) => remove('vocabulary', id),
  pass: (value: ListeningPass) => put('passes', value), passes: async (songId: string) => (await all<ListeningPass>('passes')).filter((item) => item.songId === songId), deletePass: (id: string) => remove('passes', id),
};
