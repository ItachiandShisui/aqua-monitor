import api from '@/lib/axios'
import type { IUser } from '@/types/user.ts'
import type { ITask } from '@/types/accidents.ts'
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

export async function getTasks() {
  try {
    const response = await api.get('/getTasks')
    return response.data as ITask[]
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createTask(payload: ITask) {
  try {
    await api.post('/createtask', payload)
  } catch (error) {
    console.error(error)
  }
}

export async function updateTask(payload: ITask) {
  try {
    await api.patch(`/updateTask/${payload._id}`, payload)
  } catch (error) {
    console.error(error)
  }
}
