export type NoteCategory = 'garden' | 'science' | 'chronicle';

export interface NoteTopic {
  name: string;
  page: 'left' | 'right';
}

export interface NoteCategoryDefinition {
  slug: NoteCategory;
  title: string;
  subtitle: string;
  topics: readonly NoteTopic[];
}

export const notesCategories: Record<NoteCategory, NoteCategoryDefinition> = {
  garden: {
    slug: 'garden',
    title: 'Garden Book',
    subtitle: 'Plantings, orchard notes, and seasonal work.',
    topics: [
      { name: 'Orchard', page: 'left' },
      { name: 'Vegetable & Kitchen Garden', page: 'left' },
      { name: 'Borders & Flowers', page: 'right' },
      { name: 'Woodland, Pond & Meadow', page: 'right' }
    ]
  },
  science: {
    slug: 'science',
    title: 'Science Field Notes',
    subtitle: 'Meteorology, seismology, and observations.',
    topics: [
      { name: 'Weather & Climate', page: 'left' },
      { name: 'Seismic Observations', page: 'left' },
      { name: 'Plants, Wildlife & Natural History', page: 'right' },
      { name: 'Equipment & Projects', page: 'right' }
    ]
  },
  chronicle: {
    slug: 'chronicle',
    title: 'Chronicle',
    subtitle: 'Projects, happenings, and records kept around Brambley.',
    topics: [
      { name: 'Brambley History', page: 'left' },
      { name: 'Projects & Works', page: 'right' },
      { name: 'Meaningful Days', page: 'right' }
    ]
  }
};
