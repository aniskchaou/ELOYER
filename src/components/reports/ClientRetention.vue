<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Client Retention</h1><p class="body-2 grey--text">Analyze client retention rates and churn patterns</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Retention Rate by Month</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="m in monthly" :key="m.month" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ m.month }}</span><span class="font-weight-bold">{{ m.rate }}%</span>
            </div>
            <v-progress-linear :value="m.rate" height="10" rounded :color="m.rate >= 80 ? 'green' : m.rate >= 60 ? 'orange' : 'red'"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">Churn Reasons</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="r in churnReasons" :key="r.reason" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ r.reason }}</span><span class="font-weight-bold">{{ r.count }} clients</span>
            </div>
            <v-progress-linear :value="(r.count / totalChurn) * 100" height="10" rounded color="red lighten-2"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1">At-Risk Clients</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="headers" :items="atRisk" dense>
            <template v-slot:item.risk="{ item }">
              <v-chip small :color="item.risk === 'High' ? 'red' : item.risk === 'Medium' ? 'orange' : 'green'" dark>{{ item.risk }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'ClientRetention',
  data() {
    return {
      stats: [
        { label: 'Active Clients', value: 42, color: 'green', icon: 'mdi-account-check' },
        { label: 'Churned (Q2)', value: 3, color: 'red', icon: 'mdi-account-remove' },
        { label: 'Retention Rate', value: '93%', color: 'blue', icon: 'mdi-percent' },
        { label: 'Avg. Client Tenure', value: '2.4 yr', color: 'orange', icon: 'mdi-calendar-clock' },
      ],
      monthly: [
        { month: 'January', rate: 95 }, { month: 'February', rate: 92 }, { month: 'March', rate: 88 },
        { month: 'April', rate: 91 }, { month: 'May', rate: 93 },
      ],
      churnReasons: [
        { reason: 'Resolved their legal matter', count: 8 },
        { reason: 'Found another firm', count: 4 },
        { reason: 'Budget constraints', count: 3 },
        { reason: 'Poor communication', count: 2 },
        { reason: 'Other', count: 1 },
      ],
      atRisk: [
        { name: 'Ahmed Ben Ali', lastContact: '2026-03-10', activeCases: 0, risk: 'High', reason: 'No active case, 7 weeks no contact' },
        { name: 'Leila Mansour', lastContact: '2026-04-20', activeCases: 1, risk: 'Medium', reason: 'Overdue invoice not resolved' },
        { name: 'ONG HelpAid', lastContact: '2026-05-01', activeCases: 0, risk: 'Medium', reason: 'Contract ending soon' },
      ],
      headers: [
        { text: 'Client', value: 'name' }, { text: 'Last Contact', value: 'lastContact' },
        { text: 'Active Cases', value: 'activeCases' }, { text: 'Risk Level', value: 'risk' }, { text: 'Reason', value: 'reason' },
      ],
    };
  },
  computed: {
    totalChurn() { return this.churnReasons.reduce((s, r) => s + r.count, 0); },
  },
};
</script>
