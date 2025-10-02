<template>
  <DataTable
    ref="dt"
    class="h-96"
    :value="sheets"
    lazy
    :loading="isLoading"
    editMode="cell"
    paginator
    scrollable
    scrollHeight="flex"
    export-filename="Прогнозируемая посуточная ведомость ОДПУ ГВС"
    :totalRecords="totalSheets"
    :rows="PER_PAGE"
    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
    @cell-edit-complete="onCellEdit"
    @page="fetchData"
    :pt="{
      table: { style: 'min-width: 50rem' },
      column: {
        bodycell: (data: { state: Record<string, string> }) => ({
          class: [{ '!py-0': data.state['d_editing'] }],
        }),
      },
    }"
  >
    <template #header>
      <div v-if="totalSheets" class="flex justify-between">
        <div v-if="totalSheets">
          <SplitButton
            icon="pi pi-external-link"
            label="Скачать"
            @click="exportCSV"
            :model="saveOptions"
          />
        </div>
        <div class="flex gap-2">
          <template v-if="toEditList.size > 0">
            <Button label="Сохранить изменения" @click="showConfirmModal = true" />
            <Button label="Отменить" severity="danger" @click="resetSheet" />
            <Divider layout="vertical" />
          </template>
          <Button label="Спрогнозировать" @click="showForecastModal = true" />
        </div>
      </div>
    </template>
    <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
      <template #body="{ data, field }">
        <template v-if="field === 'date'">{{ replaceDate(data[field]) }}</template>
        <template v-else>{{ data[field as keyof typeof data] }}</template>
      </template>

      <template #editor="{ data, field }">
        <InputNumber v-if="field === 'total'" v-model="data[field]" :maxFractionDigits="5" fluid />
        <template v-else-if="field === 'date'">{{ replaceDate(data[field]) }}</template>
        <template v-else>{{ data[field as keyof typeof data] }}</template>
      </template>
    </Column>
  </DataTable>

  <Dialog
    v-model:visible="showConfirmModal"
    modal
    header="Вы уверены, что хотите внести изменения?"
    :closable="false"
    dismissableMask
  >
    <div class="flex justify-between gap-2">
      <Button class="basis-100" type="button" label="Подтвердить" @click="updateSheet"></Button>
      <Button
        class="basis-100"
        type="button"
        label="Отмена"
        severity="secondary"
        @click="showConfirmModal = false"
      ></Button>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="showForecastModal"
    modal
    header="Создать новый прогноз"
    :closable="false"
    dismissableMask
  >
    <div class="flex justify-between gap-2">
      <div class="flex gap-2">
        <p class="text-center content-center">Продолжительность в днях</p>
        <Select v-model="forecastDuration" :options="[1, 7, 14, 21]" />
      </div>
    </div>
    <template #footer>
      <Button class="basis-100" type="button" label="Подтвердить" @click="createForecast"></Button>
      <Button
        class="basis-100"
        type="button"
        label="Отмена"
        severity="secondary"
        @click="showForecastModal = false"
      ></Button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import {
  getGVSForecastSheet,
  updateGVSForecastSheet,
  getGVSForecastPDF,
  createGVSForecastSheet,
} from '@/api'
import { replaceDate } from '@/utils'
import type { PageState } from 'primevue'
import type { IGVSAnalize } from '@/types/sheets'

interface ICellEditEvent {
  data: Record<string, string | number>
  field: string
  newValue: string | number
  index: number
}

const PER_PAGE = 25
let page = 0
let rows = PER_PAGE
const dt = ref()
const columns = ref([
  { field: 'date', header: 'Дата' },
  { field: 'time', header: 'Время суток, ч' },
  { field: 'to', header: 'Подача, м3' },
  { field: 'out', header: 'Обратка, м3' },
  { field: 'total', header: 'Потребление за период, м3' },
])
const toast = useToast()
let originalSheets = [] as IGVSAnalize[]
const sheets = ref<IGVSAnalize[]>([])
const totalSheets = ref(0)
const isLoading = ref(false)
const showForecastModal = ref(false)
const showConfirmModal = ref(false)
const toEditList = ref(new Set<IGVSAnalize>())
const forecastDuration = ref(7)
const saveOptions = [
  {
    label: 'Скачать CSV',
    command: () => exportCSV(),
  },
  {
    label: 'Скачать PDF',
    command: () => exportPDF(),
  },
]

onMounted(async () => {
  await fetchData()
})

function onCellEdit(e: ICellEditEvent) {
  const { data, newValue, field, index } = e

  if (field === 'total' && newValue) {
    data[field] = newValue
    toEditList.value.add(sheets.value[index])
  }
}

function exportCSV() {
  dt.value.exportCSV()
}

async function exportPDF() {
  isLoading.value = true
  await getGVSForecastPDF(`?pageNumber=${page + 1}&perPage=${rows}`).then((response) => {
    const blob = new Blob([response!.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Прогнозируемая посуточная ведомость ОДПУ ГВС.pdf'
    link.click()
    URL.revokeObjectURL(url)
    link.remove()
  })
  isLoading.value = false
}

async function fetchData(e?: PageState) {
  isLoading.value = true
  let params = ''

  if (e) {
    ;({ page, rows } = e)
  }

  params = `?pageNumber=${page + 1}&perPage=${rows}`

  await getGVSForecastSheet(params).then((data) => {
    if (data) {
      sheets.value = data.data
      originalSheets = structuredClone(data.data)
      totalSheets.value = data.totalSheets
    }
  })
  isLoading.value = false
}

async function updateSheet() {
  try {
    showConfirmModal.value = false
    await updateGVSForecastSheet(toEditList.value).then((response) => {
      if (response?.status !== 200) {
        throw new Error()
      }
      toast.add({ severity: 'success', summary: response.data.message, life: 3000 })
      fetchData()
      toEditList.value.clear()
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Не удалось сохранить данные',
      detail: 'Ошибка сети',
      life: 3000,
    })
    console.error(error)
  }
}

function resetSheet() {
  sheets.value = structuredClone(originalSheets)
  toEditList.value.clear()
}

async function createForecast() {
  showForecastModal.value = false
  isLoading.value = true
  await createGVSForecastSheet(forecastDuration.value * 24).then((data) => {
    if (data) {
      sheets.value = data.data
      originalSheets = structuredClone(data.data)
      totalSheets.value = data.totalSheets
    }
  })
  isLoading.value = false
}
</script>
