export interface BrokerConfig {
  name: string;
  websocketUrl: string;
  port: number;
  username: string;
  password?: string;
  clientId: string;
  baseTopic: string;
}

export interface MQTTConfigs {
  MyQttHub: BrokerConfig;
  Cedalo: BrokerConfig;
  CrystalMQ: BrokerConfig;
}

export interface SensorData {
  device_id: string;
  temperature: number;
  humidity: number;
  unit_temperature: string;
  unit_humidity: string;
  timestamp: string;
  broker: string;
}

export interface LogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'publish' | 'subscribe';
  broker: string;
  message: string;
}

export interface RelayState {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
}

export type ActivePage = 
  | 'voice' 
  | 'suhu' 
  | 'kelembapan' 
  | 'mqtt-config' 
  | 'data-suhu' 
  | 'data-kelembapan' 
  | 'log-mqtt' 
  | 'kontrol-relay';
