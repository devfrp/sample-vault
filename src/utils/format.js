/**
 * Format file size in human-readable form.
 */
export function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format duration in seconds to mm:ss.ms
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

/**
 * Get file extension from name or path.
 */
export function getFormat(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  return ext || 'unknown';
}

/**
 * Check if browser supports File System Access API.
 */
export function hasFileSystemAccess() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Group samples by a key for organized display.
 */
export function groupBy(arr, keyFn) {
  const groups = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}
