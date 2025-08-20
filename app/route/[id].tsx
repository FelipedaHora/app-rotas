import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, MoveVertical as MoreVertical, Users } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { ClientCard } from '@/components/ClientCard';
import { EmptyState } from '@/components/EmptyState';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, loading, toggleClientAttended, deleteRoute } = useAppData();
  
  const routeId = Array.isArray(id) ? id[0] : id;
  
  const route = useMemo(() => {
    return data.routes.find(r => r.id === routeId);
  }, [data.routes, routeId]);

  const clients = useMemo(() => {
    if (!route) return [];
    return route.clientOrder
      .map(clientId => data.clients.find(c => c.id === clientId))
      .filter(Boolean) as any[];
  }, [route, data.clients]);

  const attendedStatus = useMemo(() => {
    return data.weeklyStatus.attended[routeId] || {};
  }, [data.weeklyStatus.attended, routeId]);

  const attendedCount = useMemo(() => {
    return Object.values(attendedStatus).filter(status => status.checked).length;
  }, [attendedStatus]);

  const handleToggleAttended = async (clientId: string) => {
    await toggleClientAttended(routeId, clientId);
  };

  const handleEditRoute = () => {
    router.push(`/route/edit/${routeId}`);
  };

  const handleDeleteRoute = () => {
    Alert.alert(
      'Excluir Rota',
      `Tem certeza que deseja excluir a rota "${route?.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteRoute(routeId);
            router.back();
          }
        },
      ]
    );
  };

  if (loading || !route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{route.name}</Text>
          <Text style={styles.subtitle}>
            {attendedCount}/{clients.length} atendidos
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEditRoute} style={styles.actionButton}>
            <Edit size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDeleteRoute} style={styles.actionButton}>
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {clients.length === 0 ? (
          <EmptyState
            title="Nenhum cliente na rota"
            description="Toque em editar para adicionar clientes a esta rota."
            icon={<Users size={48} color="#9CA3AF" />}
          />
        ) : (
          <>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${clients.length > 0 ? (attendedCount / clients.length) * 100 : 0}%` }
                ]} 
              />
            </View>
            
            {clients.map((client, index) => {
              const status = attendedStatus[client.id];
              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  isAttended={status?.checked || false}
                  checkedAt={status?.checkedAt}
                  onToggleAttended={() => handleToggleAttended(client.id)}
                />
              );
            })}
          </>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});