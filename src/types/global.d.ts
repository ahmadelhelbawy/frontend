/**
 * Global TypeScript declarations
 * Extends native types to support our API response patterns
 */

import { APIResponse, HTTPResponse } from './api';

// Extend the global Response interface to include data property
declare global {
  interface Response {
    data?: any;
  }
  
  // Axios-like response interface for compatibility
  interface AxiosLikeResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  }
}

// Module augmentation for fetch to return HTTPResponse-like structure
declare module 'node-fetch' {
  interface Response {
    data: any;
  }
}

export {};
