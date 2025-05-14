import { api } from "../utils/api";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

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
  const response = await api.get<PortfolioItem[]>(
    `/portfolios/public/business/${businessId}`
  );
  return response.data;
};

export const getPortfolioItemDetails = async (
  businessId: string,
  itemId: string
) => {
  const response = await api.get<PortfolioItem>(
    `/portfolios/public/business/${businessId}/${itemId}`
  );
  return response.data;
};

export const createPortfolioItem = async (data: {
  businessId: string;
  imageUrl: string;
  description: string;
}): Promise<PortfolioItem> => {
  const response = await api.post("/portfolios", data);
  return response.data;
};

export const updatePortfolioItem = async (
  id: string,
  data: {
    description?: string;
    imageUrl?: string;
  }
): Promise<PortfolioItem> => {
  const response = await api.put(`/portfolios/${id}`, data);
  return response.data;
};

export const deletePortfolioItem = async (id: string): Promise<void> => {
  await api.delete(`/portfolios/${id}`);
};

// Mutation hooks
export const useCreatePortfolioItemMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: (_, variables) => {
      invalidateBusiness(variables.businessId);
      // Ayrıca portfolio query'lerini de invalidate edebiliriz
      // Ancak şu anda useInvalidateAppData içinde portfolio için özel bir method yok
      // İhtiyaç olursa eklenebilir
    },
  });
};

export const useUpdatePortfolioItemMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { description?: string; imageUrl?: string };
    }) => updatePortfolioItem(id, data),
    onSuccess: (data) => {
      if (data && data.businessId) {
        invalidateBusiness(data.businessId);
      }
    },
  });
};

export const useDeletePortfolioItemMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: (_, id) => {
      // Burada businessId'yi doğrudan alamıyoruz, bu yüzden
      // ya tüm business'ları invalidate etmeliyiz ya da
      // mutation çağrısında businessId'yi de geçmeliyiz
      invalidateBusiness();
    },
  });
};
