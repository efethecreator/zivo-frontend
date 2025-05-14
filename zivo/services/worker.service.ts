import { api } from "../utils/api";
import type { Worker } from "../types";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export interface WorkerType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const createWorker = async (data: {
  businessId: string;
  userId: string;
  workerTypeId: string;
}): Promise<Worker> => {
  const response = await api.post("/business-workers", data);
  return response.data;
};

export const getBusinessWorkers = async (
  businessId: string
): Promise<Worker[]> => {
  const response = await api.get(`/business-workers/${businessId}`);
  return response.data;
};

export const getWorkerById = async (id: string): Promise<Worker> => {
  const response = await api.get(`/workers/${id}`);
  return response.data;
};

export const updateWorker = async (
  id: string,
  data: {
    workerTypeId?: string;
  }
): Promise<Worker> => {
  const response = await api.put(`/business-workers/${id}`, data);
  return response.data;
};

export const deleteWorker = async (id: string): Promise<void> => {
  await api.delete(`/business-workers/${id}`);
};

export const createWorkerType = async (data: {
  name: string;
}): Promise<WorkerType> => {
  const response = await api.post("/worker-types", data);
  return response.data;
};

export const getAllWorkerTypes = async (): Promise<WorkerType[]> => {
  const response = await api.get("/worker-types");
  return response.data;
};

export const getWorkerTypeById = async (id: string): Promise<WorkerType> => {
  const response = await api.get(`/worker-types/${id}`);
  return response.data;
};

export const updateWorkerType = async (
  id: string,
  data: {
    name?: string;
  }
): Promise<WorkerType> => {
  const response = await api.put(`/worker-types/${id}`, data);
  return response.data;
};

export const getWorkersByServiceId = async (
  serviceId: string
): Promise<Worker[]> => {
  const response = await api.get(`/services/${serviceId}/workers`);
  return response.data.map((sw: any) => sw.worker); // çünkü backend'de `worker` nested dönüyor
};

// Mutation hooks
export const useCreateWorkerMutation = () => {
  const { invalidateWorkers } = useInvalidateAppData();

  return useMutation({
    mutationFn: createWorker,
    onSuccess: (_, variables) => {
      invalidateWorkers(variables.businessId);
    },
  });
};

export const useUpdateWorkerMutation = () => {
  const { invalidateWorkers } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { workerTypeId?: string };
    }) => updateWorker(id, data),
    onSuccess: () => {
      invalidateWorkers();
    },
  });
};

export const useDeleteWorkerMutation = () => {
  const { invalidateWorkers } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      invalidateWorkers();
    },
  });
};

export const useCreateWorkerTypeMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: createWorkerType,
    onSuccess: () => {
      invalidateAll(); // Worker tipi eklendiğinde tüm verileri yenile
    },
  });
};

export const useUpdateWorkerTypeMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) =>
      updateWorkerType(id, data),
    onSuccess: () => {
      invalidateAll(); // Worker tipi güncellendiğinde tüm verileri yenile
    },
  });
};
