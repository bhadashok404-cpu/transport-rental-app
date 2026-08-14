import api from "./api";

export const getVehicles = async () => {
    const response = await api.get("/vehicles");
    return response.data;
};

export const getVehicle = async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
};

export const createVehicle = async (vehicle) => {
    const response = await api.post("/vehicles", vehicle);
    return response.data;
};

export const updateVehicle = async (id, vehicle) => {
    const response = await api.put(`/vehicles/${id}`, vehicle);
    return response.data;
};

export const deleteVehicle = async (id) => {
    await api.delete(`/vehicles/${id}`);
};