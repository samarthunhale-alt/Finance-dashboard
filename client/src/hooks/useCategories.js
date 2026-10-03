import { categoriesApi } from '../services/endpoints.js';
import { useFetch } from './useFetch.js';

export function useCategories() {
  const { data, loading, error, reload } = useFetch(() => categoriesApi.list(), []);
  return { categories: data || [], loading, error, reload };
}
