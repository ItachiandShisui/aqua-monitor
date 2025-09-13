export enum Statuses {
  New = 'New',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
}

export enum Priority {
  Critical = 'Критический',
  Major = 'Высокий',
  Moderate = 'Средний',
  Minor = 'Низкий',
}

export enum Types {
  Hardware = 'Отказ оборудования',
  Quality = 'Нарушение качества',
  Supply = 'Перерыв подачи',
  Contamination = 'Загрязнение',
  Maintance = 'Требуется обслуживание',
}

export interface ITask {
  _id: string
  status: Statuses
  priority: Priority
  type: Types
  adress: string
  title: string
  message: string
  assigned_to: string
  createdAt: Date
  UpdatetAt: Date
}
