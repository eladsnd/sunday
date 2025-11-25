import axios from 'axios';
import type { Board, Group } from '../types/board.types';

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

export const groupsApi = {
    create: (data: { name: string; boardId: string; color?: string }) =>
        api.post<Group>('/groups', data).then((res) => res.data),

    delete: (id: string) => api.delete(`/groups/${id}`),

    updatePosition: (id: string, data: { position: number }) =>
        api.patch<Group>(`/groups/${id}/position`, data).then((res) => res.data),
};

export const columnsApi = {
    create: (data: { boardId: string; label: string; type: string }) =>
        api.post('/columns', data).then((res) => res.data),

    delete: (id: string) => api.delete(`/columns/${id}`),

    update: (id: string, data: any) => api.patch(`/columns/${id}`, data),
};

export const automationsApi = {
    create: (data: {
        boardId: string;
        triggerType: string;
        triggerConfig: any;
        actionType: string;
        actionConfig: any;
    }) => api.post('/automations', data).then((res) => res.data),

    getAll: (boardId: string) =>
        api.get(`/automations?boardId=${boardId}`).then((res) => res.data),

    delete: (id: string) => api.delete(`/automations/${id}`).then((res) => res.data),
};
