import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '@/types';

const STORAGE_KEY = 'routes_app_data';

export const getStoredData = async (): Promise<AppData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
    return getDefaultData();
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
};

export const storeData = async (data: AppData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    console.log('Saving data:', jsonValue);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const getDefaultData = (): AppData => ({
  clients: [],
  routes: [],
  weeklyStatus: {
    weekKey: '',
    attended: {},
  },
});