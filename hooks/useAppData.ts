import { useState, useEffect, useCallback } from 'react';
import { AppData, Client, Route, WeeklyStatus } from '@/types';
import { getStoredData, storeData } from '@/utils/storage';
import { getCurrentWeekKey } from '@/utils/dateUtils';

export const useAppData = () => {
  const [data, setData] = useState<AppData>({
    clients: [],
    routes: [],
    weeklyStatus: { weekKey: '', attended: {} },
  });
  const [loading, setLoading] = useState(true);

  // Função simples para gerar IDs únicos
  const generateSimpleId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const saveData = useCallback(async (newData: AppData) => {
    await storeData(newData);
    setData(newData);
  }, []);

  const checkWeeklyReset = useCallback((currentData: AppData) => {
    const currentWeekKey = getCurrentWeekKey();
    if (currentData.weeklyStatus.weekKey !== currentWeekKey) {
      const resetData = {
        ...currentData,
        weeklyStatus: {
          weekKey: currentWeekKey,
          attended: {},
        },
      };
      return { data: resetData, wasReset: true };
    }
    return { data: currentData, wasReset: false };
  }, []);

  // 🔄 Função para carregar dados (extraída para reutilização)
  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    
    try {
      console.log('📥 Carregando dados...');
      const storedData = await getStoredData();
      const { data: checkedData, wasReset } = checkWeeklyReset(storedData);
      
      if (wasReset) {
        await storeData(checkedData);
        console.log('🔄 Semana resetada automaticamente');
      }
      
      setData(checkedData);
      console.log('✅ Dados carregados:', {
        clients: checkedData.clients.length,
        routes: checkedData.routes.length
      });
      
      return checkedData;
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      throw error;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [checkWeeklyReset]);

  // 🔄 Função para refresh manual
  const refreshData = useCallback(async () => {
    console.log('🔄 Refresh manual iniciado...');
    return await loadData(false); // Não mostrar loading na tela
  }, [loadData]);

  useEffect(() => {
    loadData(true); // Mostrar loading na primeira carga
  }, [loadData]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      console.log('➕ Adicionando cliente:', client.name);
      const newClient: Client = {
        ...client,
        id: generateSimpleId(),
        createdAt: new Date().toISOString(),
      };
      
      const newData = {
        ...data,
        clients: [...data.clients, newClient],
      };
      await saveData(newData);
      console.log('✅ Cliente adicionado com sucesso');
      return newClient;
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
      throw error;
    }
  }, [data, saveData]);

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    const newData = {
      ...data,
      clients: data.clients.map(client =>
        client.id === clientId ? { ...client, ...updates } : client
      ),
    };
    await saveData(newData);
    console.log('✅ Cliente atualizado');
  }, [data, saveData]);

  const deleteClient = useCallback(async (clientId: string) => {
    const newData = {
      ...data,
      clients: data.clients.filter(client => client.id !== clientId),
      routes: data.routes.map(route => ({
        ...route,
        clientOrder: route.clientOrder.filter(id => id !== clientId),
      })),
    };
    await saveData(newData);
    console.log('✅ Cliente removido');
  }, [data, saveData]);

  const addRoute = useCallback(async (route: Omit<Route, 'id'>) => {
    try {
      console.log('➕ Adicionando rota:', route.name);
      const newRoute: Route = {
        ...route,
        id: generateSimpleId(),
      };
      
      const newData = {
        ...data,
        routes: [...data.routes, newRoute],
      };
      await saveData(newData);
      console.log('✅ Rota adicionada com sucesso:', newRoute.id);
      return newRoute;
    } catch (error) {
      console.error('❌ Erro ao adicionar rota:', error);
      throw error;
    }
  }, [data, saveData]);

  const updateRoute = useCallback(async (routeId: string, updates: Partial<Route>) => {
    const newData = {
      ...data,
      routes: data.routes.map(route =>
        route.id === routeId ? { ...route, ...updates } : route
      ),
    };
    await saveData(newData);
    console.log('✅ Rota atualizada');
  }, [data, saveData]);

  const deleteRoute = useCallback(async (routeId: string) => {
    const newData = {
      ...data,
      routes: data.routes.filter(route => route.id !== routeId),
    };
    // Clean up weekly status for this route
    const { [routeId]: removedRoute, ...remainingAttended } = newData.weeklyStatus.attended;
    newData.weeklyStatus.attended = remainingAttended;
    await saveData(newData);
    console.log('✅ Rota removida');
  }, [data, saveData]);

  const toggleClientAttended = useCallback(async (routeId: string, clientId: string) => {
    const currentStatus = data.weeklyStatus.attended[routeId]?.[clientId];
    const newAttended = { ...data.weeklyStatus.attended };
    
    if (!newAttended[routeId]) {
      newAttended[routeId] = {};
    }
    
    newAttended[routeId][clientId] = {
      checked: !currentStatus?.checked,
      checkedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      weeklyStatus: {
        ...data.weeklyStatus,
        attended: newAttended,
      },
    };
    await saveData(newData);
  }, [data, saveData]);

  const resetWeek = useCallback(async () => {
    const newData = {
      ...data,
      weeklyStatus: {
        weekKey: getCurrentWeekKey(),
        attended: {},
      },
    };
    await saveData(newData);
    console.log('🔄 Semana resetada manualmente');
  }, [data, saveData]);

  return {
    data,
    loading,
    refreshData, // 🔄 Nova função para refresh
    addClient,
    updateClient,
    deleteClient,
    addRoute,
    updateRoute,
    deleteRoute,
    toggleClientAttended,
    resetWeek,
  };
};