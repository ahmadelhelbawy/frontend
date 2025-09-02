# AI Shoplifting Detection System - Frontend

## 🚀 **Advanced Security Dashboard with AI-Powered Monitoring**

A professional-grade, desktop-optimized security dashboard featuring real-time AI detection, live camera feeds, and comprehensive monitoring capabilities.

## ✨ **Key Features**

### **Core Dashboard Components**
- **Live System Monitoring** - Real-time metrics with WebSocket integration
- **Advanced Camera Panels** - Simulated feeds with customization options
- **AI Model Management** - Real-time status and performance monitoring
- **Alert Management System** - Comprehensive incident tracking and resolution
- **System Health Monitoring** - CPU, memory, disk, and network metrics

### **Professional UI/UX**
- **Modern Security Theme** - Dark professional color scheme
- **Responsive Grid Layout** - Adaptive panels for optimal desktop viewing
- **Micro-interactions** - Smooth hover effects and transitions
- **Real-time Updates** - Live data streaming with WebSocket support

### **Advanced Technology Stack**
- **React 18** with TypeScript for type safety
- **Material-UI (MUI)** for professional components
- **WebSocket Integration** for real-time communication
- **Canvas-based Camera Simulation** for realistic feed display
- **Context-based State Management** for efficient data flow

## 🏗️ **Architecture Overview**

```
src/
├── components/
│   ├── dashboard/           # Main dashboard components
│   ├── layout/             # Navigation and grid systems
│   ├── monitoring/         # Real-time monitoring panels
│   ├── cameras/            # Camera management and feeds
│   └── operator/           # Operator-specific interfaces
├── services/               # API and WebSocket services
├── contexts/               # React context providers
├── types/                  # TypeScript interfaces
└── theme/                  # Styling and theming
```

## 🔌 **API Integration**

### **UnifiedAPIService**
Centralized service handling all backend communications with automatic fallback to mock data.

**Endpoints:**
- `GET /api/system/health` - System health metrics
- `GET /api/cameras` - Camera status and configuration
- `GET /api/alerts` - Alert management
- `GET /api/ai-models` - AI model status
- `PUT /api/cameras/{id}/settings` - Camera configuration
- `POST /api/cameras/{id}/restart` - Camera restart
- `POST /api/cameras/{id}/recording` - Toggle recording

### **WebSocket Events**
Real-time updates for:
- `alert_update` - New alerts and status changes
- `camera_status` - Camera online/offline status
- `system_health` - System performance metrics
- `ai_model_status` - AI model health updates

## 🎨 **Design System**

### **Color Palette**
```css
Primary: #0f172a (Deep Blue)
Secondary: #1e293b (Medium Blue)
Accent: #3b82f6 (Bright Blue)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Text: #f8fafc (Off-white)
Text Secondary: #cbd5e1 (Light Gray)
```

### **Typography**
- **Font Family**: Inter, Roboto, Helvetica, Arial
- **Headings**: Bold weights (600-700) with letter spacing optimization
- **Body Text**: Optimized for readability on security displays

### **Component Styling**
- **Glass-morphism Effects** - Semi-transparent panels with backdrop blur
- **Gradient Backgrounds** - Subtle radial gradients for depth
- **Border Accents** - Glowing borders for active states
- **Shadow System** - Layered shadows for visual hierarchy

## 📱 **Responsive Design**

### **Desktop Optimization**
- **Grid Layout**: 12-column system with priority-based visibility
- **Panel Sizing**: Adaptive based on content importance
- **Navigation**: Left sidebar with top navigation bar
- **Multi-panel View**: Simultaneous monitoring of multiple systems

### **Layout Breakpoints**
- **Desktop**: 1200px+ (Full feature set)
- **Large Desktop**: 1600px+ (Enhanced multi-panel layout)
- **Ultra-wide**: 2000px+ (Maximum information density)

## 🔧 **Technical Implementation**

### **State Management**
```typescript
// OperatorContext - Global state for dashboard
interface OperatorState {
  alerts: Alert[];
  cameras: Camera[];
  aiModels: AIModel[];
  systemHealth: SystemHealth;
  isLoading: boolean;
  error: string | null;
}
```

### **Performance Optimizations**
- **React.memo** for expensive components
- **useCallback** and **useMemo** for stable references
- **Canvas-based rendering** for camera feeds
- **WebSocket connection pooling** for real-time updates

### **Error Handling**
- **Graceful degradation** to mock data when APIs unavailable
- **Automatic reconnection** for WebSocket connections
- **User-friendly error messages** with actionable guidance
- **Fallback UI states** for loading and error conditions

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Modern browser with ES6+ support

### **Installation**
```bash
# Clone repository
git clone [repository-url]
cd ai-shoplifting-detection/frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### **Environment Variables**
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## 📊 **Dashboard Components**

### **1. SecurityTopNavigation**
Professional top navigation with:
- System status indicators
- Real-time metrics display
- User management and notifications
- Fullscreen toggle and refresh controls

### **2. AdaptiveGridLayout**
Responsive grid system featuring:
- Priority-based item filtering
- Collapsible and fullscreenable panels
- Drag-and-drop ready interface
- Mobile overflow indicators

### **3. LiveMonitoringDashboard**
Real-time system monitoring with:
- CPU, memory, disk usage metrics
- Network latency and connection status
- AI model performance indicators
- System health scoring

### **4. AdvancedCameraPanels**
Professional camera management including:
- Simulated live feeds with canvas animation
- Recording controls and AI detection toggles
- Customizable settings (brightness, contrast, sensitivity)
- Health monitoring and status indicators

## 🔐 **Security Features**

### **Authentication**
- JWT token-based authentication
- Role-based access control
- Secure API communication
- Session management

### **Data Protection**
- Encrypted WebSocket connections
- Secure API endpoints
- Input validation and sanitization
- XSS protection measures

## 📈 **Performance Metrics**

### **Real-time Capabilities**
- **WebSocket Latency**: <50ms for critical updates
- **UI Responsiveness**: <16ms frame time
- **Data Refresh Rate**: 5-second intervals
- **Memory Usage**: Optimized for long-running sessions

### **Scalability Features**
- **Component Lazy Loading** for large datasets
- **Virtual Scrolling** for extensive lists
- **Efficient Re-rendering** with React optimization
- **Memory Leak Prevention** with proper cleanup

## 🧪 **Testing & Quality**

### **Testing Strategy**
- **Unit Tests**: Component functionality
- **Integration Tests**: API service integration
- **E2E Tests**: User workflow validation
- **Performance Tests**: Load and stress testing

### **Code Quality**
- **TypeScript** for type safety
- **ESLint** for code consistency
- **Prettier** for formatting
- **Husky** for pre-commit hooks

## 🔄 **Development Workflow**

### **Feature Development**
1. **Component Creation** in appropriate directory
2. **TypeScript Interface** definition
3. **Component Implementation** with proper styling
4. **Integration** with existing systems
5. **Testing** and validation
6. **Documentation** update

### **API Integration**
1. **Interface Definition** in types/
2. **Service Implementation** in services/
3. **Context Integration** for state management
4. **Error Handling** and fallback logic
5. **Testing** with mock data

## 📚 **API Reference**

### **System Health**
```typescript
interface SystemHealth {
  cpuUsage: number;           // CPU utilization percentage
  memoryUsage: number;        // Memory usage percentage
  diskUsage: number;          // Disk usage percentage
  networkLatency: number;     // Network latency in ms
  activeConnections: number;  // Active WebSocket connections
  alertsPerMinute: number;    // Alert frequency
  detectionAccuracy: number;  // AI detection accuracy
  systemUptime: number;       // System uptime in milliseconds
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    cameras: 'healthy' | 'warning' | 'critical';
    ai: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    network: 'healthy' | 'warning' | 'critical';
  };
}
```

### **Camera Management**
```typescript
interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  streamUrl: string;
  resolution: string;
  fps: number;
  recording: boolean;
  aiEnabled: boolean;
  healthScore: number;
  settings: {
    brightness: number;
    contrast: number;
    sensitivity: number;
    detectionZones: any[];
  };
}
```

### **Alert System**
```typescript
interface Alert {
  id: string;
  alertType: 'detection' | 'behavioral' | 'system' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  priority: number;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
}
```

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Static Hosting**: Netlify, Vercel, AWS S3
- **Container Deployment**: Docker with nginx
- **CDN Integration**: CloudFlare, AWS CloudFront
- **Load Balancing**: Multiple instance deployment

### **Environment Configuration**
```bash
# Production
REACT_APP_API_URL=https://api.production.com
REACT_APP_WS_URL=wss://ws.production.com

# Staging
REACT_APP_API_URL=https://api.staging.com
REACT_APP_WS_URL=wss://ws.staging.com
```

## 🤝 **Contributing**

### **Development Guidelines**
1. **Code Style**: Follow existing TypeScript patterns
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Utilize React Context for global state
4. **Styling**: Follow Material-UI and custom theme guidelines
5. **Testing**: Include unit tests for new components

### **Pull Request Process**
1. **Feature Branch** creation
2. **Implementation** with tests
3. **Code Review** by team members
4. **Integration Testing** validation
5. **Documentation** updates
6. **Merge** to main branch

## 📞 **Support & Contact**

### **Technical Support**
- **Issues**: GitHub issue tracker
- **Documentation**: Inline code documentation
- **API Reference**: Comprehensive interface definitions
- **Examples**: Component usage examples

### **Team Contact**
- **Lead Developer**: [Contact Information]
- **Security Team**: [Contact Information]
- **Operations**: [Contact Information]

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 **Future Roadmap**

### **Phase 2 Features**
- **Advanced Analytics Dashboard** with machine learning insights
- **Multi-tenant Support** for enterprise deployments
- **Mobile Application** for field operators
- **Integration APIs** for third-party systems

### **Phase 3 Enhancements**
- **AI-powered Predictive Analytics**
- **Advanced Threat Detection** algorithms
- **Real-time Video Processing** capabilities
- **Cloud-based Scalability** features

---
