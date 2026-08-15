import axios from 'axios'

// API base path.
// Nginx proxies /api/* requests to the backend.
const API_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Normalize Axios errors into a consistent shape.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response

      return Promise.reject({
        status,
        message:
          data?.message || 'Something went wrong. Please try again.',
        details: data?.details || null,
      })
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message:
          'Could not reach the DeployGuard API. Check that the backend is running.',
        details: null,
      })
    }

    return Promise.reject({
      status: -1,
      message: error.message,
      details: null,
    })
  }
)

// ---- Dashboard ----
export const getDashboardSummary = () =>
  client.get('/dashboard/summary').then((r) => r.data)

// ---- Applications ----
export const getApplications = () =>
  client.get('/applications').then((r) => r.data)

export const getApplication = (id) =>
  client.get(`/applications/${id}`).then((r) => r.data)

export const createApplication = (payload) =>
  client.post('/applications', payload).then((r) => r.data)

export const updateApplication = (id, payload) =>
  client.put(`/applications/${id}`, payload).then((r) => r.data)

export const deleteApplication = (id) =>
  client.delete(`/applications/${id}`).then((r) => r.data)

export const getApplicationDeployments = (id) =>
  client.get(`/applications/${id}/deployments`).then((r) => r.data)

// ---- Environments ----
export const getEnvironments = () =>
  client.get('/environments').then((r) => r.data)

export const getEnvironment = (id) =>
  client.get(`/environments/${id}`).then((r) => r.data)

export const createEnvironment = (payload) =>
  client.post('/environments', payload).then((r) => r.data)

export const updateEnvironment = (id, payload) =>
  client.put(`/environments/${id}`, payload).then((r) => r.data)

export const deleteEnvironment = (id) =>
  client.delete(`/environments/${id}`).then((r) => r.data)

export const getEnvironmentDeployments = (id) =>
  client.get(`/environments/${id}/deployments`).then((r) => r.data)

// ---- Deployments ----
export const getDeployments = () =>
  client.get('/deployments').then((r) => r.data)

export const getDeployment = (id) =>
  client.get(`/deployments/${id}`).then((r) => r.data)

export const startDeployment = (payload) =>
  client.post('/deployments', payload).then((r) => r.data)

export const updateDeploymentStatus = (id, status) =>
  client.patch(`/deployments/${id}/status`, { status }).then((r) => r.data)

export const rollbackDeployment = (id) =>
  client.post(`/deployments/${id}/rollback`).then((r) => r.data)

export default client