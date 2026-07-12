/**
 * Utility Functions
 *
 * cn() — Merges Tailwind CSS class names with proper conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @module lib/utils
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
