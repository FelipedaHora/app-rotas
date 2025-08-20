import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Plus, X } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { ClientCard } from '@/components/ClientCard';
import { SearchBar } from '@/components/SearchBar';
import { DayOfWeek } from '@/types';
import { formatDayName } from '@/utils/dateUtils';

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function EditRouteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, updateRoute } = useAppData();
  
  const routeId = Array.isArray(id) ? id[0] : id;
  const route = useMemo(() => {
    return data.routes.find(r => r.id === routeId);
  }, [data.routes, routeId]);

  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [clientOrder, setClientOrder] = useState<string[]>([]);
  const [showAddClients, setShowAddClients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (route) {
      setName(route.name);
      setSelectedDays(route.daysOfWeek);
      setClientOrder(route.clientOrder);
    }
  }, [route]);

  const routeClients = useMemo(() => {
    return clientOrder
      .map(clientId => data.clients.find(c => c.id === clientId))
      .filter(Boolean) as any[];
  }, [clientOrder, data.clients]);

  const availableClients = useMemo(() => {
    const routeClientIds = new Set(clientOrder);
    return data.clients.filter(client => 
      !routeClientIds.has(client.id) &&
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data.clients, clientOrder, searchQuery]);

  const handleToggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAddClient = (clientId: string) => {
    setClientOrder(prev => [...prev, clientId]);
  };

  const handleRemoveClient = (clientId: string) => {
    setClientOrder(prev => prev.filter(id => id !== clientId));
  };

  const handleMoveClient = (clientId: string, direction: 'up' | 'down') => {
    const index = clientOrder.indexOf(clientId);
    if (index === -1) return;

    const newOrder = [...clientOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      setClientOrder(newOrder);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da rota é obrigatório.');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana.');
      return;
    }

    setSaving(true);
    try {
      await updateRoute(routeId, {
        name: name.trim(),
        daysOfWeek: selectedDays,
        clientOrder,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a rota.');
    } finally {
      setSaving(false);
    }
  };

  if (!route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Rota não encontrada</Text>
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
        
        <Text style={styles.title}>Editar Rota</Text>

        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nome da Rota</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Rota Centro, Rota Norte..."
            placeholderTextColor="#9CA3AF"
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dias da Semana</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => handleToggleDay(day)}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.dayButtonSelected
                ]}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDays.includes(day) && styles.dayButtonTextSelected
                ]}>
                  {formatDayName(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes da Rota</Text>
            <TouchableOpacity 
              onPress={() => setShowAddClients(!showAddClients)}
              style={styles.addButton}
            >
              {showAddClients ? <X size={20} color="#FFFFFF" /> : <Plus size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          {showAddClients && (
            <View style={styles.addClientsSection}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar cliente para adicionar..."
              />
              {availableClients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => handleAddClient(client.id)}
                  style={styles.availableClientItem}
                >
                  <Text style={styles.availableClientName}>{client.name}</Text>
                  <Plus size={16} color="#10B981" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {routeClients.map((client, index) => (
            <View key={client.id} style={styles.routeClientItem}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientOrder}>{index + 1}</Text>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  {client.location.address && (
                    <Text style={styles.clientAddress}>{client.location.address}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.clientActions}>
                <TouchableOpacity 
                  onPress={() => handleMoveClient(client.id, 'up')}
                  style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                  disabled={index === 0}
                >
                  <Text style={styles.moveButtonText}>↑</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleMoveClient(client.id, 'down')}
                  style={[styles.moveButton, index === routeClients.length - 1 && styles.moveButtonDisabled]}
                  disabled={index === routeClients.length - 1}
                >
                  <Text style={styles.moveButtonText}>↓</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleRemoveClient(client.id)}
                  style={styles.removeButton}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  addClientsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availableClientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  availableClientName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  routeClientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientOrder: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 12,
    minWidth: 24,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  clientAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  moveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});