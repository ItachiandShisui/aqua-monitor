<template>
  <div>
    <h2>Мониторинг в реальном времени</h2>
    <Chart
      ref="primeChart"
      type="line"
      :data="setChartData()"
      :options="chartOptions"
      class="h-[30rem]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'primevue/chart'
const primeChart = ref()
const chartOptions = ref()
let liveUpdate = null as unknown as NodeJS.Timeout
onMounted(() => {
  chartOptions.value = setChartOptions()
  liveUpdate = setInterval(() => {
    addData(new Date().toLocaleTimeString('ru-RU'), Math.random().toFixed(2))
    removeData()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(liveUpdate as NodeJS.Timeout)
})
function addData(label: string | number, newData: string) {
  const chartInstance = primeChart.value.chart

  chartInstance.data.labels.push(label)
  chartInstance.data.datasets.forEach((dataset: { data: string[] }) => {
    dataset.data.push(newData)
  })
  chartInstance.update()
}

function removeData() {
  const chartInstance = primeChart.value.chart
  chartInstance.data.labels.shift()
  chartInstance.data.datasets.forEach((dataset: { data: string[] }) => {
    dataset.data.shift()
  })
  chartInstance.update()
}
const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement)

  return {
    labels: Array.from({ length: 10 }, () => new Date().toLocaleTimeString('ru-RU')),
    datasets: [
      {
        label: 'Давление в системе',
        data: Array.from({ length: 10 }, () => Math.random().toFixed(2)),
        fill: false,
        borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
        tension: 0.4,
      },
    ],
  }
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
