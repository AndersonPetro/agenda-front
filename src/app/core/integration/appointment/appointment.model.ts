export interface CreateAppointmentRequest {
  userId: string;
  serviceId: string;
  scheduledAt: string; // ISO 8601 LocalDateTime
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt?: string; // ISO 8601 LocalDateTime
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  scheduledAt: string; // ISO 8601 LocalDateTime
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'; 
  notes?: string;
  createdAt: string; // ISO 8601 LocalDateTime
  updatedAt: string; // ISO 8601 LocalDateTime
}

export interface TimeSlotResponse {
  date: string; // ISO 8601 LocalDate
  startTime: string; // ISO 8601 LocalTime
  endTime: string; // ISO 8601 LocalTime
  available: boolean;
}
