import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, MapPin, Crosshair } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { getCurrentLocation, geocodeAddress } from '@/utils/locationUtils';

export default function NewClientScreen() {
  const router = useRouter();
  const { addClient } = useAppData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    console.log('chamou o botao');
    setSaving(true);
    try {
      await addClient({
        name: name.trim(),
        phone: phone.trim() || undefined,
        location,
      });
      router.back();
    } catch (error) {
      // Alert.alert('Erro', 'Não foi possível salvar o cliente.');
      Alert.alert('Erro', 'Não foi possível salvar o cliente.');

    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Novo Cliente</Text>

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