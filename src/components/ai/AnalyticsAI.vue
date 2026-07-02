<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Analytics</h1><p class="body-2 grey--text">AI-driven insights across operations and legal outcomes</p></v-col>
    </v-row>

    <v-row>
      <v-col v-for="c in cards" :key="c.title" cols="12" md="6">
        <v-card outlined class="pa-4 mb-3">
          <div class="d-flex align-center mb-2">
            <v-icon :color="c.color" class="mr-2">{{ c.icon }}</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ c.title }}</div>
          </div>
          <p class="caption grey--text mb-2">{{ c.desc }}</p>
          <v-progress-linear :value="c.score" height="10" rounded :color="c.color"></v-progress-linear>
          <div class="caption mt-1">AI score: {{ c.score }}%</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'AnalyticsAI',
  data() {
    return {
      cards: [
        { title: 'Client Satisfaction Trend', desc: 'Predicted upward trend over the next quarter based on response times and outcome quality.', score: 79, color: 'green', icon: 'mdi-account-heart' },
        { title: 'Case Throughput Efficiency', desc: 'Moderate efficiency with delays concentrated in evidence review and documentation.', score: 63, color: 'orange', icon: 'mdi-timer-sand' },
        { title: 'Billing Recovery Forecast', desc: 'Collections expected to improve after introducing reminder automation.', score: 74, color: 'blue', icon: 'mdi-cash-check' },
        { title: 'Resource Allocation Quality', desc: 'Current staff allocation likely to cause overload in litigation team.', score: 58, color: 'red', icon: 'mdi-account-group' },
      ],
    };
  },
};
</script>
