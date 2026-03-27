/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [session, setSession] = useState({
    isActive: false,
    metadata: null,
    packets: [],
    aggregations: null, // Pre-computed by the worker: flows, talkers, devices, voice
    loading: { status: 'idle', percent: 0, message: '' }
  });

  const [globalSearch, setGlobalSearch] = useState('');

  const loadCapture = (file) => {
    const MAX_SIZE = 500 * 1024 * 1024;
    const SUPPORTED_EXTS = ['.pcap', '.pcapng', '.log', '.txt', '.enc'];

    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert(`File size exceeds the 500MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }

    const { name } = file;
    if (!SUPPORTED_EXTS.some(ext => name.toLowerCase().endsWith(ext))) {
      alert(`Invalid format: ${name}. Supported: .pcap, .pcapng, .enc, .log, .txt`);
      return;
    }

    setSession(prev => ({
      ...prev,
      loading: { status: 'parsing', percent: 0, message: 'Initializing parser...' }
    }));

    const worker = new Worker(new URL('../workers/pcap-parser.worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
      const { status, message, percent, metadata, packets, aggregations } = e.data;

      if (status === 'progress') {
        setSession(prev => ({
          ...prev,
          loading: { ...prev.loading, percent, message }
        }));
      }

      if (status === 'success') {
        setSession(prev => ({
          ...prev,
          isActive: true,
          metadata,
          packets,
          aggregations, // Store all pre-computed summaries
          loading: { status: 'idle', percent: 100, message: 'Parse complete' }
        }));
        worker.terminate();
      }

      if (status === 'error') {
        alert('Parser engine failure: ' + message);
        setSession(prev => ({
          ...prev,
          loading: { status: 'idle', percent: 0, message: '' }
        }));
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      alert('Uncaught engine error in Web Worker.');
      console.error(err);
      setSession(prev => ({ ...prev, loading: { status: 'idle', percent: 0, message: '' } }));
      worker.terminate();
    };

    worker.postMessage({ file });
  };

  const terminateSession = () => {
    setSession({
      isActive: false,
      metadata: null,
      packets: [],
      aggregations: null,
      loading: { status: 'idle', percent: 0, message: '' }
    });
  };

  return (
    <DataContext.Provider value={{ session, loadCapture, terminateSession, globalSearch, setGlobalSearch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside a DataProvider');
  return context;
}
