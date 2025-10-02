<template>
  <h2 class="text-center content-center font-bold pb-2">
    Прогнозирование ведомостей с возможностью внесения изменений
  </h2>
  <Tabs class="w-full" value="0">
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
        <HVSITPForecastTable />
      </TabPanel>
      <TabPanel value="1" tabindex="-1">
        <GVSForecastTable />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import GVSForecastTable from '@/components/GVSForecastTable.vue'
import HVSITPForecastTable from '@/components/HVSITPForecastTable.vue'
</script>
