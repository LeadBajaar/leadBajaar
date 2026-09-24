export interface BookingParams {
  page?: number;
  per_page?: number;
  type?: string;
  search?: string;
  status?: string;
  month?: string;
}

export interface UpdateBookingDto {
  user_id?: number | null;
  status?: string;
  notes?: string;
  outcome?: string;
  lead_id?: number;
}

export interface RescheduleBookingDto {
  date: string;
  time: string;
  duration: number;
}
