// @flow

import type Kindness from './Kindness';

// ESLint provides an error for opaque
type SeriesId = string;

export type { SeriesId };

export class Series extends Map<number, Kindness> {
  getOrderKeyByIndex(index: number): number {
    const key = [...this.keys()].sort()[index];
    if (typeof key !== 'number') return -1;
    return key;
  }

  hasKindnessByIndex(index: number): boolean {
    const key = this.getOrderKeyByIndex(index);
    return this.has(key);
  }

  getKindnessByIndex(index: number): Kindness {
    const key = this.getOrderKeyByIndex(index);
    const k = this.get(key);
    if (!k) return null;
    return k;
  }

  getKindnessElementByIndex(index: number): ?HTMLElement {
    const k = this.getKindnessByIndex(index);
    if (!k) return null;
    return k.ref.current;
  }

  /**
   * Returns order key for later use.
   */
  append(k: Kindness): number {
    const lastKey = this.getOrderKeyByIndex(this.size - 1);
    if (lastKey < 0) {
      this.set(0, k);
      return 0;
    }
    const nextKey = lastKey + 1;
    this.set(nextKey, k);
    return nextKey;
  }
}

export class SeriesPool extends Map<SeriesId, Series> {
  getOrCreate(key: SeriesId): Series {
    const existing = this.get(key);
    if (existing) return existing;
    const created = new Series();
    this.set(key, created);
    return created;
  }
}

export const seriesPool = new SeriesPool();
