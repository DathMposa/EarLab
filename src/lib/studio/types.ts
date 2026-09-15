export type MarkerKind = 'chord' | 'melody' | 'rhythm' | 'vocal' | 'instrument' | 'important' | 'investigate';
export type AnalysisTab = 'overview' | 'instruments' | 'rhythm' | 'bass' | 'harmony' | 'melody' | 'vocals' | 'arrangement' | 'notes' | 'transcription';

export interface Song { id: string; title: string; artist?: string; album?: string; genre?: string; key?: string; tempo?: number; notes?: string; duration: number; mimeType: string; importedAt: string; updatedAt: string; }
export interface SongSection { id: string; songId: string; parentId?: string; name: string; color: string; start: number; end: number; role: string; order: number; }
export interface TimelineEvent { id: string; songId: string; sectionId?: string; time: number; category: 'harmony' | 'bass' | 'melody' | 'arrangement' | 'vocal' | 'rhythm'; label: string; detail?: string; updatedAt?: string; }
export interface QuickMarker { id: string; songId: string; sectionId?: string; time: number; kind: MarkerKind; resolved: boolean; note?: string; updatedAt?: string; }
export interface SectionAnalysis { sectionId: string; values: Record<AnalysisTab, string>; checklist: Record<string, boolean>; updatedAt: string; }
export interface VocabularyItem { id: string; songId: string; sectionId?: string; time: number; title: string; content: string; tags: string[]; createdAt: string; }
export interface ListeningPass { id: string; songId: string; sectionId: string; pass: number; prompt: string; response: string; completedAt: string; updatedAt?: string; }
export interface StudioSong extends Song { sections: SongSection[]; markers: QuickMarker[]; events: TimelineEvent[]; vocabulary: VocabularyItem[]; }
export const ANALYSIS_TABS: { id: AnalysisTab; label: string }[] = [
  { id: 'overview', label: 'Overview' }, { id: 'instruments', label: 'Instruments' }, { id: 'rhythm', label: 'Rhythm' }, { id: 'bass', label: 'Bass' }, { id: 'harmony', label: 'Harmony' }, { id: 'melody', label: 'Melody' }, { id: 'vocals', label: 'Vocals' }, { id: 'arrangement', label: 'Arrangement' }, { id: 'notes', label: 'Notes' }, { id: 'transcription', label: 'Transcription' },
];
export const LISTENING_PASSES = ['Whole picture', 'Time & groove', 'Bass', 'Harmony', 'Melody', 'Instruments', 'Vocals', 'Integration'];
