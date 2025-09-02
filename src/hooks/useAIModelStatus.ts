import { useState, useEffect } from 'react';
import { getRuntimeMode, parseAiModelStatus, AiModelUiState } from '../config/runtime';

export interface AIModelStatusData {
  aiModelStatus: AiModelUiState;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  systemStatus: any;
}

export function useAIModelStatus(): AIModelStatusData {
  const [aiModelStatus, setAIModelStatus] = useState<AiModelUiState>('standby');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        const mode = getRuntimeMode();
        const endpoint = mode === 'mock' 
          ? '/api/mock/system/status'
          : '/api/system/status';
          
        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSystemStatus(data);
        setAIModelStatus(parseAiModelStatus(data));
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Failed to fetch AI model status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AI status');
        setAIModelStatus('error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAIStatus();
    
    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchAIStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    aiModelStatus, 
    loading, 
    error, 
    lastUpdate, 
    systemStatus 
  };
}