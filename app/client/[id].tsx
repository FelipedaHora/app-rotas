import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, MapPin, Crosshair, Phone, MoveVertical as MoreVertical, X } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { getCurrentLocation, geocodeAddress, openMaps, openPhone } from '@/utils/locationUtils';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, updateClient, deleteClient } = useAppData();
  
  const clientId = Array.isArray(id) ? id[0] : id;
  const client = useMemo(() => {
    return data.clients.find(c => c.id === clientId);
  }, [data.clients, clientId]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone || '');
      setAddress(client.location.address || '');
      setCoordinates(`${client.location.lat.toFixed(6)}, ${client.location.lng.toFixed(6)}`);
      setLocation(client.location);
    }
  }, [client]);

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setAddress(currentLocation.address || '');
      setCoordinates(`${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização atual. Verifique as permissões.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Erro', 'Digite um endereço para buscar.');
      return;
    }

    setLoadingLocation(true);
    try {
      const geocodedLocation = await geocodeAddress(address);
      setLocation(geocodedLocation);
      setCoordinates(`${geocodedLocation.lat.toFixed(6)}, ${geocodedLocation.lng.toFixed(6)}`);
    } catch (error) {
      Alert.alert('Erro', 'Endereço não encontrado. Tente um endereço mais específico.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleParseCoordinates = () => {
    const coords = coordinates.split(',').map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setLocation({
        lat: coords[0],
        lng: coords[1],
        address: address || undefined,
      });
    } else {
      Alert.alert('Erro', 'Formato de coordenadas inválido. Use: latitude, longitude');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório.');
      return;
    }

    if (!location) {
      Alert.alert('Erro', 'A localização do cliente é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      await updateClient(clientId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        location,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o cliente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = () => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir ${name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteClient(clientId);
            router.back();
          }
        },
      ]
    );
  };

  const handleOpenMaps = () => {
    if (location) {
      openMaps(location.lat, location.lng);
    }
  };

  const handleOpenPhone = () => {
    if (phone) {
      openPhone(phone);
    }
  };

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Cliente não encontrado</Text>
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
        
        <Text style={styles.title}>Editar Cliente</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDeleteClient} style={styles.deleteActionButton}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            onPress={handleOpenPhone}
            style={[styles.quickActionButton, !phone && styles.quickActionButtonDisabled]}
            disabled={!phone}
          >
            <Phone size={20} color={phone ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[styles.quickActionText, !phone && styles.quickActionTextDisabled]}>
              Ligar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenMaps} style={styles.quickActionButton}>
            <MapPin size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Mapa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do cliente"
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização *</Text>
          
          <View style={styles.locationMethods}>
            <TouchableOpacity 
              onPress={handleGetCurrentLocation}
              style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]}
              disabled={loadingLocation}
            >
              <Crosshair size={20} color="#FFFFFF" />
              <Text style={styles.locationButtonText}>
                {loadingLocation ? 'Obtendo...' : 'Usar Local Atual'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity 
              onPress={handleGeocodeAddress}
              style={styles.geocodeButton}
              disabled={loadingLocation}
            >
              <MapPin size={16} color="#3B82F6" />
              <Text style={styles.geocodeButtonText}>Buscar no Mapa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Coordenadas (latitude, longitude)</Text>
            <TextInput
              style={styles.input}
              value={coordinates}
              onChangeText={setCoordinates}
              placeholder="-23.550520, -46.633309"
              placeholderTextColor="#9CA3AF"
              onBlur={handleParseCoordinates}
              readOnly
            />
          </View>

          {location && (
            <View style={styles.locationPreview}>
              <Text style={styles.locationPreviewTitle}>Localização Confirmada</Text>
              <Text style={styles.locationPreviewCoords}>
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Text>
              {location.address && (
                <Text style={styles.locationPreviewAddress}>{location.address}</Text>
              )}
            </View>
          )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  deleteActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FF0000',
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickActionButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionTextDisabled: {
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },  
  coordenadasInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 48,
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
    minHeight: 48,
  },
  locationMethods: {
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  geocodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  geocodeButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  locationPreview: {
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  locationPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  locationPreviewCoords: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 2,
  },
  locationPreviewAddress: {
    fontSize: 12,
    color: '#15803D',
  },
});