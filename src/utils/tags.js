const TAG_COLORS = {
  Kick: '#ef4444',
  Snare: '#f97316',
  'Hi-Hat': '#eab308',
  Bass: '#22c55e',
  Synth: '#06b6d4',
  Pad: '#8b5cf6',
  Guitar: '#a855f7',
  Piano: '#ec4899',
  Vocals: '#f43f5e',
  FX: '#6366f1',
  Percussion: '#d946ef',
  'Drum Loop': '#14b8a6',
  'Hip-Hop': '#f97316',
  Trap: '#ef4444',
  House: '#eab308',
  Techno: '#64748b',
  DnB: '#3b82f6',
  Dubstep: '#8b5cf6',
  'Lo-Fi': '#a3e635',
  Ambient: '#06b6d4',
  Pop: '#ec4899',
  Rock: '#dc2626',
  Jazz: '#d4a574',
  Funk: '#f59e0b',
  Dark: '#6b21a8',
  Bright: '#fbbf24',
  Aggressive: '#dc2626',
  Chill: '#34d399',
  Energetic: '#f97316',
  Melancholic: '#6366f1',
  Uplifting: '#facc15',
  Tense: '#ef4444',
  'One-Shot': '#3b82f6',
  Loop: '#22c55e',
  Stem: '#a855f7',
  Break: '#f97316',
  Fill: '#eab308',
  Riser: '#06b6d4',
  Impact: '#ef4444',
  Texture: '#8b5cf6',
};

export function getTagColor(tag) {
  const base = tag.split(':').pop();
  return TAG_COLORS[base] || '#64748b';
}

export function parseTagKey(key) {
  const idx = key.indexOf(':');
  if (idx === -1) return { category: 'Custom', value: key };
  return { category: key.slice(0, idx), value: key.slice(idx + 1) };
}

export function tagKey(category, value) {
  return `${category}:${value}`;
}

export function getAllTagKeys(tags) {
  const keys = [];
  for (const group of tags) {
    for (const value of group.values) {
      keys.push(`${group.category}:${value}`);
    }
  }
  return keys;
}
