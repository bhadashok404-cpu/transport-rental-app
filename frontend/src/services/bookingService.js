import api from "./api";

export const getBookings = async () => {
    const response = await api.get("/bookings");
    return response.data;
};

export const getBooking = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

export const createBooking = async (booking) => {
    const response = await api.post("/bookings", booking);
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, {
        status
    });

    return response.data;
};