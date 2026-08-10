import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage() {
  const getItem = useCallback(async (key: string) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Erro ao ler ${key} do AsyncStorage:`, error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key} no AsyncStorage:`, error);
      return false;
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao remover ${key} do AsyncStorage:`, error);
      return false;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Erro ao limpar AsyncStorage:', error);
      return false;
    }
  }, []);

  return { getItem, setItem, removeItem, clearAll };
}
