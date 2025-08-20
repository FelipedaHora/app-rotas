import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Route } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { RouteCard } from '@/components/RouteCard';
import { EmptyState } from '@/components/EmptyState';
import { getCurrentDayOfWeek, formatDayName } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';

export default function TodayScreen() {
  const { data, loading, resetWeek } = useAppData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const currentDay = getCurrentDayOfWeek();
  
  const todaysRoutes = useMemo(() => {
    return data.routes.filter(route => 
      route.daysOfWeek.includes(currentDay as any)
    );
  }, [data.routes, currentDay]);

  const getRouteAttendedCount = (routeId: string) => {
    const routeAttended = data.weeklyStatus.attended[routeId] || {};
    return Object.values(routeAttended).filter(status => status.checked).length;
  };

  const handleRoutePress = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };

  const handleResetWeek = () => {
    Alert.alert(
      'Resetar Semana',
      'Tem certeza que deseja resetar todos os atendimentos da semana? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar', 
          style: 'destructive',
          onPress: async () => {
            setRefreshing(true);
            await resetWeek();
            setRefreshing(false);
          }
        },
      ]
    );
  };

  const totalClients = useMemo(() => {
    return todaysRoutes.reduce((total, route) => total + route.clientOrder.length, 0);
  }, [todaysRoutes]);

  const totalAttended = useMemo(() => {
    return todaysRoutes.reduce((total, route) => total + getRouteAttendedCount(route.id), 0);
  }, [todaysRoutes, data.weeklyStatus.attended]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hoje - {formatDayName(currentDay)}</Text>
          <Text style={styles.subtitle}>
            {totalAttended}/{totalClients} clientes atendidos
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleResetWeek} style={styles.resetButton}>
          <RefreshCw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {todaysRoutes.length === 0 ? (
          <EmptyState
            title="Nenhuma rota hoje"
            description="Crie uma rota e atribua ao dia da semana para começar."
            icon={<Route size={48} color="#9CA3AF" />}
          />
        ) : (
          todaysRoutes.filter(route => route != null).map(route => (
            <RouteCard
              key={route.id}
              route={route}
              clients={data.clients.filter(client => 
                route.clientOrder.includes(client.id)
              )}
              attendedCount={getRouteAttendedCount(route.id)}
              onPress={() => handleRoutePress(route.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});