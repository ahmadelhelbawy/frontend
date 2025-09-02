// Centralized runtime and environment helpers for the Operator and other dashboards

export type RuntimeMode = 'auto' | 'mock' | 'live';
export type AiModelUiState = 'active' | 'standby' | 'error';

// Selects the runtime mode based on optional explicit mode and environment flags
// Priority: explicit -> REACT_APP_FORCE_MOCKS -> default 'auto'
export function getRuntimeMode(explicit?: RuntimeMode): RuntimeMode {
  if (explicit) return explicit;
  if (process.env.REACT_APP_FORCE_MOCKS === 'true') return 'mock';
  return 'auto';
}

// Returns the preferred WebSocket path for the mode
export function getWsPathForMode(mode: RuntimeMode): string {
  switch (mode) {
    case 'mock':
      return '/ws/mock-events';
    case 'live':
      return '/ws/alerts';
    case 'auto':
    default:
      return '/ws/alerts';
  }
}

// Best-effort parser to derive AI model UI state from a backend system status payload
// Accepts any shape and attempts to find AI-related service statuses.
export function parseAiModelStatus(systemStatus: any): AiModelUiState {
  if (!systemStatus) return 'standby';

  // Mock system status pattern: { running: boolean }
  if (typeof systemStatus.running === 'boolean') {
    return systemStatus.running ? 'active' : 'standby';
  }

  const services = systemStatus.services || systemStatus.ai || {};
  const keys = [
    'ai',
    'ai_models',
    'models',
    'yolo',
    'yolo11',
    'yolov8', // Legacy support
    'detection_model',
    'behavior',
    'behavior_model',
    'behavioral_model',
    'lstm_model',
    'face_recognition',
    'cognitive_agent',
    'autonomous_engine',
    'gpu_detector',
    'optimized_ai_detector'
  ];

  const values: string[] = [];
  for (const k of keys) {
    if (services && typeof services[k] === 'string') values.push(String(services[k]).toLowerCase());
  }

  // If nothing was found, try the top-level status
  if (values.length === 0 && typeof systemStatus.status === 'string') {
    const s = String(systemStatus.status).toLowerCase();
    if (s.includes('healthy') || s.includes('ok')) return 'active';
    if (s.includes('degraded') || s.includes('warn')) return 'standby';
    if (s.includes('error') || s.includes('down') || s.includes('offline')) return 'error';
  }

  // Aggregate statuses to a single UI state
  const hasError = values.some(v => v.includes('error') || v.includes('down') || v.includes('offline') || v.includes('fail'));
  if (hasError) return 'error';

  const hasDegraded = values.some(v => v.includes('degraded') || v.includes('warn') || v.includes('standby'));
  if (hasDegraded) return 'standby';

  const hasHealthy = values.some(v => v.includes('healthy') || v.includes('ok') || v.includes('up'));
  if (hasHealthy) return 'active';

  // Default if unknown
  return 'standby';
}

