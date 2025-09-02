import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, XCircle, Wifi, WifiOff, Server, Camera, Shield, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { parseAiModelStatus, AiModelUiState } from '../../config/runtime';

interface SystemStatusIndicator {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline';
  icon: React.ReactNode;
  description: string;
  lastUpdate?: string;
}

interface SimpleSystemStatusProps {
  className?: string;
  systemData?: {
    backend?: boolean;
    database?: boolean;
    cameras?: number;
    aiModels?: AiModelUiState;
    network?: boolean;
  };
}

export const SimpleSystemStatus: React.FC<SimpleSystemStatusProps> = ({ 
  className,
  systemData = {}
}) => {
  const {
    backend = true,
    database = true,
    cameras = 4,
    aiModels = 'active',
    network = true
  } = systemData;

  const systemIndicators: SystemStatusIndicator[] = useMemo(() => [
    {
      id: 'backend',
      name: 'System Core',
      status: backend ? 'online' : 'offline',
      icon: <Server className="h-5 w-5" />,
      description: backend ? 'All systems operational' : 'System offline - contact IT support',
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'cameras',
      name: 'Camera System',
      status: cameras >= 3 ? 'online' : cameras >= 1 ? 'warning' : 'offline',
      icon: <Camera className="h-5 w-5" />,
      description: `${cameras}/4 cameras active`,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'ai',
      name: 'AI Detection',
      status: aiModels === 'active' ? 'online' : aiModels === 'error' ? 'offline' : 'warning',
      icon: <Shield className="h-5 w-5" />,
      description: aiModels === 'active' ? 'AI monitoring active' : 
                   aiModels === 'error' ? 'AI system offline' : 'AI system starting',
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'network',
      name: 'Network',
      status: network ? 'online' : 'offline',
      icon: network ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />,
      description: network ? 'Network connection stable' : 'Network connection lost',
      lastUpdate: new Date().toLocaleTimeString()
    }
  ], [backend, cameras, aiModels, network]);

  const overallStatus = useMemo(() => {
    const hasOffline = systemIndicators.some(indicator => indicator.status === 'offline');
    const hasWarning = systemIndicators.some(indicator => indicator.status === 'warning');
    
    if (hasOffline) return 'offline';
    if (hasWarning) return 'warning';
    return 'online';
  }, [systemIndicators]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'SYSTEM OK';
      case 'warning':
        return 'CHECK SYSTEM';
      case 'offline':
        return 'SYSTEM DOWN';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn("bg-gray-900 border-gray-700", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-lg font-bold">SYSTEM STATUS</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(overallStatus)}
              <Badge 
                variant={getStatusColor(overallStatus) as any}
                className={cn(
                  "text-sm font-bold px-3 py-1",
                  overallStatus === 'online' && "bg-green-600 text-white",
                  overallStatus === 'warning' && "bg-yellow-600 text-black",
                  overallStatus === 'offline' && "bg-red-600 text-white"
                )}
              >
                {getStatusText(overallStatus)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {systemIndicators.map((indicator) => (
            <Tooltip key={indicator.id}>
              <TooltipTrigger>
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                  indicator.status === 'online' && "bg-green-900/20 border-green-600/30 hover:bg-green-900/30",
                  indicator.status === 'warning' && "bg-yellow-900/20 border-yellow-600/30 hover:bg-yellow-900/30",
                  indicator.status === 'offline' && "bg-red-900/20 border-red-600/30 hover:bg-red-900/30"
                )}>
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      indicator.status === 'online' && "bg-green-600/20 text-green-400",
                      indicator.status === 'warning' && "bg-yellow-600/20 text-yellow-400",
                      indicator.status === 'offline' && "bg-red-600/20 text-red-400"
                    )}>
                      {indicator.icon}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-base">
                        {indicator.name}
                      </div>
                      <div className={cn(
                        "text-sm",
                        indicator.status === 'online' && "text-green-400",
                        indicator.status === 'warning' && "text-yellow-400",
                        indicator.status === 'offline' && "text-red-400"
                      )}>
                        {indicator.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={getStatusColor(indicator.status) as any}
                      className={cn(
                        "text-xs font-bold",
                        indicator.status === 'online' && "bg-green-600 text-white",
                        indicator.status === 'warning' && "bg-yellow-600 text-black",
                        indicator.status === 'offline' && "bg-red-600 text-white"
                      )}
                    >
                      {indicator.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  <strong>{indicator.name}</strong><br />
                  {indicator.description}<br />
                  <span className="text-xs text-gray-400">
                    Last updated: {indicator.lastUpdate}
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Overall System Health Summary */}
          <div className={cn(
            "mt-4 p-4 rounded-lg border-2 text-center",
            overallStatus === 'online' && "bg-green-900/30 border-green-500",
            overallStatus === 'warning' && "bg-yellow-900/30 border-yellow-500",
            overallStatus === 'offline' && "bg-red-900/30 border-red-500"
          )}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getStatusIcon(overallStatus)}
              <span className={cn(
                "text-xl font-bold",
                overallStatus === 'online' && "text-green-400",
                overallStatus === 'warning' && "text-yellow-400",
                overallStatus === 'offline' && "text-red-400"
              )}>
                {getStatusText(overallStatus)}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {overallStatus === 'online' && "All systems are functioning normally"}
              {overallStatus === 'warning' && "Some systems need attention - monitor closely"}
              {overallStatus === 'offline' && "Critical systems are down - contact support immediately"}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};