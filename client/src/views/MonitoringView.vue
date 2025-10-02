<template>
  <div class="flex gap-2 w-full sticky back z-100 top-[-16px] bg-[var(--carbon-gray-100)]">
    <Chart
      ref="primeChart"
      type="line"
      :data="setChartData()"
      :options="chartOptions"
      class="w-full h-32 mb-4"
    />
  </div>
  <Tabs class="w-full" value="0" @update:value="onTabUpdate">
    <TabList>
      <Tab value="0" as="div" class="flex items-center gap-2">
        <span class="font-bold whitespace-nowrap">Посуточная ведомость водосчетчика ХВС ИТП</span>
      </Tab>
      <Tab value="1" as="div" class="flex items-center gap-2">
        <span class="font-bold whitespace-nowrap">Посуточная ведомость ОДПУ ГВС</span>
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0" tabindex="-1">
        <HVSITPTable @update="replaceChartData" />
      </TabPanel>
      <TabPanel value="1" tabindex="-1">
        <GVSTable @update="replaceChartData" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'primevue/chart'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import HVSITPTable from '@/components/HVSITPTable.vue'
import GVSTable from '@/components/GVSTable.vue'
import { replaceDate } from '@/utils'
import type { IHVSITP, IGVS } from '@/types/sheets'

const primeChart = ref()
const chartOptions = ref()
const chartData = ref([
  {
    labels: [] as string[],
    dataset: [] as number[],
  },
  {
    labels: [] as string[],
    dataset: [] as number[],
  },
])
const activeTabIdx = ref(0)

onMounted(() => {
  chartOptions.value = setChartOptions()
})

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement)

  return {
    labels: [],
    datasets: [
      {
        label: 'Потребление за период, м3',
        data: [],
        fill: false,
        borderColor: documentStyle.getPropertyValue('--p-primary-500'),
        tension: 0.4,
      },
    ],
  }
}

function addChartData() {
  const chartInstance = primeChart.value.chart
  chartInstance.data.labels = chartData.value[activeTabIdx.value].labels
  chartInstance.data.datasets[0].data = chartData.value[activeTabIdx.value].dataset
  chartInstance.update()
}

function onTabUpdate(v: string | number) {
  activeTabIdx.value = Number(v)
  addChartData()
}

function replaceChartData(payload: IHVSITP[] | IGVS[]) {
  if ((payload[0] as IHVSITP).delta) {
    chartData.value[0].labels = payload.map(
      (e) => `${replaceDate(new Date(e.datetime))} ${new Date(e.datetime).toLocaleTimeString()}`,
    )
    chartData.value[0].dataset = (payload as IHVSITP[]).map((e) => e.delta)
  } else {
    chartData.value[1].labels = payload.map(
      (e) => `${replaceDate(new Date(e.datetime))} ${new Date(e.datetime).toLocaleTimeString()}`,
    )
    chartData.value[1].dataset = (payload as IGVS[]).map((e) => e.total)
  }
  addChartData()
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },
  }
}
</script>
