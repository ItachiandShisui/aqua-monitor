import api from '@/lib/axios'
import type { ITask } from '@/types/accidents.ts'

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
