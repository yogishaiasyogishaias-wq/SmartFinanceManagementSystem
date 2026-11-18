import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncEngine, SyncResult } from '../services/syncEngine';
import { localDb } from '../services/localDatabase';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string;
  isSyncing: boolean;
  toggleNetwork: () => void;
  triggerSync: () => Promise<SyncResult>;
}

const SyncContext = createContext<SyncContextType>({
  isOnline: true,
  pendingCount: 0,
  lastSyncTime: 'Just now',
  isSyncing: false,
  toggleNetwork: () => {},
  triggerSync: async () => ({ totalProcessed: 0, successCount: 0, failedCount: 0, conflictsCount: 0, errors: [] }),
});

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState('2026-11-07 10:15 AM');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initial sync check
    localDb.getPendingOutbox().then((outbox) => setPendingCount(outbox.length));
    localDb.getMetadata('last_successful_sync').then((time) => {
      if (time) setLastSyncTime(new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    });

    const unsubscribe = syncEngine.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });

    return unsubscribe;
  }, []);

  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    syncEngine.setOnlineStatus(nextState);
  };

  const triggerSync = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    const result = await syncEngine.syncPendingOutbox();
    setIsSyncing(false);

    const pending = await localDb.getPendingOutbox();
    setPendingCount(pending.length);

    const time = await localDb.getMetadata('last_successful_sync');
    if (time) {
      setLastSyncTime(new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    return result;
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        lastSyncTime,
        isSyncing,
        toggleNetwork,
        triggerSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);

