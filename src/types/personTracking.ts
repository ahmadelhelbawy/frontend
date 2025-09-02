// Person Tracking Types for Real-time Dashboard

export interface Person {
  id: string;
  trackId: string;
  customerNumber?: string;
  
  // Identity Information
  faceEmbedding?: number[];
  knownIdentity?: KnownIdentity;
  isKnownShoplifter: boolean;
  isVIP: boolean;
  
  // Location and Movement
  currentLocation: Location;
  locationHistory: LocationHistory[];
  entryTime: Date;
  exitTime?: Date;
  timeInStore: number; // seconds
  
  // Behavior Analysis
  behaviorAnalysis: BehaviorAnalysis;
  riskLevel: RiskLevel;
  suspiciousActivities: SuspiciousActivity[];
  
  // Visual Information
  lastSeenImage?: string; // base64 or URL
  boundingBox: BoundingBox;
  confidence: number;
  
  // Status
  isActive: boolean;
  lastSeen: Date;
  cameraIds: string[];
}

export interface KnownIdentity {
  id: string;
  name?: string;
  category: 'shoplifter' | 'vip' | 'employee' | 'banned' | 'regular';
  notes?: string;
  addedDate: Date;
  lastEncounter?: Date;
  encounterCount: number;
}

export interface Location {
  cameraId: string;
  cameraName: string;
  zone: string;
  coordinates: {
    x: number;
    y: number;
  };
  timestamp: Date;
}

export interface LocationHistory {
  location: Location;
  dwellTime: number; // seconds spent at this location
  movementSpeed?: number; // pixels per second
}

export interface BehaviorAnalysis {
  // Movement Patterns
  movementPattern: 'normal' | 'loitering' | 'erratic' | 'purposeful' | 'suspicious';
  averageSpeed: number;
  directionChanges: number;
  
  // Dwell Analysis
  totalDwellTime: number;
  highValueAreaTime: number;
  exitAreaTime: number;
  
  // Interaction Analysis
  staffInteractions: number;
  customerInteractions: number;
  productInteractions: ProductInteraction[];
  
  // Behavioral Indicators
  lookingAround: boolean;
  concealmentBehavior: boolean;
  avoidingCameras: boolean;
  avoidingStaff: boolean;
  nervousBehavior: boolean;
}

export interface ProductInteraction {
  productArea: string;
  interactionType: 'viewing' | 'handling' | 'concealing' | 'returning';
  duration: number;
  timestamp: Date;
  confidence: number;
}

export interface SuspiciousActivity {
  id: string;
  type: SuspiciousActivityType;
  description: string;
  timestamp: Date;
  location: Location;
  confidence: number;
  evidence?: Evidence[];
}

export type SuspiciousActivityType = 
  | 'concealment'
  | 'loitering'
  | 'evasive_movement'
  | 'staff_avoidance'
  | 'camera_avoidance'
  | 'unusual_product_handling'
  | 'exit_without_payment'
  | 'group_coordination'
  | 'distraction_behavior';

export interface Evidence {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  timestamp: Date;
  cameraId: string;
  description?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Dashboard State Types
export interface PersonTrackingState {
  activePeople: Person[];
  selectedPerson?: Person;
  filterOptions: FilterOptions;
  sortOptions: SortOptions;
  viewMode: ViewMode;
  realTimeUpdates: boolean;
}

export interface FilterOptions {
  riskLevel?: RiskLevel[];
  isKnownShoplifter?: boolean;
  isVIP?: boolean;
  timeInStoreMin?: number;
  timeInStoreMax?: number;
  cameraIds?: string[];
  zones?: string[];
}

export interface SortOptions {
  field: 'entryTime' | 'timeInStore' | 'riskLevel' | 'lastSeen' | 'customerNumber';
  direction: 'asc' | 'desc';
}

export type ViewMode = 'grid' | 'list' | 'detailed';

// Real-time Update Types
export interface PersonUpdate {
  type: 'person_detected' | 'person_updated' | 'person_exited' | 'behavior_alert';
  person: Person;
  timestamp: Date;
}

export interface PersonTrackingMetrics {
  totalActivePeople: number;
  averageTimeInStore: number;
  highRiskCount: number;
  knownShopliftersCount: number;
  vipCount: number;
  newEntriesLastHour: number;
  exitsLastHour: number;
}

// Component Props Types
export interface PersonCardProps {
  person: Person;
  onSelect: (person: Person) => void;
  onViewDetails: (person: Person) => void;
  onMarkAsShoplifter: (person: Person) => void;
  onAddNote: (person: Person, note: string) => void;
  compact?: boolean;
}

export interface PersonDetailsProps {
  person: Person;
  onClose: () => void;
  onUpdateRiskLevel: (personId: string, riskLevel: RiskLevel) => void;
  onAddEvidence: (personId: string, evidence: Evidence) => void;
}

export interface PersonTrackingGridProps {
  people: Person[];
  selectedPerson?: Person;
  onPersonSelect: (person: Person) => void;
  viewMode: ViewMode;
  loading?: boolean;
}

export interface PersonTrackingFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCameras: { id: string; name: string }[];
  availableZones: string[];
}

export interface PersonTrackingMetricsProps {
  metrics: PersonTrackingMetrics;
  loading?: boolean;
}