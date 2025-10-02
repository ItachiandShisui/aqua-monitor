<template>
  <DataTable
    ref="dt"
    class="h-96"
    :value="sheets"
    lazy
    :loading="isLoading"
    paginator
    scrollable
    scrollHeight="flex"
    export-filename="Посуточная ведомость водосчетчика ХВС ИТП"
    :totalRecords="totalSheets"
    :rows="PER_PAGE"
    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
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
      <div v-if="totalSheets">
        <SplitButton
          icon="pi pi-external-link"
          label="Скачать"
          @click="exportCSV"
          :model="saveOptions"
        />
      </div>
    </template>
    <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
      <template #body="{ data, field }">
        <template v-if="field === 'date'">{{ replaceDate(data[field]) }}</template>
        <template v-else>{{ data[field as keyof typeof data] }}</template>
      </template>
    </Column>
  </DataTable>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SplitButton from 'primevue/splitbutton'
import { getHVSITPPDF, getHVSITPSheet } from '@/api'
import { replaceDate } from '@/utils'
import type { PageState } from 'primevue'
import type { IHVSITP } from '@/types/sheets'

const emit = defineEmits<{
  (e: 'update', dataset: IHVSITP[]): void
}>()

const PER_PAGE = 25
let page = 0
let rows = PER_PAGE
const dt = ref()
const columns = ref([
  { field: 'date', header: 'Дата' },
  { field: 'time', header: 'Время суток, ч' },
  { field: 'total', header: 'Потребление накопленным итогом, м3' },
  { field: 'delta', header: 'Потребление за период, м3' },
])
const sheets = ref<IHVSITP[]>([])
const totalSheets = ref(0)
const isLoading = ref(false)
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

function exportCSV() {
  dt.value.exportCSV()
}

async function fetchData(e?: PageState) {
  isLoading.value = true
  let params = ''

  if (e) {
    ;({ page, rows } = e)
  }

  params = `?pageNumber=${page + 1}&perPage=${rows}`

  await getHVSITPSheet(params).then((data) => {
    if (data) {
      sheets.value = data.data
      totalSheets.value = data.totalSheets
    }
  })
  isLoading.value = false
  emit('update', sheets.value)
}

async function exportPDF() {
  isLoading.value = true
  await getHVSITPPDF(`?pageNumber=${page + 1}&perPage=${rows}`).then((response) => {
    const blob = new Blob([response!.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Посуточная ведомость водосчетчика ХВС ИТП.pdf'
    link.click()
    URL.revokeObjectURL(url)
    link.remove()
  })
  isLoading.value = false
}
</script>
