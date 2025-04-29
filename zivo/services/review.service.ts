import { api } from '../utils/api';

export interface Review {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const createReview = async (data: {
  appointmentId: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post<Review>('/reviews', data);
  return response.data;
};

export const getBusinessReviews = async (businessId: string) => {
  const response = await api.get<Review[]>(`/reviews/business/${businessId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await api.get<Review[]>('/reviews/my');
  return response.data;
};

