import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Face as FaceIcon,
  Psychology as AIIcon,
  Fingerprint as BiometricIcon,
  Shield as ThreatIcon,
  Speed as ConfidenceIcon
} from '@mui/icons-material';

interface PersonTracking {
  trackId: string;
  customerNumber: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeIn: Date;
  timeOut?: Date;
  currentLocation: string;
  behaviorIndicators: string[];
  faceImageUrl?: string;
  isShoplifter?: boolean;
  shoplifterData?: {
    section: string;
    stolenTime: Date;
    previousOffenses: number;
  };
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Enhanced AI Detection Data
  aiDetection: {
    confidence: number; // 0-1 AI detection confidence
    modelVersion: string; // AI model used (YOLO11, etc.)
    detectionTime: Date; // When person was first detected
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    behaviorAnalysis: {
      suspicious: boolean;
      loitering: boolean;
      concealment: boolean;
      aggressive: boolean;
      confidence: number;
    };
    autonomousDecision?: {
      action: 'monitor' | 'alert' | 'escalate' | 'evidence_collect';
      confidence: number;
      reasoning: string[];
      timestamp: Date;
    };
  };
  // Facial Recognition Data
  facialRecognition?: {
    isMatched: boolean;
    confidence: number; // 0-1 facial recognition confidence
    identityId?: string;
    knownPerson?: {
      name: string;
      category: 'vip' | 'employee' | 'banned' | 'shoplifter' | 'unknown';
      lastSeen?: Date;
      notes?: string;
      riskScore: number; // 0-1 historical risk score
    };
    biometricData: {
      faceEmbedding: number[]; // Face vector (simplified)
      qualityScore: number; // Face image quality 0-1
      landmarks: number; // Number of facial landmarks detected
      faceSize: { width: number; height: number }; // Face dimensions in pixels
    };
    matchHistory?: {
      previousVisits: number;
      averageTimeSpent: number; // in minutes
      lastIncident?: Date;
      behaviorPattern: 'normal' | 'suspicious' | 'problematic';
    };
  };
}

interface CameraFeedData {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  isConnected: boolean;
  streamUrl?: string;
  fps: number;
  resolution: string;
  personTracking: PersonTracking[];
}

interface EnhancedCameraFeedProps {
  camera: CameraFeedData;
  width?: number;
  height?: number;
  showPersonOverlays?: boolean;
  onPersonClick?: (person: PersonTracking) => void;
  onCameraClick?: (cameraId: string) => void;
}

const EnhancedCameraFeed: React.FC<EnhancedCameraFeedProps> = ({
  camera,
  width = 400,
  height = 300,
  showPersonOverlays = true,
  onPersonClick,
  onCameraClick
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for accurate time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Professional security color scheme
  const colors = {
    primary: '#1e3a8a',
    secondary: '#1e40af',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#475569'
  };

  // Get risk level color (Green/Yellow/Red system)
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#ff0000'; // RED
      case 'high': return '#ff0000';     // RED
      case 'medium': return '#ffaa00';   // YELLOW
      case 'low': return '#00ff00';      // GREEN
      default: return '#ffaa00';         // YELLOW
    }
  };

  // Get risk level icon
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '🔴';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  // Get AI threat level color
  const getThreatLevelColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#ffdd00';
      case 'none': return '#00ff00';
      default: return '#888888';
    }
  };

  // Get facial recognition status color
  const getFacialRecognitionColor = (facialRecognition?: PersonTracking['facialRecognition']) => {
    if (!facialRecognition) return '#888888';
    if (!facialRecognition.isMatched) return '#666666';
    
    switch (facialRecognition.knownPerson?.category) {
      case 'shoplifter': return '#ff0000';
      case 'banned': return '#ff4444';
      case 'vip': return '#00ff00';
      case 'employee': return '#0088ff';
      default: return '#ffaa00';
    }
  };

  // Get confidence level description
  const getConfidenceLevel = (confidence: number): { level: string; color: string } => {
    if (confidence >= 0.9) return { level: 'VERY HIGH', color: '#00ff00' };
    if (confidence >= 0.8) return { level: 'HIGH', color: '#88ff00' };
    if (confidence >= 0.7) return { level: 'MEDIUM', color: '#ffaa00' };
    if (confidence >= 0.6) return { level: 'LOW', color: '#ff8800' };
    return { level: 'VERY LOW', color: '#ff0000' };
  };

  // Get autonomous action color and icon
  const getAutonomousActionDisplay = (action: string): { icon: string; color: string; label: string } => {
    switch (action) {
      case 'evidence_collect':
        return { icon: '🎥', color: '#ff0000', label: 'EVIDENCE' };
      case 'alert':
        return { icon: '🚨', color: '#ff4444', label: 'ALERT' };
      case 'escalate':
        return { icon: '⚠️', color: '#ffaa00', label: 'ESCALATE' };
      case 'monitor':
        return { icon: '👁️', color: '#00ff00', label: 'MONITOR' };
      default:
        return { icon: '📊', color: '#888888', label: 'ANALYZE' };
    }
  };

  // Get facial recognition category display
  const getFacialRecognitionDisplay = (category?: string): { icon: string; color: string; label: string } => {
    switch (category) {
      case 'shoplifter':
        return { icon: '🚫', color: '#ff0000', label: 'SHOPLIFTER' };
      case 'banned':
        return { icon: '⛔', color: '#ff4444', label: 'BANNED' };
      case 'vip':
        return { icon: '⭐', color: '#00ff00', label: 'VIP' };
      case 'employee':
        return { icon: '👤', color: '#0088ff', label: 'EMPLOYEE' };
      default:
        return { icon: '❓', color: '#ffaa00', label: 'UNKNOWN' };
    }
  };

  // Calculate time spent in store
  const getTimeSpent = (timeIn: Date, timeOut?: Date) => {
    const endTime = timeOut || currentTime;
    const diffMs = endTime.getTime() - timeIn.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  // Get status color for camera
  const getStatusColor = () => {
    if (!camera.isConnected) return colors.danger;
    if (!camera.isActive) return colors.warning;
    return colors.success;
  };

  // Get highest risk level from all tracked persons
  const getOverallRiskLevel = () => {
    if (camera.personTracking.length === 0) return 'low';
    
    const riskLevels = camera.personTracking.map(p => p.riskLevel);
    if (riskLevels.includes('critical')) return 'critical';
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  };

  const overallRisk = getOverallRiskLevel();
  const overallRiskColor = getRiskColor(overallRisk);
  const statusColor = getStatusColor();

  return (
    <Paper
      elevation={4}
      onClick={() => onCameraClick?.(camera.id)}
      sx={{
        width,
        height,
        position: 'relative',
        backgroundColor: colors.background,
        border: `3px solid ${camera.isActive ? overallRiskColor : alpha(colors.border, 0.5)}`,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `3px solid ${colors.accent}`,
          boxShadow: `0 0 25px ${alpha(colors.accent, 0.3)}`
        },
        // Add CSS animations for enhanced AI overlays
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1 }
        },
        '@keyframes glow': {
          '0%': { boxShadow: `0 0 5px ${overallRiskColor}` },
          '50%': { boxShadow: `0 0 20px ${overallRiskColor}` },
          '100%': { boxShadow: `0 0 5px ${overallRiskColor}` }
        },
        '@keyframes slideIn': {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      }}
    >
      {/* Camera Header with Status */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(90deg, ${alpha(colors.surface, 0.95)}, ${alpha(colors.surface, 0.9)})`,
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          zIndex: 20,
          borderBottom: `1px solid ${alpha(colors.border, 0.3)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              color: colors.text,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}
          >
            📹 {camera.name}
          </Typography>
          
          <Chip
            label={camera.location}
            size="small"
            sx={{
              height: 18,
              fontSize: '8px',
              backgroundColor: alpha(colors.accent, 0.2),
              color: colors.accent,
              fontFamily: 'monospace'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Person Count */}
          <Badge
            badgeContent={camera.personTracking.length}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: overallRiskColor,
                color: '#ffffff',
                fontSize: '8px',
                fontWeight: 700
              }
            }}
          >
            <PersonIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
          </Badge>

          {/* Connection Status */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
              animation: camera.isConnected ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          />
        </Box>
      </Box>

      {/* Camera Feed Area */}
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          bottom: 40,
          backgroundColor: colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Mock Video Feed Background */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at 30% 30%, ${alpha('#333333', 0.8)} 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, ${alpha('#444444', 0.6)} 0%, transparent 50%),
              linear-gradient(45deg, ${colors.background} 0%, #1a1a2e 100%)
            `,
            position: 'relative'
          }}
        >
          {/* Camera Feed Placeholder */}
          {!camera.isConnected ? (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}
            >
              <ErrorIcon sx={{ fontSize: 32, color: colors.danger, mb: 1 }} />
              <Typography
                sx={{
                  color: colors.danger,
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
              >
                CONNECTION LOST
              </Typography>
            </Box>
          ) : !camera.isActive ? (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}
            >
              <WarningIcon sx={{ fontSize: 32, color: colors.warning, mb: 1 }} />
              <Typography
                sx={{
                  color: colors.warning,
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
              >
                CAMERA INACTIVE
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                opacity: 0.3
              }}
            >
              <Typography
                sx={{
                  color: colors.textSecondary,
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }}
              >
                LIVE FEED
              </Typography>
            </Box>
          )}

          {/* Person Tracking Overlays */}
          {showPersonOverlays && camera.isActive && camera.isConnected && (
            <>
              {camera.personTracking.map((person, index) => {
                const riskColor = getRiskColor(person.riskLevel);
                const timeSpent = getTimeSpent(person.timeIn, person.timeOut);
                
                return (
                  <Box
                    key={person.trackId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPersonClick?.(person);
                    }}
                    sx={{
                      position: 'absolute',
                      left: `${person.boundingBox.x}%`,
                      top: `${person.boundingBox.y}%`,
                      width: `${person.boundingBox.width}%`,
                      height: `${person.boundingBox.height}%`,
                      border: `2px solid ${riskColor}`,
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        border: `3px solid ${riskColor}`,
                        boxShadow: `0 0 15px ${alpha(riskColor, 0.6)}`
                      }
                    }}
                  >
                    {/* Enhanced Person Info Overlay with AI Data */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -55,
                        left: 0,
                        minWidth: 160,
                        background: `linear-gradient(90deg, ${alpha(riskColor, 0.95)}, ${alpha(riskColor, 0.85)})`,
                        backdropFilter: 'blur(15px)',
                        border: `2px solid ${riskColor}`,
                        borderRadius: 2,
                        p: 0.8,
                        boxShadow: `0 0 15px ${alpha(riskColor, 0.4)}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                        {/* Person Avatar/Face with AI Enhancement */}
                        <Box sx={{ position: 'relative' }}>
                          {person.faceImageUrl ? (
                            <Avatar
                              src={person.faceImageUrl}
                              sx={{
                                width: 24,
                                height: 24,
                                border: `2px solid ${person.facialRecognition?.isMatched ? '#00ff00' : '#ffffff'}`
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: riskColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                border: '2px solid #ffffff'
                              }}
                            >
                              {getRiskIcon(person.riskLevel)}
                            </Box>
                          )}
                          
                          {/* Facial Recognition Indicator */}
                          {person.facialRecognition?.isMatched && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getFacialRecognitionColor(person.facialRecognition),
                                border: '1px solid #ffffff',
                                animation: 'pulse 1.5s ease-in-out infinite'
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              lineHeight: 1,
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            #{person.customerNumber} • {person.trackId}
                          </Typography>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '7px',
                              fontFamily: 'monospace',
                              lineHeight: 1,
                              opacity: 0.9
                            }}
                          >
                            ⏱️ {timeSpent} • 🎯 {(person.aiDetection.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* AI Detection Status */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <AIIcon sx={{ fontSize: 10, color: '#ffffff' }} />
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '7px',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {person.aiDetection.modelVersion} • {getThreatLevelColor(person.aiDetection.threatLevel)}
                        </Typography>
                        
                        {/* Autonomous Decision Indicator */}
                        {person.aiDetection.autonomousDecision && (
                          <Box
                            sx={{
                              ml: 'auto',
                              px: 0.5,
                              py: 0.2,
                              backgroundColor: alpha(getAutonomousActionDisplay(person.aiDetection.autonomousDecision.action).color, 0.8),
                              borderRadius: 0.5,
                              border: `1px solid ${getAutonomousActionDisplay(person.aiDetection.autonomousDecision.action).color}`
                            }}
                          >
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontSize: '6px',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {getAutonomousActionDisplay(person.aiDetection.autonomousDecision.action).icon} {getAutonomousActionDisplay(person.aiDetection.autonomousDecision.action).label}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Facial Recognition Status */}
                      {person.facialRecognition && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FaceIcon sx={{ fontSize: 10, color: '#ffffff' }} />
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '7px',
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {person.facialRecognition.isMatched ? 
                              `✅ ${(person.facialRecognition.confidence * 100).toFixed(0)}% • ${person.facialRecognition.knownPerson?.category?.toUpperCase()}` :
                              `❌ No Match • Q:${(person.facialRecognition.biometricData.qualityScore * 100).toFixed(0)}%`
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Enhanced Shoplifter Alert Overlay with AI Data */}
                    {person.isShoplifter && person.shoplifterData && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -65,
                          left: 0,
                          minWidth: 180,
                          background: `linear-gradient(135deg, ${alpha('#ff0000', 0.98)}, ${alpha('#cc0000', 0.95)})`,
                          backdropFilter: 'blur(15px)',
                          border: '3px solid #ff0000',
                          borderRadius: 2,
                          p: 0.8,
                          animation: 'pulse 1.2s ease-in-out infinite',
                          boxShadow: '0 0 25px rgba(255, 0, 0, 0.6)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.6 }}>
                          <SecurityIcon sx={{ fontSize: 14, color: '#ffffff' }} />
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              letterSpacing: '1px',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                            }}
                          >
                            🚨 CRITICAL THREAT DETECTED
                          </Typography>
                        </Box>
                        
                        {/* AI Analysis Data */}
                        <Box sx={{ mb: 0.5 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '7px',
                              fontFamily: 'monospace',
                              lineHeight: 1.3,
                              fontWeight: 600
                            }}
                          >
                            🤖 AI: {(person.aiDetection.confidence * 100).toFixed(1)}% • {person.aiDetection.modelVersion}
                            <br />
                            👤 Face: {person.facialRecognition ? `${(person.facialRecognition.confidence * 100).toFixed(1)}% Match` : 'No Match'}
                            <br />
                            🎯 Action: {person.aiDetection.autonomousDecision?.action.toUpperCase()} • {person.aiDetection.autonomousDecision?.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>

                        {/* Incident Details */}
                        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '7px',
                              fontFamily: 'monospace',
                              lineHeight: 1.3
                            }}
                          >
                            📍 Location: {person.shoplifterData.section}
                            <br />
                            🕐 Incident: {person.shoplifterData.stolenTime.toLocaleTimeString()}
                            <br />
                            📊 History: {person.shoplifterData.previousOffenses} previous offense{person.shoplifterData.previousOffenses !== 1 ? 's' : ''}
                            {person.facialRecognition?.knownPerson?.name && (
                              <>
                                <br />
                                🆔 ID: {person.facialRecognition.knownPerson.name}
                              </>
                            )}
                          </Typography>
                        </Box>

                        {/* Behavior Analysis */}
                        {person.aiDetection.behaviorAnalysis && (
                          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontSize: '6px',
                                fontFamily: 'monospace',
                                lineHeight: 1.2,
                                opacity: 0.9
                              }}
                            >
                              🧠 Behavior: 
                              {person.aiDetection.behaviorAnalysis.suspicious && ' SUSPICIOUS'}
                              {person.aiDetection.behaviorAnalysis.concealment && ' CONCEALMENT'}
                              {person.aiDetection.behaviorAnalysis.loitering && ' LOITERING'}
                              {person.aiDetection.behaviorAnalysis.aggressive && ' AGGRESSIVE'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Enhanced AI Behavior Analysis Indicators */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.3,
                        alignItems: 'flex-end'
                      }}
                    >
                      {/* AI Confidence Indicator */}
                      <Box
                        sx={{
                          px: 0.5,
                          py: 0.2,
                          backgroundColor: alpha(getConfidenceLevel(person.aiDetection.confidence).color, 0.9),
                          border: `1px solid ${getConfidenceLevel(person.aiDetection.confidence).color}`,
                          borderRadius: 0.5,
                          backdropFilter: 'blur(5px)'
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontSize: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          🎯 {(person.aiDetection.confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>

                      {/* Behavior Analysis Indicators */}
                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        {person.aiDetection.behaviorAnalysis.suspicious && (
                          <Tooltip title={`Suspicious Behavior (${(person.aiDetection.behaviorAnalysis.confidence * 100).toFixed(0)}%)`}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: '#ff4444',
                                border: '1px solid #ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '6px',
                                animation: 'pulse 2s ease-in-out infinite'
                              }}
                            >
                              ⚠️
                            </Box>
                          </Tooltip>
                        )}
                        
                        {person.aiDetection.behaviorAnalysis.concealment && (
                          <Tooltip title="Concealment Detected">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: '#ff0000',
                                border: '1px solid #ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '6px',
                                animation: 'pulse 1.5s ease-in-out infinite'
                              }}
                            >
                              🫥
                            </Box>
                          </Tooltip>
                        )}
                        
                        {person.aiDetection.behaviorAnalysis.loitering && (
                          <Tooltip title="Loitering Detected">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: '#ffaa00',
                                border: '1px solid #ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '6px'
                              }}
                            >
                              ⏰
                            </Box>
                          </Tooltip>
                        )}
                        
                        {person.aiDetection.behaviorAnalysis.aggressive && (
                          <Tooltip title="Aggressive Behavior">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: '#ff0000',
                                border: '1px solid #ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '6px',
                                animation: 'pulse 1s ease-in-out infinite'
                              }}
                            >
                              💢
                            </Box>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Facial Recognition Status */}
                      {person.facialRecognition?.isMatched && (
                        <Box
                          sx={{
                            px: 0.5,
                            py: 0.2,
                            backgroundColor: alpha(getFacialRecognitionColor(person.facialRecognition), 0.9),
                            border: `1px solid ${getFacialRecognitionColor(person.facialRecognition)}`,
                            borderRadius: 0.5,
                            backdropFilter: 'blur(5px)'
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '6px',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {getFacialRecognitionDisplay(person.facialRecognition.knownPerson?.category).icon} {getFacialRecognitionDisplay(person.facialRecognition.knownPerson?.category).label}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      </Box>

      {/* Camera Footer with Technical Info */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(90deg, ${alpha(colors.surface, 0.95)}, ${alpha(colors.surface, 0.9)})`,
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          zIndex: 20,
          borderTop: `1px solid ${alpha(colors.border, 0.3)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              color: colors.textSecondary,
              fontSize: '8px',
              fontFamily: 'monospace'
            }}
          >
            {camera.resolution} • {camera.fps}fps
          </Typography>
          
          {camera.personTracking.length > 0 && (
            <>
              <Typography
                sx={{
                  color: overallRiskColor,
                  fontSize: '8px',
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}
              >
                👥 {camera.personTracking.length} TRACKED
              </Typography>
              
              {/* AI Model Status */}
              <Typography
                sx={{
                  color: colors.accent,
                  fontSize: '7px',
                  fontFamily: 'monospace',
                  opacity: 0.8
                }}
              >
                🤖 {camera.personTracking[0]?.aiDetection.modelVersion || 'YOLO11'}
              </Typography>
              
              {/* Facial Recognition Count */}
              {(() => {
                const faceMatches = camera.personTracking.filter(p => p.facialRecognition?.isMatched).length;
                return faceMatches > 0 ? (
                  <Typography
                    sx={{
                      color: '#00ff88',
                      fontSize: '7px',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}
                  >
                    👤 {faceMatches} ID{faceMatches !== 1 ? 'S' : ''}
                  </Typography>
                ) : null;
              })()}
              
              {/* Autonomous Actions Count */}
              {(() => {
                const activeActions = camera.personTracking.filter(p => 
                  p.aiDetection.autonomousDecision && 
                  ['alert', 'escalate', 'evidence_collect'].includes(p.aiDetection.autonomousDecision.action)
                ).length;
                return activeActions > 0 ? (
                  <Typography
                    sx={{
                      color: '#ff8800',
                      fontSize: '7px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  >
                    🚨 {activeActions} ACTION{activeActions !== 1 ? 'S' : ''}
                  </Typography>
                ) : null;
              })()}
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Overall Risk Indicator */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              backgroundColor: alpha(overallRiskColor, 0.2),
              border: `1px solid ${overallRiskColor}`,
              borderRadius: 1
            }}
          >
            <Typography
              sx={{
                color: overallRiskColor,
                fontSize: '8px',
                fontWeight: 700,
                fontFamily: 'monospace'
              }}
            >
              {getRiskIcon(overallRisk)} {overallRisk.toUpperCase()}
            </Typography>
          </Box>

          {/* Time Display */}
          <Typography
            sx={{
              color: colors.textSecondary,
              fontSize: '8px',
              fontFamily: 'monospace'
            }}
          >
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default EnhancedCameraFeed;