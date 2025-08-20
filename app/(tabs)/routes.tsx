import { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { Search, Plus, RouteIcon } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { RouteCard } from '@/components/RouteCard';
import { useAppData } from '@/hooks/useAppData';
import { useRouter } from 'expo-router';

export default function RoutesScreen() {
  const { data, loading, refreshData } = useAppData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return data.routes;
    
    return data.routes.filter(route =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data.routes, searchQuery]);

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

  const getRouteAttendedCount = (routeId: string) => {
    const routeAttended = data.weeklyStatus.attended[routeId] || {};
    return Object.values(routeAttended).filter(status => status.checked).length;
  };

  const handleRoutePress = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };

  const handleAddRoute = () => {
    router.push('/route/new');
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
          <Text style={styles.title}>Rotas</Text>
          <Text style={styles.subtitle}>
            {data.routes.length} rotas cadastradas
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleAddRoute} style={styles.addButton}>
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
            placeholder="Buscar rota..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
              title="Atualizando rotas..."
              titleColor="#6B7280"
            />
          }
        >
          {filteredRoutes.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Nenhuma rota encontrada" : "Nenhuma rota cadastrada"}
              description={searchQuery ? "Tente buscar com outros termos" : "Toque no botão + para criar sua primeira rota."}
              icon={<RouteIcon size={48} color="#9CA3AF" />}
            />
          ) : (
            filteredRoutes.filter(route => route != null).map(route => (
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
});