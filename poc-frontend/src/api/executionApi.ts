import api from './axiosConfig';
import { Execution, ExecutionLog, PageResponse } from '../types';

export const triggerExecution = (fluxId: number) =>
  api.post<Execution>(`/executions/flux/${fluxId}`).then(r => r.data);

export const getExecutions = (params?: { status?: string; fluxId?: number; page?: number; size?: number }) =>
  api.get<PageResponse<Execution>>('/executions', { params }).then(r => r.data);

export const getExecutionById = (id: number) =>
  api.get<Execution>(`/executions/${id}`).then(r => r.data);

export const getExecutionLogs = (id: number) =>
  api.get<ExecutionLog[]>(`/executions/${id}/logs`).then(r => r.data);

export const cancelExecution = (id: number) =>
  api.post<Execution>(`/executions/${id}/cancel`).then(r => r.data);

export const downloadFile = (id: number) =>
  api.get(`/executions/${id}/file`, { responseType: 'blob' }).then(r => r.data);
