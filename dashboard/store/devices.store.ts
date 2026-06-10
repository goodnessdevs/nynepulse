import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Device {
  id: string;
  name: string;
  type: string;
  token: string;
  status: 'ONLINE' | 'OFFLINE' | 'IDLE';
  lastSeenAt: string | null;
  metadata: Record<string, any> | null;
}

export interface TelemetryPayload {
  deviceId: string;
  payload: Record<string, any>;
}

interface DevicesStore {
  devices: Device[];
  selectedDevice: Device | null;
  latestTelemetry: Record<string, Record<string, any>>;
  loading: boolean;
  fetchDevices: () => Promise<void>;
  selectDevice: (device: Device) => void;
  updateDeviceStatus: (deviceId: string, status: Device['status']) => void;
  updateTelemetry: (deviceId: string, payload: Record<string, any>) => void;
}

export const useDevicesStore = create<DevicesStore>((set, get) => ({
  devices: [],
  selectedDevice: null,
  latestTelemetry: {},
  loading: false,

  fetchDevices: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/devices');
      const devices = data.data; // ← unwrap NestJS response wrapper
      console.log(devices)
      set({ devices, loading: false });
      if (!get().selectedDevice && devices.length > 0) {
        set({ selectedDevice: devices[0] });
      }
    } catch {
      set({ loading: false });
    }
  },

  selectDevice: (device) => set({ selectedDevice: device }),

  updateDeviceStatus: (deviceId, status) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, status } : d
      ),
    }));
  },

  updateTelemetry: (deviceId, payload) => {
    console.log('🔄 Store updateTelemetry called:', deviceId, payload); // ← add this
    set((state) => ({
      latestTelemetry: {
        ...state.latestTelemetry,
        [deviceId]: payload,
      },
    }));
  },
}));