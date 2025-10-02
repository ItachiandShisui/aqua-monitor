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
import { getGVSSheet, getGVSPDF } from '@/api'
import { replaceDate } from '@/utils'
import type { PageState } from 'primevue'
import type { IGVS } from '@/types/sheets'

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
  { field: 't1', header: 'Т1 гвс, оС' },
  { field: 't2', header: 'Т2 гвс, оС' },
])

const emit = defineEmits<{
  (e: 'update', dataset: IGVS[]): void
}>()

const sheets = ref<IGVS[]>([])
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

async function exportPDF() {
  isLoading.value = true
  await getGVSPDF(`?pageNumber=${page + 1}&perPage=${rows}`).then((response) => {
    const blob = new Blob([response!.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Посуточная ведомость ОДПУ ГВС.pdf'
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

  await getGVSSheet(params).then((data) => {
    if (data) {
      sheets.value = data.data
      totalSheets.value = data.totalSheets
    }
  })
  isLoading.value = false
  emit('update', sheets.value)
}
</script>
