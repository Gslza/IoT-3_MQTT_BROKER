import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { BrokerConfig, MQTTConfigs, SensorData, LogItem, RelayState, ActivePage } from '../types';

interface IoTContextType {
  user: User | null;
  authLoading: boolean;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  configs: MQTTConfigs;
  saveConfigs: (newConfigs: MQTTConfigs) => void;
  resetConfigs: () => void;
  connectionStatus: {
    MyQttHub: 'connected' | 'disconnected' | 'connecting' | 'error';
    Cedalo: 'connected' | 'disconnected' | 'connecting' | 'error';
    CrystalMQ: 'connected' | 'disconnected' | 'connecting' | 'error';
  };
  sensorData: {
    temperature: number;
    humidity: number;
    lastUpdated: string;
    broker: string;
  };
  relayState: RelayState;
  tempHistory: SensorData[];
  humidityHistory: SensorData[];
  logs: LogItem[];
  addLog: (type: LogItem['type'], broker: string, message: string) => void;
  clearLogs: () => void;
  clearTempHistory: () => void;
  clearHumidityHistory: () => void;
  publishRelay: (relayIndex: 1 | 2 | 3 | 4, action: 'ON' | 'OFF') => void;
  publishAllRelays: (action: 'ON' | 'OFF') => void;
  publishMode: (mode: 'VARIASI1' | 'VARIASI2') => void;
  publishVoiceCommandText: (text: string) => void;
  voiceText: string;
  setVoiceText: (text: string) => void;
  isVoiceListening: boolean;
  setIsVoiceListening: (listening: boolean) => void;
  triggerVoiceCommand: (command: string) => void;
  simulateSensorPayload: () => void;
}

const defaultConfigs: MQTTConfigs = {
  MyQttHub: {
    name: 'MyQttHub (Shiftr.io)',
    websocketUrl: 'wss://gusliza.cloud.shiftr.io:443',
    port: 443,
    username: 'gusliza',
    password: 'Abangaba11',
    clientId: `web_myqtthub_${Math.random().toString(16).substring(2, 8)}`,
    baseTopic: 'gzza-core/iot/esp32-gzza-core-01'
  },
  Cedalo: {
    name: 'Cedalo MQTT',
    websocketUrl: 'wss://pf-khkqcj4oqntlaiv975yr.cedalo.cloud:443/mqtt',
    port: 443,
    username: 'gzza-web-client',
    password: 'Abangaba11',
    clientId: 'gzza-web-01',
    baseTopic: 'gzza-core/iot/esp32-gzza-core-01'
  },
  CrystalMQ: {
    name: 'CrystalMQ (Flespi)',
    websocketUrl: 'wss://mqtt.flespi.io:443',
    port: 443,
    username: 'ldaBtdafTVhQH6feMcpfdwVxYVmNfYQAb1wSLICn4AykmdC5xy4JY2SPPhI1h7yb',
    password: '',
    clientId: `web_crystalmq_${Math.random().toString(16).substring(2, 8)}`,
    baseTopic: 'gzza-core/iot/esp32-gzza-core-01'
  }
};

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export function IoTProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>('voice');
  const [voiceText, setVoiceText] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Load configs from storage or default
  const [configs, setConfigs] = useState<MQTTConfigs>(() => {
    const saved = localStorage.getItem('mqtt_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultConfigs;
      }
    }
    return defaultConfigs;
  });

  const [connectionStatus, setConnectionStatus] = useState<IoTContextType['connectionStatus']>({
    MyQttHub: 'disconnected',
    Cedalo: 'disconnected',
    CrystalMQ: 'disconnected'
  });

  const [sensorData, setSensorData] = useState({
    temperature: 28.5,
    humidity: 55.0,
    lastUpdated: new Date().toLocaleTimeString(),
    broker: 'Simulasi'
  });

  const [relayState, setRelayState] = useState<RelayState>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false
  });

  // History states
  const [tempHistory, setTempHistory] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('temp_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [humidityHistory, setHumidityHistory] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('humidity_history');
    return saved ? JSON.parse(saved) : [];
  });

  // MQTT Logs
  const [logs, setLogs] = useState<LogItem[]>(() => {
    const saved = localStorage.getItem('mqtt_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep references to connected clients
  const clientsRef = useRef<{ MyQttHub?: MqttClient; Cedalo?: MqttClient; CrystalMQ?: MqttClient }>({});

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Save histories inside localStorage on changes
  useEffect(() => {
    localStorage.setItem('temp_history', JSON.stringify(tempHistory));
  }, [tempHistory]);

  useEffect(() => {
    localStorage.setItem('humidity_history', JSON.stringify(humidityHistory));
  }, [humidityHistory]);

  useEffect(() => {
    localStorage.setItem('mqtt_logs', JSON.stringify(logs));
  }, [logs]);

  // Log function helper
  const addLog = (type: LogItem['type'], broker: string, message: string) => {
    const newLogItem: LogItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      broker,
      message
    };
    setLogs((prev) => [newLogItem, ...prev.slice(0, 199)]); // Limit log size to 200 items for memory efficiency
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('mqtt_logs');
    addLog('info', 'System', 'Daftar log aktivitas MQTT dibersihkan.');
  };

  const clearTempHistory = () => {
    setTempHistory([]);
    localStorage.removeItem('temp_history');
    addLog('info', 'System', 'Riwayat sensor suhu dibersihkan.');
  };

  const clearHumidityHistory = () => {
    setHumidityHistory([]);
    localStorage.removeItem('humidity_history');
    addLog('info', 'System', 'Riwayat sensor kelembapan dibersihkan.');
  };

  // Connection Handler
  useEffect(() => {
    if (!user) {
      // Disconnect all if logged out
      Object.entries(clientsRef.current).forEach(([key, client]) => {
        const c = client as MqttClient | undefined;
        if (c) {
          c.end();
          addLog('warning', key, `Memutus koneksi otomatis karena user logout.`);
        }
      });
      clientsRef.current = {};
      setConnectionStatus({
        MyQttHub: 'disconnected',
        Cedalo: 'disconnected',
        CrystalMQ: 'disconnected'
      });
      return;
    }

    // Connect to each broker configured
    const keys: (keyof MQTTConfigs)[] = ['MyQttHub', 'Cedalo', 'CrystalMQ'];

    keys.forEach((key) => {
      const bConf = configs[key];
      if (!bConf.websocketUrl) {
        setConnectionStatus((prev) => ({ ...prev, [key]: 'disconnected' }));
        return;
      }

      // End existing client if open
      if (clientsRef.current[key]) {
        clientsRef.current[key]?.end();
      }

      setConnectionStatus((prev) => ({ ...prev, [key]: 'connecting' }));
      addLog('info', bConf.name, `Sedang menghubungkan ke ${bConf.websocketUrl}...`);

      const options = {
        clientId: bConf.clientId,
        username: bConf.username || undefined,
        password: bConf.password || undefined,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 10000,
      };

      try {
        const client = mqtt.connect(bConf.websocketUrl, options);
        clientsRef.current[key] = client;

        client.on('connect', () => {
          setConnectionStatus((prev) => ({ ...prev, [key]: 'connected' }));
          addLog('success', bConf.name, `Koneksi MQTT Broker sukses! Client ID: ${bConf.clientId}`);

          // Subscribing to topics
          const subTopics = [
            `${bConf.baseTopic}/sensor`,
            `${bConf.baseTopic}/relay/+/state`,
            `${bConf.baseTopic}/relay/status`,
            `${bConf.baseTopic}/mode/status`,
            `${bConf.baseTopic}/voice/cmd`,
            `${bConf.baseTopic}/log`
          ];

          subTopics.forEach((t) => {
            client.subscribe(t, (err) => {
              if (err) {
                addLog('error', bConf.name, `Gagal subscribe topik: ${t}`);
              } else {
                addLog('subscribe', bConf.name, `Berhasil subscribe ke ${t}`);
              }
            });
          });
        });

        client.on('message', (topic, payload) => {
          const messageStr = payload.toString();
          addLog('subscribe', bConf.name, `Menerima pesan [${topic}]: ${messageStr.substring(0, 100)}`);

          // Parse various sensor/relay states
          try {
            if (topic.endsWith('/sensor')) {
              const data = JSON.parse(messageStr);
              const temp = parseFloat(data.temperature);
              const hum = parseFloat(data.humidity);

              if (!isNaN(temp) && !isNaN(hum)) {
                setSensorData({
                  temperature: temp,
                  humidity: hum,
                  lastUpdated: new Date().toLocaleTimeString(),
                  broker: bConf.name
                });

                // Add to history
                const timeStr = new Date().toLocaleTimeString() + ' (' + new Date().toLocaleDateString() + ')';
                const tempItem: SensorData = {
                  device_id: data.device_id || 'esp32_hardware',
                  temperature: temp,
                  humidity: hum,
                  unit_temperature: 'C',
                  unit_humidity: '%',
                  timestamp: timeStr,
                  broker: bConf.name
                };
                setTempHistory((prev) => [tempItem, ...prev.slice(0, 99)]);
                setHumidityHistory((prev) => [tempItem, ...prev.slice(0, 99)]);
              }
            } else if (topic.endsWith('/relay/status')) {
              const data = JSON.parse(messageStr);
              setRelayState({
                relay1: !!data.relay1,
                relay2: !!data.relay2,
                relay3: !!data.relay3,
                relay4: !!data.relay4,
              });
              addLog('info', bConf.name, `Sinkronisasi status relay berhasil.`);
            } else if (topic.includes('/relay/')) {
              // gzza-core/iot/esp32-gzza-core-01/relay/1/state
              const parts = topic.split('/');
              const stateIndex = parts.indexOf('relay') + 1;
              const relayNum = stateIndex > 0 ? parts[stateIndex] : null;

              if (relayNum && ['1', '2', '3', '4'].includes(relayNum)) {
                const state = messageStr.toUpperCase() === 'ON';
                setRelayState((prev) => ({
                  ...prev,
                  [`relay${relayNum}`]: state
                }));
              }
            } else if (topic.endsWith('/mode/status')) {
              addLog('info', bConf.name, `Mode variasi state update: ${messageStr}`);
            }
          } catch (e) {
            addLog('error', bConf.name, `Gagal memproses JSON payload: ${messageStr}`);
          }
        });

        client.on('error', (err) => {
          setConnectionStatus((prev) => ({ ...prev, [key]: 'error' }));
          addLog('error', bConf.name, `Error koneksi: ${err.message}`);
        });

        client.on('close', () => {
          setConnectionStatus((prev) => ({ ...prev, [key]: 'disconnected' }));
        });

      } catch (err: any) {
        setConnectionStatus((prev) => ({ ...prev, [key]: 'error' }));
        addLog('error', bConf.name, `Gagal menginisialisasi client: ${err.message}`);
      }
    });

    return () => {
      // Cleanup connections
    };
  }, [user, configs]);

  const saveConfigs = (newConfigs: MQTTConfigs) => {
    setConfigs(newConfigs);
    localStorage.setItem('mqtt_configs', JSON.stringify(newConfigs));
    addLog('info', 'System', 'Konfigurasi MQTT diperbarui, menghubungkan ulang...');
  };

  const resetConfigs = () => {
    setConfigs(defaultConfigs);
    localStorage.setItem('mqtt_configs', JSON.stringify(defaultConfigs));
    addLog('info', 'System', 'Konfigurasi MQTT dikembalikan ke setelan pabrik.');
  };

  // Publishing helpers
  const publishToAll = (topicSuffix: string, payload: string) => {
    let successCount = 0;
    Object.entries(clientsRef.current).forEach(([key, client]) => {
      const c = client as MqttClient | undefined;
      if (c && connectionStatus[key as keyof MQTTConfigs] === 'connected') {
        const bConf = configs[key as keyof MQTTConfigs];
        const fullTopic = `${bConf.baseTopic}/${topicSuffix}`;
        c.publish(fullTopic, payload, { qos: 1 });
        addLog('publish', bConf.name, `Publish ke [${fullTopic}]: ${payload}`);
        successCount++;
      }
    });

    if (successCount === 0) {
      addLog('warning', 'System', `Publish ditrigger lokal tetapi tidak ada broker terhubung: ${topicSuffix} -> ${payload}`);
    }
  };

  const publishRelay = (relayIndex: 1 | 2 | 3 | 4, action: 'ON' | 'OFF') => {
    // Optimistic UI update
    setRelayState((prev) => ({
      ...prev,
      [`relay${relayIndex}`]: action === 'ON'
    }));

    publishToAll(`relay/${relayIndex}/set`, action);
    addLog('info', 'System', `Saklar Relay ${relayIndex} diubah ke ${action}`);
  };

  const publishAllRelays = (action: 'ON' | 'OFF') => {
    setRelayState({
      relay1: action === 'ON',
      relay2: action === 'ON',
      relay3: action === 'ON',
      relay4: action === 'ON'
    });

    publishToAll('relay/all/set', action);
    addLog('info', 'System', `Semua saklar relay diubah ke ${action}`);
  };

  const publishMode = (mode: 'VARIASI1' | 'VARIASI2') => {
    // Map the internal web variation modes to the exact payloads expected by the physical ESP32 firmware
    const esp32Mode = mode === 'VARIASI1' ? 'LEFT_RIGHT' : 'STROBE';
    publishToAll('mode/set', esp32Mode);
    addLog('info', 'System', `Menerapkan mode variasi: ${mode} (Payload: ${esp32Mode})`);

    // Simulate multi-relay strobe sequence locally
    if (mode === 'VARIASI1') {
      addLog('info', 'System', 'Menjalankan simulasi VARIASI1: Nyala bergantian kiri ke kanan');
      let step = 0;
      const interval = setInterval(() => {
        setRelayState({
          relay1: step === 0,
          relay2: step === 1,
          relay3: step === 2,
          relay4: step === 3
        });
        step++;
        if (step > 4) {
          clearInterval(interval);
          setRelayState({ relay1: false, relay2: false, relay3: false, relay4: false });
          addLog('info', 'System', 'Simulasi VARIASI1 selesai.');
        }
      }, 400);
    } else if (mode === 'VARIASI2') {
      addLog('info', 'System', 'Menjalankan simulasi VARIASI2: Semua berkedip strobe');
      let count = 0;
      const interval = setInterval(() => {
        setRelayState((prev) => {
          const nextVal = !prev.relay1;
          return { relay1: nextVal, relay2: nextVal, relay3: nextVal, relay4: nextVal };
        });
        count++;
        if (count > 10) {
          clearInterval(interval);
          setRelayState({ relay1: false, relay2: false, relay3: false, relay4: false });
          addLog('info', 'System', 'Simulasi VARIASI2 selesai.');
        }
      }, 300);
    }
  };

  const publishVoiceCommandText = (text: string) => {
    publishToAll('voice/cmd', text);
  };

  // Process a recognized spoken command
  const triggerVoiceCommand = (command: string) => {
    const cleanCommand = command.trim().toLowerCase();
    addLog('info', 'Voice Engine', `Diterjemahkan: "${command}"`);
    publishVoiceCommandText(cleanCommand);

    const speak = (msg: string) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = 'id-ID';
        window.speechSynthesis.speak(utterance);
      } else {
        addLog('warning', 'SpeechSynthesis', 'Browser Anda tidak mendukung output suara.');
      }
    };

    // Mapping commands
    if (cleanCommand.includes('nyalakan relay 1')) {
      publishRelay(1, 'ON');
      speak('Siap, menyalakan relay 1!');
    } else if (cleanCommand.includes('matikan relay 1')) {
      publishRelay(1, 'OFF');
      speak('Siap, meredupkan atau mematikan relay 1!');
    } else if (cleanCommand.includes('nyalakan relay 2')) {
      publishRelay(2, 'ON');
      speak('Siap, menyalakan relay 2!');
    } else if (cleanCommand.includes('matikan relay 2')) {
      publishRelay(2, 'OFF');
      speak('Siap, mematikan relay 2!');
    } else if (cleanCommand.includes('nyalakan relay 3')) {
      publishRelay(3, 'ON');
      speak('Siap, menghidupkan relay 3!');
    } else if (cleanCommand.includes('matikan relay 3')) {
      publishRelay(3, 'OFF');
      speak('Siap, mematikan relay 3!');
    } else if (cleanCommand.includes('nyalakan relay 4')) {
      publishRelay(4, 'ON');
      speak('Siap, mengaktifkan relay 4!');
    } else if (cleanCommand.includes('matikan relay 4')) {
      publishRelay(4, 'OFF');
      speak('Siap, menonaktifkan relay 4!');
    } else if (cleanCommand.includes('nyalakan semua relay') || cleanCommand.includes('nyalakan semua')) {
      publishAllRelays('ON');
      speak('Mengaktifkan semua relay secara bersamaan!');
    } else if (cleanCommand.includes('matikan semua relay') || cleanCommand.includes('matikan semua')) {
      publishAllRelays('OFF');
      speak('Mematikan seluruh saklar relay!');
    } else if (cleanCommand.includes('jalankan variasi 1') || cleanCommand.includes('variasi satu') || cleanCommand.includes('variasi 1')) {
      publishMode('VARIASI1');
      speak('Mengaktifkan variasi satu, relay menyala bergantian kiri ke kanan.');
    } else if (cleanCommand.includes('jalankan variasi 2') || cleanCommand.includes('variasi dua') || cleanCommand.includes('variasi 2')) {
      publishMode('VARIASI2');
      speak('Mengaktifkan variasi dua, semua relay berkedip strobe.');
    } else if (cleanCommand.includes('baca suhu') || cleanCommand.includes('baca temperatur') || cleanCommand.includes('suhu saat ini') || cleanCommand.includes('berapa suhu')) {
      const msg = `Suhu ruangan saat ini adalah ${sensorData.temperature} derajat Celsius. Kondisinya ${
        sensorData.temperature < 25 ? 'dingin' : sensorData.temperature <= 30 ? 'normal' : 'panas'
      }.`;
      speak(msg);
      addLog('info', 'Voice Synthesis', `Membacakan suhu: "${msg}"`);
    } else if (cleanCommand.includes('baca kelembapan') || cleanCommand.includes('berapa kelembapan') || cleanCommand.includes('baca kelembaban')) {
      const msg = `Kelembapan udara terdeteksi ${sensorData.humidity} persen. Kondisinya ${
        sensorData.humidity < 40 ? 'kering' : sensorData.humidity <= 70 ? 'normal' : 'lembap'
      }.`;
      speak(msg);
      addLog('info', 'Voice Synthesis', `Membacakan kelembapan: "${msg}"`);
    } else {
      speak('Maaf, perintah suara tidak dikenal. Silakan coba lagi.');
      addLog('warning', 'Voice Engine', `Perintah suara tidak dikenali: "${command}"`);
    }
  };

  // Mock incoming sensor data helper to test features if no physical hardware is actively publishing
  const simulateSensorPayload = () => {
    const simulatedTemp = parseFloat((23 + Math.random() * 16).toFixed(1)); // ranges 23.0 to 39.0
    const simulatedHum = parseFloat((30 + Math.random() * 60).toFixed(1)); // ranges 30.0 to 90.0
    
    setSensorData({
      temperature: simulatedTemp,
      humidity: simulatedHum,
      lastUpdated: new Date().toLocaleTimeString(),
      broker: 'Simulasi Internal'
    });

    const timeStr = new Date().toLocaleTimeString() + ' (' + new Date().toLocaleDateString() + ')';
    const tempItem: SensorData = {
      device_id: 'esp32_mock_device',
      temperature: simulatedTemp,
      humidity: simulatedHum,
      unit_temperature: 'C',
      unit_humidity: '%',
      timestamp: timeStr,
      broker: 'Simulasi'
    };

    setTempHistory((prev) => [tempItem, ...prev.slice(0, 99)]);
    setHumidityHistory((prev) => [tempItem, ...prev.slice(0, 99)]);
    addLog('subscribe', 'Simulasi Sensor', `Menerima payload simulasi: ${simulatedTemp}°C, ${simulatedHum}%`);
  };

  // Generate automated dummy sensor inputs every 12 seconds to keep tables lively and rich
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      // 50% chance to update with small deviations
      simulateSensorPayload();
    }, 12000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <IoTContext.Provider
      value={{
        user,
        authLoading,
        activePage,
        setActivePage,
        configs,
        saveConfigs,
        resetConfigs,
        connectionStatus,
        sensorData,
        relayState,
        tempHistory,
        humidityHistory,
        logs,
        addLog,
        clearLogs,
        clearTempHistory,
        clearHumidityHistory,
        publishRelay,
        publishAllRelays,
        publishMode,
        publishVoiceCommandText,
        voiceText,
        setVoiceText,
        isVoiceListening,
        setIsVoiceListening,
        triggerVoiceCommand,
        simulateSensorPayload
      }}
    >
      {children}
    </IoTContext.Provider>
  );
}

export function useIoT() {
  const context = useContext(IoTContext);
  if (context === undefined) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
}
