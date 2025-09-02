import { useState, useEffect, useCallback } from 'react';
import { 
  operatorSystemStatusService, 
  SystemStatusData, 
  SystemHealthSummary 
} from '../services/operatorSystemStatusService';

export interface UseOperatorSystemStatusReturn {
  systemStatus: SystemStatusData | null;
  healthSummary: SystemHealthSummary | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  quickStatus: {
    status: 'ok' | 'warning' | 'critical';
    message: string;
    actionRequired: boolean;
  } | null;
}

export const useOperatorSystemStatus = (
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UseOperatorSystemStatusReturn => {
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [healthSummary, setHealthSummary] = useState<SystemHealthSummary | null>(null);
  const [quickStatus, setQuickStatus] = useState<{
    status: 'ok' | 'warning' | 'critical';
    message: string;
    actionRequired: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStatus = useCallback(async () => {
    try {
      setError(null);
      
      const [status, health, quick] = await Promise.all([
        operatorSystemStatusService.getSystemStatus(),
        operatorSystemStatusService.getSystemHealthSummary(),
        operatorSystemStatusService.getQuickStatus()
      ]);

      setSystemStatus(status);
      setHealthSummary(health);
      setQuickStatus({
        status: quick.status as "critical" | "warning" | "ok",
        message: `${quick.activeCameras} cameras active, ${quick.alerts} alerts`,
        actionRequired: quick.alerts > 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system status';
      setError(errorMessage);
      console.error('Error fetching system status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    await fetchSystemStatus();
  }, [fetchSystemStatus]);

  // Initial load
  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSystemStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSystemStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const unsubscribe = operatorSystemStatusService.subscribeToStatusUpdates((status) => {
      setSystemStatus(status);
      // Also refresh health summary when status updates
      operatorSystemStatusService.getSystemHealthSummary().then(setHealthSummary);
      operatorSystemStatusService.getQuickStatus().then(quick => 
        setQuickStatus({
          status: quick.status as "critical" | "warning" | "ok",
          message: `${quick.activeCameras} cameras active, ${quick.alerts} alerts`,
          actionRequired: quick.alerts > 0
        })
      );
    });

    return unsubscribe;
  }, [autoRefresh]);

  return {
    systemStatus,
    healthSummary,
    quickStatus,
    isLoading,
    error,
    refreshStatus
  };
};