<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Predictions</h1><p class="body-2 grey--text">Predict outcomes and operational trends using legal data</p></v-col>
      <v-col cols="auto"><v-btn color="primary" :loading="loading" @click="run"><v-icon left>mdi-brain</v-icon> Run Predictions</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color + '--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="predictions" class="elevation-1">
      <template v-slot:item.confidence="{ item }">
        <v-progress-linear :value="item.confidence" height="10" rounded :color="item.confidence >= 80 ? 'green' : item.confidence >= 60 ? 'orange' : 'red'"></v-progress-linear>
        <span class="caption">{{ item.confidence }}%</span>
      </template>
      <template v-slot:item.impact="{ item }">
        <v-chip x-small :color="item.impact === 'High' ? 'red' : item.impact === 'Medium' ? 'orange' : 'green'" dark>{{ item.impact }}</v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
export default {
  name: 'AIPredictions',
  data() {
    return {
      loading: false,
      stats: [
        { label: 'Predictions Generated', value: 12, color: 'blue', icon: 'mdi-chart-line' },
        { label: 'High Confidence', value: 7, color: 'green', icon: 'mdi-check-decagram' },
        { label: 'Avg Confidence', value: '78%', color: 'orange', icon: 'mdi-percent' },
        { label: 'Alerts', value: 3, color: 'red', icon: 'mdi-alert' },
      ],
      predictions: [
        { metric: 'Case Success Rate (next 30 days)', forecast: '74%', confidence: 86, impact: 'High' },
        { metric: 'Invoice Collection Delay Risk', forecast: 'Moderate', confidence: 72, impact: 'Medium' },
        { metric: 'Client Churn Probability', forecast: '8%', confidence: 68, impact: 'Low' },
        { metric: 'Hearing Schedule Overload', forecast: 'Likely', confidence: 81, impact: 'High' },
      ],
      headers: [
        { text: 'Metric', value: 'metric' },
        { text: 'Forecast', value: 'forecast' },
        { text: 'Confidence', value: 'confidence' },
        { text: 'Impact', value: 'impact' },
      ],
    };
  },
  methods: {
    run() { this.loading = true; setTimeout(() => { this.loading = false; }, 1200); },
  },
};
</script>
