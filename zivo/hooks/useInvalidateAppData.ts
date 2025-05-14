import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateAppData = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["business"] });
    queryClient.invalidateQueries({ queryKey: ["workers"] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    queryClient.invalidateQueries({ queryKey: ["locations"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["workerTypes"] });
    queryClient.invalidateQueries({ queryKey: ["explore"] });
  };

  const invalidateAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const invalidateAppointmentsByDate = (businessId: string, date: string) => {
    queryClient.invalidateQueries({
      queryKey: ["appointments", businessId, date],
    });
  };

  const invalidateBusiness = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["business"] });
    }
  };

  const invalidateServices = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    }
  };

  const invalidateWorkers = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["workers", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    }
  };

  const invalidateReviews = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["reviews", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    }
  };

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  const invalidatePortfolio = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["portfolio", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    }
  };

  const invalidateShifts = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    }
  };

  const invalidateLocations = () => {
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const invalidateExplore = () => {
    queryClient.invalidateQueries({ queryKey: ["explore"] });
  };

  const invalidateCustomers = (businessId?: string) => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ["customers", businessId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  };

  const invalidateWorkerTypes = () => {
    queryClient.invalidateQueries({ queryKey: ["workerTypes"] });
  };

  return {
    invalidateAll,
    invalidateAppointments,
    invalidateAppointmentsByDate,
    invalidateBusiness,
    invalidateServices,
    invalidateWorkers,
    invalidateReviews,
    invalidateProfile,
    invalidateFavorites,
    invalidatePortfolio,
    invalidateShifts,
    invalidateLocations,
    invalidateExplore,
    invalidateCustomers,
    invalidateWorkerTypes,
  };
};
