/**
 * Type Guard Utilities
 * Provides type-safe predicates for array operations and data validation
 */

import type { Camera, Alert, Detection, Operator } from '../types';

/**
 * Generic type guard for non-null/undefined values
 */
export const isDefined = <T>(x: T | undefined | null): x is T => x != null;

/**
 * Type guard for non-empty strings
 */
export const isNonEmptyString = (x: unknown): x is string => 
  typeof x === 'string' && x.length > 0;

/**
 * Type guard for valid numbers
 */
export const isValidNumber = (x: unknown): x is number => 
  typeof x === 'number' && !isNaN(x) && isFinite(x);

/**
 * Camera-specific type guards
 */
export const isOnlineCamera = (camera: Camera): camera is Camera & { status: 'online' } =>
  camera.status === 'online';

export const isOfflineCamera = (camera: Camera): camera is Camera & { status: 'offline' } =>
  camera.status === 'offline';

export const isRecordingCamera = (camera: Camera): boolean =>
  camera.recording === true;

/**
 * Alert-specific type guards
 */
export const isUnacknowledgedAlert = (alert: Alert): boolean =>
  !alert.acknowledged;

export const isCriticalAlert = (alert: Alert): alert is Alert & { severity: 'critical' } =>
  alert.severity === 'critical';

export const isHighPriorityAlert = (alert: Alert): boolean =>
  alert.severity === 'critical' || alert.severity === 'high';

export const isRecentAlert = (alert: Alert, hoursAgo = 24): boolean => {
  const alertTime = typeof alert.timestamp === 'string' 
    ? new Date(alert.timestamp) 
    : alert.timestamp;
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return alertTime >= cutoff;
};

/**
 * Detection-specific type guards
 */
export const isHighConfidenceDetection = (detection: Detection, threshold = 0.8): boolean =>
  detection.confidence >= threshold;

export const isRecentDetection = (detection: Detection, minutesAgo = 60): boolean => {
  const detectionTime = typeof detection.timestamp === 'string'
    ? new Date(detection.timestamp)
    : detection.timestamp;
  const cutoff = new Date(Date.now() - minutesAgo * 60 * 1000);
  return detectionTime >= cutoff;
};

/**
 * Operator-specific type guards
 */
export const isOnlineOperator = (operator: Operator): boolean =>
  operator.status === 'online';

export const isAdminOperator = (operator: Operator): boolean =>
  operator.role === 'admin' || operator.role === 'administrator';

/**
 * Array validation helpers
 */
export const isNonEmptyArray = <T>(arr: T[]): arr is [T, ...T[]] =>
  Array.isArray(arr) && arr.length > 0;

export const hasMinLength = <T>(arr: T[], minLength: number): boolean =>
  Array.isArray(arr) && arr.length >= minLength;

/**
 * Safe array operations with type narrowing
 */
export const safeFilter = <T, U extends T>(
  array: T[], 
  predicate: (item: T) => item is U
): U[] => {
  if (!Array.isArray(array)) return [];
  return array.filter(predicate);
};

export const safeFind = <T>(
  array: T[], 
  predicate: (item: T) => boolean
): T | undefined => {
  if (!Array.isArray(array)) return undefined;
  return array.find(predicate);
};

export const safeMap = <T, U>(
  array: T[], 
  mapper: (item: T, index: number) => U
): U[] => {
  if (!Array.isArray(array)) return [];
  return array.map(mapper);
};

/**
 * Data validation utilities
 */
export const isValidId = (id: unknown): id is string =>
  isNonEmptyString(id) && id.trim().length > 0;

export const isValidTimestamp = (timestamp: unknown): timestamp is string | Date => {
  if (timestamp instanceof Date) return !isNaN(timestamp.getTime());
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }
  return false;
};

export const isValidConfidence = (confidence: unknown): confidence is number =>
  isValidNumber(confidence) && confidence >= 0 && confidence <= 1;

/**
 * Object property validation
 */
export const hasProperty = <T extends Record<string, any>, K extends keyof T>(
  obj: T, 
  key: K
): obj is T & Required<Pick<T, K>> => {
  return obj != null && typeof obj === 'object' && key in obj && obj[key] != null;
};

export const hasAllProperties = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): obj is T & Record<K, NonNullable<T[K]>> => {
  return keys.every(key => hasProperty(obj, key));
};
