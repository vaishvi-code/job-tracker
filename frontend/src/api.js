import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export const jobsApi = {
  getAll: () => api.get('/jobs/').then(r => r.data),
  create: (data) => api.post('/jobs/', data).then(r => r.data),
  update: (id, data) => api.patch(`/jobs/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/jobs/${id}`),
}

export const aiApi = {
  generateEmail: (jobId, emailType, customContext = '') =>
    api.post('/ai/generate-email', {
      job_id: jobId,
      email_type: emailType,
      custom_context: customContext,
    }).then(r => r.data),
}
