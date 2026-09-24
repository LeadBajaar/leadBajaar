import api from './client';
import { Stage } from './types/stages.types';

export const getStages = async (): Promise<Stage[]> => {
  const response = await api.get<Stage[]>('/stages');
  return response.data;
};

export const createStage = async (data: Partial<Stage>): Promise<Stage> => {
  const response = await api.post<Stage>('/stages', data);
  return response.data;
};

export const updateStage = async (id: number, data: Partial<Stage>): Promise<Stage> => {
  const response = await api.put<Stage>(`/stages/${id}`, data);
  return response.data;
};

export const deleteStage = async (id: number): Promise<void> => {
  await api.delete(`/stages/${id}`);
};

export const reorderStages = async (stages: { id: number; order: number }[]): Promise<void> => {
  await api.post('/stages/reorder', { stages });
};

export const syncDefaultStages = async (): Promise<void> => {
  await api.post('/stages/initialize-default');
};
