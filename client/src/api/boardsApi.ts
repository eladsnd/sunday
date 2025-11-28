import { apiClient } from './axios.config';
import type { Board, Group } from '../types/board.types';

export const boardsApi = {
    getAll: () => apiClient.get<Board[]>('/boards'),

    getOne: (id: string) => apiClient.get<Board>(`/boards/${id}`),

    create: (data: { name: string; description?: string }) =>
        apiClient.post<Board>('/boards', data),

    seedJobSearch: () => apiClient.post<Board>('/boards/seed'),

    update: (id: string, data: { name?: string; description?: string }) =>
        apiClient.patch<Board>(`/boards/${id}`, data),

    delete: (id: string) => apiClient.delete(`/boards/${id}`),
};

export const itemsApi = {
    create: (data: { name: string; groupId: string; boardId: string }) =>
        apiClient.post('/items', data),

    update: (id: string, data: { name?: string }) =>
        apiClient.patch(`/items/${id}`, data),

    updatePosition: (id: string, data: { position: number; groupId?: string }) =>
        apiClient.patch(`/items/${id}/position`, data),

    delete: (id: string) => apiClient.delete(`/items/${id}`),
};

export const cellsApi = {
    updateValue: (itemId: string, columnId: string, value: any) =>
        apiClient.patch(`/cells/${itemId}/${columnId}`, { value }),
};

export const groupsApi = {
    create: (data: { name: string; boardId: string; color?: string }) =>
        apiClient.post<Group>('/groups', data).then((res) => res.data),

    delete: (id: string) => apiClient.delete(`/groups/${id}`),

    updatePosition: (id: string, data: { position: number }) =>
        apiClient.patch<Group>(`/groups/${id}/position`, data).then((res) => res.data),
};

export const columnsApi = {
    create: (data: { boardId: string; label: string; type: string }) =>
        apiClient.post('/columns', data).then((res) => res.data),

    delete: (id: string) => apiClient.delete(`/columns/${id}`),

    update: (id: string, data: any) => apiClient.patch(`/columns/${id}`, data),
};

export const automationsApi = {
    create: (data: {
        boardId: string;
        triggerType: string;
        triggerConfig: any;
        actionType: string;
        actionConfig: any;
    }) => apiClient.post('/automations', data).then((res) => res.data),

    getAll: (boardId: string) =>
        apiClient.get(`/automations?boardId=${boardId}`).then((res) => res.data),

    delete: (id: string) => apiClient.delete(`/automations/${id}`).then((res) => res.data),
};
