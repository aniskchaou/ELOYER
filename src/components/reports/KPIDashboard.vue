<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">KPI Dashboard</h1><p class="body-2 grey--text">Firm-wide key performance indicators at a glance</p></v-col>
      <v-col cols="auto"><v-select v-model="period" :items="periods" outlined dense hide-details style="max-width:160px"></v-select></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="k in kpis" :key="k.label" cols="6" md="3">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="overline grey--text">{{ k.label }}</div>
              <div class="text-h5 font-weight-bold" :class="k.color+'--text'">{{ k.value }}</div>
              <div class="caption mt-1" :class="k.change >= 0 ? 'green--text' : 'red--text'">
                <v-icon x-small :color="k.change >= 0 ? 'green' : 'red'">{{ k.change >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                {{ Math.abs(k.change) }}% vs prev
              </div>
            </div>
            <v-icon size="40" :color="k.color + ' lighten-4'">{{ k.icon }}</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Case KPIs</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="k in caseKpis" :key="k.label" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ k.label }}</span>
              <span class="font-weight-bold">{{ k.value }}</span>
            </div>
            <v-progress-linear :value="k.pct" height="10" rounded :color="k.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Team KPIs</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="k in teamKpis" :key="k.label" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ k.label }}</span>
              <span class="font-weight-bold">{{ k.value }}</span>
            </div>
            <v-progress-linear :value="k.pct" height="10" rounded :color="k.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">KPI Targets vs Actuals</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-data-table :headers="targetHeaders" :items="targets" dense>
            <template v-slot:item.status="{ item }">
              <v-chip small :color="item.actual >= item.target ? 'green' : item.actual >= item.target * 0.8 ? 'orange' : 'red'" dark>
                {{ item.actual >= item.target ? 'On Track' : item.actual >= item.target * 0.8 ? 'Near Target' : 'Below Target' }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'KPIDashboard',
  data() {
    return {
      period: 'Q2 2026',
      periods: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Full Year 2025'],
      kpis: [
        { label: 'Revenue', value: '€48,500', color: 'green', icon: 'mdi-currency-eur', change: 14 },
        { label: 'Active Cases', value: 23, color: 'blue', icon: 'mdi-briefcase', change: 5 },
        { label: 'Client Satisfaction', value: '4.3/5', color: 'orange', icon: 'mdi-star', change: 8 },
        { label: 'Billable Utilization', value: '76%', color: 'purple', icon: 'mdi-clock-check', change: -2 },
      ],
      caseKpis: [
        { label: 'Cases Won / Total Closed', value: '14 / 18', pct: 78, color: 'green' },
        { label: 'Avg. Case Duration (months)', value: '4.2 mo', pct: 58, color: 'blue' },
        { label: 'Hearings Attended On-Time', value: '97%', pct: 97, color: 'teal' },
        { label: 'Cases Filed Electronically', value: '85%', pct: 85, color: 'orange' },
      ],
      teamKpis: [
        { label: 'Billable Hours vs Target', value: '487 / 600 h', pct: 81, color: 'blue' },
        { label: 'Staff Attendance Rate', value: '94%', pct: 94, color: 'green' },
        { label: 'Tasks Completed On-Time', value: '88%', pct: 88, color: 'orange' },
        { label: 'Performance Review Scores', value: '3.8 / 5 avg', pct: 76, color: 'purple' },
      ],
      targets: [
        { kpi: 'Monthly Revenue', target: 15000, actual: 18500, unit: '€' },
        { kpi: 'New Clients', target: 5, actual: 4, unit: '' },
        { kpi: 'Client Satisfaction Score', target: 4.5, actual: 4.3, unit: '/5' },
        { kpi: 'Billable Hours', target: 600, actual: 487, unit: 'h' },
        { kpi: 'Case Win Rate', target: 75, actual: 78, unit: '%' },
      ],
      targetHeaders: [
        { text: 'KPI', value: 'kpi' }, { text: 'Target', value: 'target' }, { text: 'Actual', value: 'actual' },
        { text: 'Unit', value: 'unit' }, { text: 'Status', value: 'status', sortable: false },
      ],
    };
  },
};
</script>
