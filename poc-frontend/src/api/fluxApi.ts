import api from './axiosConfig';
import { Flux, FluxRequest, PageResponse } from '../types';

export const getAllFlux = (page = 0, size = 10) =>
  api.get<PageResponse<Flux>>('/flux', { params: { page, size } }).then(r => r.data);

export const getFluxById = (id: number) =>
  api.get<Flux>(`/flux/${id}`).then(r => r.data);

export const createFlux = (data: FluxRequest) =>
  api.post<Flux>('/flux', data).then(r => r.data);

export const updateFlux = (id: number, data: FluxRequest) =>
  api.put<Flux>(`/flux/${id}`, data).then(r => r.data);

export const deleteFlux = (id: number) =>
  api.delete(`/flux/${id}`);

export const activateFlux = (id: number) =>
  api.post<Flux>(`/flux/${id}/activate`).then(r => r.data);

export const deactivateFlux = (id: number) =>
  api.post<Flux>(`/flux/${id}/deactivate`).then(r => r.data);
