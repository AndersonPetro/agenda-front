export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
  phone?: string;
}

export interface PaginatedUsersResponse {
  content: UserResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
