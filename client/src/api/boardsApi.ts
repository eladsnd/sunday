import axios from 'axios';
import type { Board } from '../types/board.types';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const boardsApi = {
    getAll: () => api.get<Board[]>('/boards'),

    getOne: (id: string) => api.get<Board>(`/boards/${id}`),

    create: (data: { name: string; description?: string }) =>
        api.post<Board>('/boards', data),

    seedJobSearch: () => api.post<Board>('/boards/seed'),

    update: (id: string, data: { name?: string; description?: string }) =>
        api.patch<Board>(`/boards/${id}`, data),

    delete: (id: string) => api.delete(`/boards/${id}`),
};

export const itemsApi = {
    create: (data: { name: string; groupId: string; boardId: string }) =>
        api.post('/items', data),

    update: (id: string, data: { name?: string }) =>
        api.patch(`/items/${id}`, data),

    updatePosition: (id: string, data: { position: number; groupId?: string }) =>
        api.patch(`/items/${id}/position`, data),

    delete: (id: string) => api.delete(`/items/${id}`),
};

export const cellsApi = {
    updateValue: (itemId: string, columnId: string, value: any) =>
        api.patch(`/cells/${itemId}/${columnId}`, { value }),
};
