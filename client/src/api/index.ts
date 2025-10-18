import api from '@/lib/axios'
import type { IUser } from '@/types/user.ts'
import type { IGVS, IHVSITP, IHVSITPForecast } from '@/types/sheets.ts'
import { AxiosError } from 'axios'

export interface ILoginResponse {
  title: string
  error?: string
  accessToken?: string
  user: IUser
}

export async function getUser(email: string) {
  try {
    const response = await api.get(`/auth/profile?email=${email}`)
    return response.data as IUser
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export async function logUser(payload = { email: '', password: '' }) {
  try {
    const response = await api.post<ILoginResponse>('/auth/login', payload)
    return response.data
  } catch (error) {
    console.error(error)
    return (error as AxiosError).response?.data as unknown as ILoginResponse
  }
}
export async function registerUser(payload: IUser) {
  try {
    const response = await api.post<{ title: string; message: string }>('/auth/register', payload)
    return response.data
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export async function getHVSITPSheet(params = '') {
  try {
    const response = await api.get(`/getHVSITPSheet/${params}`)
    return response.data as { data: IHVSITP[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function getHVSITPForecastSheet(params = '') {
  try {
    const response = await api.get(`/getHVSITPForecast/${params}`)
    return response.data as { data: IHVSITP[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function updateHVSITPSheet(payload: Set<IHVSITP>) {
  try {
    return await api.patch('updateHVSITPSheet', Array.from(payload))
  } catch (error) {
    console.error(error)
  }
}

export async function getGVSSheet(params = '') {
  try {
    const response = await api.get(`/getGVSSheet/${params}`)
    return response.data as { data: IGVS[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function updateGVSSheet(payload: Set<IGVS>) {
  try {
    return await api.patch('updateGVSSheet', Array.from(payload))
  } catch (error) {
    console.error(error)
  }
}

export async function createGVSForecastSheet(payload: number) {
  try {
    const response = await api.post('/createGVSAnalyze', { duration: payload })
    return response.data as { data: IGVS[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function createHVSITPForecastSheet(payload: number) {
  try {
    const response = await api.post('/createHVSITPForecastSheet', { duration: payload })
    return response.data as { data: IHVSITP[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function getGVSForecastSheet(params = '') {
  try {
    const response = await api.get(`/getGVSAnalyze/${params}`)
    return response.data as { data: IGVS[]; totalSheets: number }
  } catch (error) {
    console.error(error)
  }
}

export async function updateGVSForecastSheet(payload: Set<IGVS>) {
  try {
    return await api.patch('/updateGVSForecastSheet', Array.from(payload))
  } catch (error) {
    console.error(error)
  }
}

export async function updateHVSITPForecastSheet(payload: Set<IHVSITP>) {
  try {
    return await api.patch('/updateHVSITPForecastSheet', Array.from(payload))
  } catch (error) {
    console.error(error)
  }
}

export async function getGVSPDF(params = '') {
  try {
    return await api.get(`/exportGVSCollection/${params}`, {
      responseType: 'blob',
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getGVSForecastPDF(params = '') {
  try {
    return await api.get(`/exportGVSForecastCollection/${params}`, {
      responseType: 'blob',
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getHVSITPPDF(params = '') {
  try {
    return await api.get(`/exportHVSITPCollection/${params}`, {
      responseType: 'blob',
    })
  } catch (error) {
    console.error(error)
  }
}
export async function getHVSITPForecastPDF(params = '') {
  try {
    return await api.get(`/exportHVSITPForecastCollection/${params}`, {
      responseType: 'blob',
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getIncidents() {
  try {
    const response = await api.get('/getIncidents/')
    return response.data as { gvs: IGVS[]; hvsitp: IHVSITPForecast[]; historical: IGVS[] }
  } catch (error) {
    console.error(error)
  }
}
