// src/components/widgets/index.ts
// Central export file untuk semua widget components

export { default as TempChartWidget } from './TempChartWidget';
export { default as TempGaugeWidget } from './TempGaugeWidget';
export { default as SensorCardWidget } from './SensorCardWidget';
export { default as DigitalStatusWidget } from './DigitalStatusWidget';
export { default as ElectricalWidget } from './ElectricalWidget';
export { default as EnvironmentalWidget } from './EnvironmentalWidget';
export { default as AlarmPanelWidget } from './AlarmPanelWidget';
export { default as SystemOverviewWidget } from './SystemOverviewWidget';

// Widget configuration types
export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  device: string;
  sensor: string;
  chipId?: string;
  config?: {
    deviceId?: string;
    sensorId?: string;
    sensorField?: string;
    measurement?: string;
    systemWide?: boolean;
  };
}

// Widget type definitions
export interface WidgetType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

// Base widget props interface
export interface BaseWidgetProps {
  config: WidgetConfig;
  onRemove: () => void;
  onSettings: () => void;
  isDragging: boolean;
  dragHandleProps: any;
}