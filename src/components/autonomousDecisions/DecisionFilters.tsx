import React, { useState } from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { 
  DecisionFilterOptions, 
  DecisionFiltersProps, 
  DecisionType, 
  DecisionStatus,
  DecisionPriority 
} from '../../types/autonomousDecisions';

export const DecisionFilters: React.FC<DecisionFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCameras,
  availableZones,
  availableModels
}) => {
  const theme = useSecurityTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof DecisionFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = (): number => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return true;
      return value !== undefined && value !== null;
    }).length;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.surface,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    transition: 'all 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: isExpanded ? `1px solid ${theme.colors.border.secondary}` : 'none',
  };

  const contentStyle: React.CSSProperties = {
    padding: isExpanded ? theme.spacing.md : 0,
    maxHeight: isExpanded ? '600px' : '0px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  const filterGroupStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing.md,
  };

  const filterItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const selectStyle: React.CSSProperties = {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.elevated,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  };

  const inputStyle: React.CSSProperties = {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.elevated,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  };

  const checkboxGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  };

  const checkboxItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.background.elevated,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  };

  const activeFilterCount = getActiveFilterCount();

  const decisionTypes: { value: DecisionType; label: string }[] = [
    { value: 'threat_assessment', label: 'Threat Assessment' },
    { value: 'behavior_analysis', label: 'Behavior Analysis' },
    { value: 'facial_recognition_match', label: 'Facial Recognition' },
    { value: 'shoplifting_detection', label: 'Shoplifting Detection' },
    { value: 'loitering_detection', label: 'Loitering Detection' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'staff_alert_decision', label: 'Staff Alert' },
    { value: 'evidence_collection_trigger', label: 'Evidence Collection' },
    { value: 'escalation_decision', label: 'Escalation' },
    { value: 'intervention_recommendation', label: 'Intervention' },
  ];

  return (
    <div style={containerStyle}>
      {/* Filter Header */}
      <div style={headerStyle} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <h3 style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            margin: 0,
          }}>
            🔍 Decision Filters
          </h3>
          
          {activeFilterCount > 0 && (
            <div style={{
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.primary.contrast,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
            }}>
              {activeFilterCount}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              style={{
                ...buttonStyle,
                backgroundColor: theme.colors.status.critical,
                color: theme.colors.primary.contrast,
                border: 'none',
              }}
            >
              Clear All
            </button>
          )}
          
          <div style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text.secondary,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div style={contentStyle}>
        <div style={filterGroupStyle}>
          {/* Decision Type Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Decision Type</label>
            <select
              multiple
              value={filters.decisionType || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value as DecisionType);
                handleFilterChange('decisionType', selectedOptions.length > 0 ? selectedOptions : undefined);
              }}
              style={{ ...selectStyle, height: '120px' }}
            >
              {decisionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Decision Status</label>
            <div style={checkboxGroupStyle}>
              {(['processing', 'completed', 'executed', 'overridden', 'failed', 'pending_review'] as DecisionStatus[]).map(status => (
                <label key={status} style={checkboxItemStyle}>
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status) || false}
                    onChange={(e) => {
                      const currentStatuses = filters.status || [];
                      if (e.target.checked) {
                        handleFilterChange('status', [...currentStatuses, status]);
                      } else {
                        handleFilterChange('status', currentStatuses.filter(s => s !== status));
                      }
                    }}
                    style={{ accentColor: theme.colors.primary.main }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Priority Level</label>
            <div style={checkboxGroupStyle}>
              {(['critical', 'high', 'medium', 'low'] as DecisionPriority[]).map(priority => (
                <label key={priority} style={checkboxItemStyle}>
                  <input
                    type="checkbox"
                    checked={filters.priority?.includes(priority) || false}
                    onChange={(e) => {
                      const currentPriorities = filters.priority || [];
                      if (e.target.checked) {
                        handleFilterChange('priority', [...currentPriorities, priority]);
                      } else {
                        handleFilterChange('priority', currentPriorities.filter(p => p !== priority));
                      }
                    }}
                    style={{ 
                      accentColor: priority === 'critical' 
                        ? theme.colors.status.critical 
                        : priority === 'high'
                        ? '#FF6B35'
                        : priority === 'medium'
                        ? theme.colors.status.warning
                        : theme.colors.status.normal
                    }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Level Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Risk Level</label>
            <div style={checkboxGroupStyle}>
              {(['critical', 'high', 'medium', 'low']).map(risk => (
                <label key={risk} style={checkboxItemStyle}>
                  <input
                    type="checkbox"
                    checked={filters.riskLevel?.includes(risk as any) || false}
                    onChange={(e) => {
                      const currentRiskLevels = filters.riskLevel || [];
                      if (e.target.checked) {
                        handleFilterChange('riskLevel', [...currentRiskLevels, risk as any]);
                      } else {
                        handleFilterChange('riskLevel', currentRiskLevels.filter(r => r !== risk));
                      }
                    }}
                    style={{ 
                      accentColor: risk === 'critical' 
                        ? theme.colors.status.critical 
                        : risk === 'high'
                        ? '#FF6B35'
                        : risk === 'medium'
                        ? theme.colors.status.warning
                        : theme.colors.status.normal
                    }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{risk}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Confidence Range Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Confidence Range</label>
            <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min %"
                min="0"
                max="100"
                value={filters.confidenceRange?.min ? Math.round(filters.confidenceRange.min * 100) : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) / 100 : undefined;
                  const currentRange = filters.confidenceRange || {};
                  handleFilterChange('confidenceRange', value !== undefined ? { ...currentRange, min: value } : undefined);
                }}
                style={{ ...inputStyle, width: '80px' }}
              />
              <span style={{ color: theme.colors.text.secondary }}>to</span>
              <input
                type="number"
                placeholder="Max %"
                min="0"
                max="100"
                value={filters.confidenceRange?.max ? Math.round(filters.confidenceRange.max * 100) : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) / 100 : undefined;
                  const currentRange = filters.confidenceRange || {};
                  handleFilterChange('confidenceRange', value !== undefined ? { ...currentRange, max: value } : undefined);
                }}
                style={{ ...inputStyle, width: '80px' }}
              />
            </div>
          </div>

          {/* Model Version Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Model Version</label>
            <select
              multiple
              value={filters.modelVersion || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('modelVersion', selectedOptions.length > 0 ? selectedOptions : undefined);
              }}
              style={{ ...selectStyle, height: '80px' }}
            >
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Cameras</label>
            <select
              multiple
              value={filters.cameraIds || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('cameraIds', selectedOptions.length > 0 ? selectedOptions : undefined);
              }}
              style={{ ...selectStyle, height: '100px' }}
            >
              {availableCameras.map(camera => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zone Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Zones</label>
            <select
              multiple
              value={filters.zones || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('zones', selectedOptions.length > 0 ? selectedOptions : undefined);
              }}
              style={{ ...selectStyle, height: '100px' }}
            >
              {availableZones.map(zone => (
                <option key={zone} value={zone}>
                  {zone.charAt(0).toUpperCase() + zone.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Special Filters */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Special Filters</label>
            <div style={checkboxGroupStyle}>
              <label style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={filters.hasHumanOverride === true}
                  onChange={(e) => {
                    handleFilterChange('hasHumanOverride', e.target.checked ? true : undefined);
                  }}
                  style={{ accentColor: theme.colors.status.warning }}
                />
                <span>Human Overridden</span>
              </label>
            </div>
          </div>

          {/* Outcome Type Filter */}
          <div style={filterItemStyle}>
            <label style={labelStyle}>Outcome Type</label>
            <div style={checkboxGroupStyle}>
              {(['true_positive', 'false_positive', 'true_negative', 'false_negative', 'pending']).map(outcome => (
                <label key={outcome} style={checkboxItemStyle}>
                  <input
                    type="checkbox"
                    checked={filters.outcomeType?.includes(outcome as any) || false}
                    onChange={(e) => {
                      const currentOutcomes = filters.outcomeType || [];
                      if (e.target.checked) {
                        handleFilterChange('outcomeType', [...currentOutcomes, outcome as any]);
                      } else {
                        handleFilterChange('outcomeType', currentOutcomes.filter(o => o !== outcome));
                      }
                    }}
                    style={{ accentColor: theme.colors.primary.main }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{outcome.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border.secondary}`,
          display: 'flex',
          gap: theme.spacing.sm,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            alignSelf: 'center',
          }}>
            Quick Filters:
          </span>
          
          <button
            onClick={() => handleFilterChange('priority', ['critical'])}
            style={{
              ...buttonStyle,
              backgroundColor: theme.colors.status.critical + '20',
              color: theme.colors.status.critical,
              border: `1px solid ${theme.colors.status.critical}`,
            }}
          >
            🚨 Critical Only
          </button>
          
          <button
            onClick={() => handleFilterChange('status', ['processing'])}
            style={{
              ...buttonStyle,
              backgroundColor: theme.colors.status.active + '20',
              color: theme.colors.status.active,
              border: `1px solid ${theme.colors.status.active}`,
            }}
          >
            ⚡ Processing
          </button>
          
          <button
            onClick={() => handleFilterChange('hasHumanOverride', true)}
            style={{
              ...buttonStyle,
              backgroundColor: theme.colors.status.warning + '20',
              color: theme.colors.status.warning,
              border: `1px solid ${theme.colors.status.warning}`,
            }}
          >
            👤 Overridden
          </button>
          
          <button
            onClick={() => handleFilterChange('decisionType', ['shoplifting_detection', 'threat_assessment'])}
            style={{
              ...buttonStyle,
              backgroundColor: theme.colors.status.critical + '20',
              color: theme.colors.status.critical,
              border: `1px solid ${theme.colors.status.critical}`,
            }}
          >
            🚫 Security Threats
          </button>
          
          <button
            onClick={() => handleFilterChange('confidenceRange', { min: 0.9, max: 1.0 })}
            style={{
              ...buttonStyle,
              backgroundColor: theme.colors.status.normal + '20',
              color: theme.colors.status.normal,
              border: `1px solid ${theme.colors.status.normal}`,
            }}
          >
            🎯 High Confidence (90%+)
          </button>
        </div>
      </div>
    </div>
  );
};