import { api } from "../utils/api"

export interface PortfolioItem {
  id: string;
  businessId: string;
  imageUrl: string;
  description: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const getBusinessPortfolio = async (businessId: string) => {
  const response = await api.get<PortfolioItem[]>(`/portfolios/public/business/${businessId}`)
  return response.data
}

export const getPortfolioItemDetails = async (businessId: string, itemId: string) => {
  const response = await api.get<PortfolioItem>(`/portfolios/public/business/${businessId}/${itemId}`)
  return response.data
}



