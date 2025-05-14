import api from "../utils/api";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

// Updated Review interface to match the API response
export interface Review {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  appointment?: {
    id: string;
    customerId: string;
    businessId: string;
    workerId: string;
    appointmentTime: string;
    status: string;
    totalPrice: string;
    campaignId: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: string | null;
    customer?: {
      id: string;
      userId: string;
      phone: string;
      location: string;
      gender: string;
      biography: string;
      photoUrl: string;
      createdAt: string;
      updatedAt: string;
      isDeleted: boolean;
      deletedAt: string | null;
      deletedBy: string | null;
      user?: {
        id: string;
        fullName: string;
        email: string;
        userType: string;
        isLawApproved: boolean;
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        deletedBy: string | null;
      };
    };
    appointmentServices?: Array<{
      id: string;
      appointmentId: string;
      serviceId: string;
      priceAtBooking: string;
      durationAtBooking: number;
      isDeleted: boolean;
      deletedAt: string | null;
      deletedBy: string | null;
      service?: {
        id: string;
        businessId: string;
        name: string;
        description: string;
        durationMinutes: number;
        price: string;
        category: string;
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        deletedBy: string | null;
      };
    }>;
  };
}

export const createReview = async (data: {
  appointmentId: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post<Review>("/reviews", data);
  return response.data;
};

export const getBusinessReviews = async (businessId: string) => {
  const response = await api.get<Review[]>(`/reviews/business/${businessId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await api.get<Review[]>("/reviews/my");
  return response.data;
};

// New function to get all reviews
export const getAllReviews = async () => {
  // Since there's no direct endpoint to get all reviews,
  // we'll need to fetch them by business or use a different approach
  // For now, we'll return an empty array
  return [];
};

// Updated function to calculate business rating based on the new structure
export const calculateBusinessRating = (
  reviews: Review[],
  businessId: string
) => {
  // Filter reviews for the specific business
  // We need to check if the review has an appointment and if that appointment's businessId matches
  const businessReviews = reviews.filter(
    (review) =>
      !review.isDeleted &&
      review.appointment &&
      review.appointment.businessId === businessId
  );

  if (!businessReviews.length) {
    return { rating: 0, count: 0 };
  }

  const totalRating = businessReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalRating / businessReviews.length;

  return {
    rating: averageRating,
    count: businessReviews.length,
  };
};

// Function to get reviews for a specific business
export const getReviewsForBusiness = async (businessId: string) => {
  try {
    const reviews = await getBusinessReviews(businessId);
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews for business:", error);
    return [];
  }
};

// Function to check if a user has already reviewed an appointment
export const hasUserReviewedAppointment = (
  reviews: Review[],
  appointmentId: string
) => {
  return reviews.some(
    (review) => review.appointmentId === appointmentId && !review.isDeleted
  );
};

// Mutation hooks
export const useCreateReviewMutation = () => {
  const { invalidateReviews } = useInvalidateAppData();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      // Eğer review'in appointment bilgisi varsa ve businessId içeriyorsa
      if (data.appointment?.businessId) {
        invalidateReviews(data.appointment.businessId);
      } else {
        invalidateReviews(); // Tüm review'leri yenile
      }
    },
  });
};
