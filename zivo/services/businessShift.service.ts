import { api } from "../utils/api";


export const getBusinessShifts = async (businessId: string) => {
  const response = await api.get(`/business-shifts/business/${businessId}`);
  return response.data;
};

export const getShiftTimes = async () => {
  const response = await api.get(`/shift-times`);
  return response.data;
};
