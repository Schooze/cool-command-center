// src/components/widgets/WidgetConfigPopup.tsx
// Fixed Widget Configuration Popup dengan proper null checking

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Type definitions untuk better type safety
interface WidgetConfig {
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

interface WidgetConfigPopupProps {
  isOpen: boolean;
  onClose: () => void;
  widget: WidgetConfig | null;
  onSave?: (updatedWidget: WidgetConfig) => void;
}

const WidgetConfigPopup: React.FC<WidgetConfigPopupProps> = ({ 
  isOpen, 
  onClose, 
  widget, 
  onSave 
}) => {
  // Local state untuk form
  const [title, setTitle] = useState('');
  const [device, setDevice] = useState('');
  const [sensor, setSensor] = useState('');

  // Update local state ketika widget berubah
  useEffect(() => {
    if (widget) {
      setTitle(widget.title || '');
      setDevice(widget.device || '');
      setSensor(widget.sensor || '');
    }
  }, [widget]);

  // Early return jika modal tidak open atau widget null
  if (!isOpen || !widget) {
    return null;
  }

  const handleSave = () => {
    if (onSave && widget) {
      const updatedWidget: WidgetConfig = {
        ...widget,
        title: title.trim(),
        device: device.trim(),
        sensor: sensor.trim()
      };
      onSave(updatedWidget);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset form ke nilai original
    if (widget) {
      setTitle(widget.title || '');
      setDevice(widget.device || '');
      setSensor(widget.sensor || '');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Widget Configuration
            </h2>
            <button 
              onClick={handleCancel} 
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Widget Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <p><strong>Widget Type:</strong> {widget.type}</p>
              <p><strong>Widget ID:</strong> {widget.id}</p>
              {widget.chipId && (
                <p><strong>Device Chip ID:</strong> {widget.chipId}</p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select device...</option>
                <option value="Chamber A">Chamber A</option>
                <option value="Chamber B">Chamber B</option>
                <option value="Chamber C">Chamber C</option>
                <option value="Chamber D">Chamber D</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensor
              </label>
              <select
                value={sensor}
                onChange={(e) => setSensor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select sensor...</option>
                <option value="Product Temp 1">Product Temp 1 (P1_T)</option>
                <option value="Product Temp 2">Product Temp 2 (P2_T)</option>
                <option value="Evaporator Temp">Evaporator Temp (E_T)</option>
                <option value="Ambient Temp">Ambient Temp (A_T)</option>
                <option value="Condensor Temp">Condensor Temp (C_T)</option>
                <option value="Humidity">Humidity (H)</option>
                <option value="Pressure">Pressure (P)</option>
                <option value="Current">Current</option>
                <option value="Voltage">Voltage</option>
                <option value="Digital I/O">Digital I/O</option>
                <option value="Environmental">Environmental</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>

            {/* Additional info untuk system-wide widgets */}
            {widget.config?.systemWide && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a system-wide widget that aggregates data from all devices.
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Title:</strong> {title || 'Untitled Widget'}</p>
              <p><strong>Device:</strong> {device || 'Not selected'}</p>
              <p><strong>Sensor:</strong> {sensor || 'Not selected'}</p>
              <p><strong>Data Source:</strong> InfluxDB - coolingmonitoring bucket</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigPopup;