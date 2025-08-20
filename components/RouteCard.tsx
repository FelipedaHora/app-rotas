import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Users } from 'lucide-react-native';
import { Route, Client } from '@/types';
import { formatDayName } from '@/utils/dateUtils';

interface RouteCardProps {
  route: Route;
  clients: Client[];
  attendedCount: number;
  onPress: () => void;
}

export function RouteCard({ route, clients, attendedCount, onPress }: RouteCardProps) {
  const totalClients = route.clientOrder.length;
  const progressPercentage = totalClients > 0 ? (attendedCount / totalClients) * 100 : 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{route.name}</Text>
          <Text style={styles.days}>
            {route.daysOfWeek.map(day => formatDayName(day)).join(', ')}
          </Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.statText}>
            {attendedCount}/{totalClients} atendidos
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
          />
        </View>
      </View>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  days: {
    fontSize: 14,
    color: '#6B7280',
  },
  stats: {
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});