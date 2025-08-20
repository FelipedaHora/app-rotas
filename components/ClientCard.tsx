import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Phone, MapPin, CheckCircle2, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Client } from '@/types';
import { openMaps, openPhone } from '@/utils/locationUtils';

interface ClientCardProps {
  client: Client;
  isAttended?: boolean;
  checkedAt?: string;
  onToggleAttended?: () => void;
  showActions?: boolean;
}

export function ClientCard({ 
  client, 
  isAttended = false, 
  checkedAt, 
  onToggleAttended, 
  showActions = true 
}: ClientCardProps) {
  const handleToggleAttended = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync();
    }
    onToggleAttended?.();
  };

  const handleOpenMaps = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    openMaps(client.location.lat, client.location.lng);
  };

  const handleOpenPhone = () => {
    if (client.phone) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      openPhone(client.phone);
    }
  };

  return (
    <View style={[styles.container, isAttended && styles.attendedContainer]}>
      <View style={styles.header}>
        {onToggleAttended && (
          <TouchableOpacity onPress={handleToggleAttended} style={styles.checkbox}>
            {isAttended ? (
              <CheckCircle2 size={24} color="#10B981" />
            ) : (
              <Circle size={24} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.info}>
          <Text style={[styles.name, isAttended && styles.attendedText]}>
            {client.name}
          </Text>
          {client.location.address && (
            <Text style={[styles.address, isAttended && styles.attendedText]}>
              {client.location.address}
            </Text>
          )}
          {isAttended && checkedAt && (
            <Text style={styles.checkedTime}>
              Atendido às {new Date(checkedAt).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleOpenPhone}
            style={[styles.actionButton, !client.phone && styles.disabledButton]}
            disabled={!client.phone}
          >
            <Phone size={20} color={client.phone ? "#3B82F6" : "#9CA3AF"} />
            <Text style={[styles.actionText, !client.phone && styles.disabledText]}>
              Ligar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenMaps} style={styles.actionButton}>
            <MapPin size={20} color="#10B981" />
            <Text style={styles.actionText}>Mapa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attendedContainer: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  attendedText: {
    color: '#6B7280',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  checkedTime: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});