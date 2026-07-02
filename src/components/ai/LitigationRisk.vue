<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Litigation Risk</h1><p class="body-2 grey--text">Identify and monitor litigation risk factors</p></v-col>
    </v-row>

    <v-row>
      <v-col v-for="r in risks" :key="r.title" cols="12" md="6">
        <v-card outlined class="pa-4 mb-3">
          <div class="d-flex align-center">
            <v-icon :color="levelColor(r.level)" class="mr-2">mdi-alert-circle</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ r.title }}</div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="levelColor(r.level)" dark>{{ r.level }}</v-chip>
          </div>
          <p class="caption grey--text mt-2">{{ r.detail }}</p>
          <v-progress-linear :value="r.score" height="10" rounded :color="levelColor(r.level)"></v-progress-linear>
          <div class="caption mt-1">Risk score: {{ r.score }}%</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'LitigationRisk',
  data() {
    return {
      risks: [
        { title: 'Weak documentary evidence chain', level: 'High', score: 82, detail: 'Missing document signatures and inconsistent timestamps in evidence set.' },
        { title: 'Procedural deadline pressure', level: 'Medium', score: 63, detail: 'Upcoming filing deadlines create execution risk across two active matters.' },
        { title: 'Counterparty settlement inclination', level: 'Low', score: 31, detail: 'Signals indicate favorable settlement probability before hearing date.' },
        { title: 'Witness reliability variance', level: 'Medium', score: 57, detail: 'Two witness statements contain minor contradictions requiring reconciliation.' },
      ],
    };
  },
  methods: {
    levelColor(level) { return level === 'High' ? 'red' : level === 'Medium' ? 'orange' : 'green'; },
  },
};
</script>
