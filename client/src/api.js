import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001' })
export const listPlants = () => api.get('/api/plants').then(r=>r.data)
export const createPlant = (data) => api.post('/api/plants', data).then(r=>r.data)
export const updatePlant = (id, data) => api.put(`/api/plants/${id}`, data).then(r=>r.data)
export const waterPlant = (id) => api.patch(`/api/plants/${id}/water`).then(r=>r.data)
export const deletePlant = (id) => api.delete(`/api/plants/${id}`)
