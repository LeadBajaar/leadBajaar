import api from './client';
import { BookingParams, UpdateBookingDto, RescheduleBookingDto } from './types/bookings.types';

export const getBookings = async (params?: BookingParams): Promise<any> => {
  return api.get('/bookings', { params });
};

export const deleteBooking = async (id: number): Promise<any> => {
  return api.delete(`/bookings/${id}`);
};

export const updateBooking = async (id: number, data: UpdateBookingDto): Promise<any> => {
  return api.put(`/bookings/${id}`, data);
};

export const rescheduleBooking = async (id: number, data: RescheduleBookingDto): Promise<any> => {
  return api.patch(`/bookings/${id}/reschedule`, data);
};

// Team API Methods