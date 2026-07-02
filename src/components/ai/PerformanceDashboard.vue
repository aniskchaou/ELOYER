<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Performance Dashboard</h1><p class="body-2 grey--text">Unified AI performance indicators for firm operations</p></v-col>
    </v-row>

    <v-row>
      <v-col v-for="k in kpis" :key="k.label" cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <v-icon :color="k.color">{{ k.icon }}</v-icon>
          <div class="overline mt-1">{{ k.label }}</div>
          <div class="text-h5 font-weight-bold" :class="k.color + '--text'">{{ k.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1">AI Recommendations</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="(rec, i) in recommendations" :key="i">
              <v-list-item-icon><v-icon :color="rec.color">mdi-lightbulb-on</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="caption font-weight-bold">{{ rec.title }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ rec.detail }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'PerformanceDashboard',
  data() {
    return {
      kpis: [
        { label: 'Productivity Gain', value: '+18%', color: 'green', icon: 'mdi-chart-areaspline' },
        { label: 'Automation Coverage', value: '62%', color: 'blue', icon: 'mdi-robot' },
        { label: 'Risk Alerts', value: 4, color: 'orange', icon: 'mdi-alert-circle' },
        { label: 'Model Accuracy', value: '81%', color: 'purple', icon: 'mdi-bullseye-arrow' },
      ],
      recommendations: [
        { title: 'Reassign 2 high-load cases from litigation queue', detail: 'Current assignment predicts deadline slippage within 10 days.', color: 'red' },
        { title: 'Send invoice reminders 48h earlier', detail: 'Could reduce average payment delay by ~12%.', color: 'blue' },
        { title: 'Prioritize evidence normalization in Smith appeal', detail: 'Will likely increase confidence score by 9 points.', color: 'green' },
      ],
    };
  },
};
</script>
