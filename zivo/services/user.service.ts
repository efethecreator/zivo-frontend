import api from "./api";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer" | "business" | "store_owner" | "admin";
  profile?: {
    phone?: string;
    location?: string;
    gender?: string;
    biography?: string;
    photoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: {
    fullName?: string;
    email?: string;
  }
): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const updateMyProfile = async (data: {
  phone?: string;
  location?: string;
  gender?: string;
  biography?: string;
  photoUrl?: string;
}): Promise<User> => {
  const response = await api.put("/profile", data);
  return response.data;
};

export const uploadProfilePhoto = async (imageUri: string): Promise<User> => {
  // Create form data
  const formData = new FormData();

  // Get the file name from the URI
  const uriParts = imageUri.split("/");
  const fileName = uriParts[uriParts.length - 1];

  // Determine the file type
  const fileType = fileName.split(".").pop();

  // Append the image to form data
  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type: `image/${fileType}`,
  } as any);

  // Send the request
  const response = await api.put("/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getMe = async (): Promise<User> => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Mutation hooks
export const useUpdateUserMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { fullName?: string; email?: string };
    }) => updateUser(id, data),
    onSuccess: () => {
      invalidateProfile();
    },
  });
};

export const useUpdateMyProfileMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      invalidateProfile();
    },
  });
};

export const useUploadProfilePhotoMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      invalidateProfile();
    },
  });
};

export const useDeleteUserMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      invalidateAll(); // Kullanıcı silindiğinde tüm verileri yenile
    },
  });
};
