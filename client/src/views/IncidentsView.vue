<template>
  <Tabs class="w-full" value="0">
    <TabList>
      <Tab value="0" as="div" class="flex items-center gap-2">
        <i class="pi pi-exclamation-triangle" />
        <span class="font-bold whitespace-nowrap">Прогнозируемые</span>
        <Badge :value="forecastIncidents.length + Number(maintenanceWarn)" />
      </Tab>
      <Tab value="1" as="div" class="flex items-center gap-2">
        <i class="pi pi-eye" />
        <span class="font-bold whitespace-nowrap">Актуальные</span>
        <Badge :value="historicalIncidents.length" />
      </Tab>
    </TabList>
    <TabPanels v-if="!isLoading">
      <TabPanel value="0" tabindex="-1">
        <Card v-if="maintenanceWarn" class="border mb-2">
          <template #title>
            <Tag severity="info" value="Уведомление"></Tag>
            <p class="font-bold">
              {{ maintenanceWarning.title }}
            </p>
          </template>
          <template #subtitle>
            <p v-if="forecastIncidents[0]" class="text-sm">
              {{
                `${replaceDate(forecastIncidents[0]?.datetime)} ${new Date(forecastIncidents[0]?.datetime).toLocaleTimeString()}`
              }}
            </p>
          </template>
          <template #content>
            <p class="m-0">
              {{ maintenanceWarning.description }}
            </p>
          </template>
        </Card>
        <Card v-for="(incident, idx) in forecastIncidents" :key="idx" class="border mb-2">
          <template #title>
            <Tag
              v-if="incident.deviation_warning === 1 || incident.temp_warning"
              severity="warn"
              value="Предупреждение"
            ></Tag>
            <Tag v-else severity="danger" value="Критическая ситуация"></Tag>
            <p class="font-bold">
              {{ generateText(incident).title }}
            </p>
          </template>
          <template #subtitle>
            <p class="text-sm">
              {{
                `${replaceDate(incident.datetime)} ${new Date(incident.datetime).toLocaleTimeString()}`
              }}
            </p>
          </template>
          <template #content>
            <p class="m-0">
              {{ generateText(incident).description }}
            </p>
          </template>
        </Card>
        <div v-if="!forecastIncidents.length && !maintenanceWarn" class="text-center">
          Нет прогнозируемых инцидентов
        </div>
      </TabPanel>
      <TabPanel value="1" tabindex="-1">
        <Card v-for="(incident, idx) in historicalIncidents" :key="idx" class="border mb-2">
          <template #title>
            <Tag
              v-if="incident.deviation_warning === 1 || incident.temp_warning"
              severity="warn"
              value="Предупреждение"
            ></Tag>
            <Tag v-else severity="danger" value="Критическая ситуация"></Tag>
            <p class="font-bold">
              {{ generateText(incident).title }}
            </p>
          </template>
          <template #subtitle>
            <p class="text-sm">
              {{
                `${replaceDate(incident.datetime)} ${new Date(incident.datetime).toLocaleTimeString()}`
              }}
            </p>
          </template>
          <template #content>
            <p class="m-0">
              {{ generateText(incident).description }}
            </p>
          </template>
        </Card>
      </TabPanel>
    </TabPanels>

    <TabPanels class="card flex justify-center" v-else>
      <ProgressSpinner />
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Badge from 'primevue/badge'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import ProgressSpinner from 'primevue/progressspinner'
import { getIncidents } from '@/api/index.ts'
import { deviationWarning, maintenanceWarning, tempWarning } from '@/types/accidents.ts'
import type { IGVS } from '@/types/sheets'
import { replaceDate } from '@/utils'

const isLoading = ref(false)

const maintenanceWarn = ref(false)
const forecastIncidents = ref([] as IGVS[])
const historicalIncidents = ref([] as IGVS[])

onMounted(async () => {
  await recieveIncidents()
})

async function recieveIncidents() {
  isLoading.value = true
  await getIncidents().then((data) => {
    const gvs = data?.gvs
    if (gvs?.length) {
      gvs.forEach((e, idx) => {
        if (idx !== gvs.length - 1) {
          if (
            (e.deviation_warning && e.deviation_warning !== gvs[idx + 1].deviation_warning) ||
            (e.temp_warning && e.temp_warning !== gvs[idx + 1].temp_warning)
          ) {
            forecastIncidents.value.push(e)
          }
        } else {
          if (e.deviation_warning && e.temp_warning) forecastIncidents.value.push(e)
        }
      })
    }
    forecastIncidents.value.sort(
      (a, b) => new Date(a.datetime).valueOf() - new Date(b.datetime).valueOf(),
    )
    const HVSITPdata = data?.hvsitp
    if (HVSITPdata?.length) {
      maintenanceWarn.value = HVSITPdata.some((e) => e.maintenance)
    }
    const historical = data?.historical
    if (historical?.length) {
      historical.forEach((e, idx) => {
        if (idx !== historical.length - 1) {
          if (
            (e.deviation_warning &&
              e.deviation_warning !== historical[idx + 1].deviation_warning) ||
            (e.temp_warning && e.temp_warning !== historical[idx + 1].temp_warning)
          ) {
            historicalIncidents.value.push(e)
          }
        } else {
          if (e.deviation_warning && e.temp_warning) historicalIncidents.value.push(e)
        }
      })
    }
  })
  isLoading.value = false
}

function generateText(incident: IGVS) {
  return incident.temp_warning ? tempWarning : deviationWarning[incident.deviation_warning]
}
</script>
