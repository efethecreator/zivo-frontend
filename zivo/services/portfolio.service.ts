import { api } from '../utils/api';

export interface PortfolioItem {
  id: string;
  businessId: string;
  imageUrl: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const getBusinessPortfolio = async (businessId: string) => {
  const response = await api.get<PortfolioItem[]>(`/portfolios/public/business/${businessId}`);
  return response.data;
};

export const addPortfolioItem = async (businessId: string, data: {
  imageUrl: string;
  title: string;
  description?: string;
}) => {
  const response = await api.post<PortfolioItem>(`/portfolios/business/${businessId}`, data);
  return response.data;
};

export const updatePortfolioItem = async (businessId: string, itemId: string, data: {
  imageUrl?: string;
  title?: string;
  description?: string;
}) => {
  const response = await api.put<PortfolioItem>(`/portfolios/business/${businessId}/${itemId}`, data);
  return response.data;
};

export const deletePortfolioItem = async (businessId: string, itemId: string) => {
  const response = await api.delete<void>(`/portfolios/business/${businessId}/${itemId}`);
  return response.data;
}; 