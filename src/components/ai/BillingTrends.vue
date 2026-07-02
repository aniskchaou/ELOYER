<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Billing Trends</h1><p class="body-2 grey--text">Forecast billing behavior and payment trends</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Collection Forecast</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="m in monthly" :key="m.month" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1"><span>{{ m.month }}</span><span>{{ m.value }}%</span></div>
            <v-progress-linear :value="m.value" height="10" rounded :color="m.value >= 75 ? 'green' : m.value >= 55 ? 'orange' : 'red'"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Client Payment Risk</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-data-table :headers="headers" :items="clients" dense>
            <template v-slot:item.risk="{ item }">
              <v-chip x-small :color="item.risk === 'High' ? 'red' : item.risk === 'Medium' ? 'orange' : 'green'" dark>{{ item.risk }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'BillingTrends',
  data() {
    return {
      monthly: [
        { month: 'June', value: 79 },
        { month: 'July', value: 74 },
        { month: 'August', value: 69 },
        { month: 'September', value: 72 },
      ],
      clients: [
        { client: 'Société ABC SARL', avgDelay: '6 days', risk: 'Low' },
        { client: 'Ahmed Ben Ali', avgDelay: '18 days', risk: 'Medium' },
        { client: 'Leila Mansour', avgDelay: '33 days', risk: 'High' },
      ],
      headers: [
        { text: 'Client', value: 'client' },
        { text: 'Avg Delay', value: 'avgDelay' },
        { text: 'Risk', value: 'risk' },
      ],
    };
  },
};
</script>
