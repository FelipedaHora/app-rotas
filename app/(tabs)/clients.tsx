import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, Search } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { ClientCard } from '@/components/ClientCard';
import { EmptyState } from '@/components/EmptyState';
import { useRouter } from 'expo-router';

export default function ClientsScreen() {
  const { data, loading, deleteClient, refreshData } = useAppData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredClients = useMemo(() => {
    let clients = data.clients;

    if (searchQuery.trim()) {
      clients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery) ||
        client.location.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return clients;
  }, [data.clients, searchQuery]);

  // 🔄 Função para refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleClientPress = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  const handleAddClient = () => {
    router.push('/client/new');
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir ${clientName}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteClient(clientId)
        },
      ]
    );
  };

  if (loading && !refreshing) {
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
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>
            {data.clients.length} clientes cadastrados
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleAddClient} style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* ✅ SearchBar customizado com TextInput */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery} // ✅ Agora funciona corretamente
            placeholder="Buscar cliente..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* 🔄 ScrollView com RefreshControl */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']} // Android
              tintColor="#3B82F6"   // iOS
              title="Atualizando clientes..." // iOS
              titleColor="#6B7280"           // iOS
            />
          }
        >
          {filteredClients.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              description={searchQuery ? "Tente buscar com outros termos" : "Toque no botão + para cadastrar seu primeiro cliente."}
              icon={<Users size={48} color="#9CA3AF" />}
            />
          ) : (
            filteredClients.map(client => (
              <TouchableOpacity
                key={client.id}
                onPress={() => handleClientPress(client.id)}
                onLongPress={() => handleDeleteClient(client.id, client.name)}
              >
                <ClientCard client={client} showActions={false} />
              </TouchableOpacity>
            ))
          )}

          {/* 🔄 Indicador visual quando está atualizando */}
          {refreshing && (
            <View style={styles.refreshingIndicator}>
              <Text style={styles.refreshingText}>Atualizando...</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // ✅ Estilos para o SearchBar customizado
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  refreshingIndicator: {
    padding: 20,
    alignItems: 'center',
  },
  refreshingText: {
    color: '#6B7280',
    fontSize: 14,
  },
});