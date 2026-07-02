<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="teal darken-2">mdi-calendar-clock</v-icon>AI Deadline Prediction</h1>
      <p class="body-2 grey--text">Predict upcoming legal deadlines based on case data</p></v-col>
      <v-col cols="auto"><v-chip color="teal darken-2" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4">
          <v-text-field v-model="form.case_title" label="Case Title" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.case_type" :items="['Civil','Commercial','Labour','Criminal','Family','Corporate']" label="Case Type" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="form.filed_date" label="Date Filed" outlined dense type="date" class="mb-2"></v-text-field>
          <v-btn color="teal darken-2" dark block :loading="loading" @click="run" class="mt-2">
            <v-icon left>mdi-auto-fix</v-icon>Predict Deadlines
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-skeleton-loader v-if="loading" type="list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line"></v-skeleton-loader>
        <v-card outlined v-else-if="deadlines.length">
          <v-list dense>
            <v-list-item v-for="d in deadlines" :key="d.event">
              <v-list-item-icon>
                <v-icon :color="d.confidence > 80 ? 'success' : d.confidence > 60 ? 'orange' : 'grey'">mdi-calendar-check</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">{{ d.event }}</v-list-item-title>
                <v-list-item-subtitle>{{ d.basis }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="text-right" style="min-width:120px">
                <div class="caption font-weight-bold">{{ d.predicted_date }}</div>
                <v-chip x-small :color="d.confidence > 80 ? 'success' : 'orange'" dark>{{ d.confidence }}% confidence</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
        <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-calendar-question</v-icon><p class="mt-2">Enter case details to predict deadlines.</p></div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { aiDeadlinePrediction } from '@/services/aiPremiumApi';
export default {
  name: 'AIDeadlinePrediction',
  data() { return { form: { case_title: '', case_type: 'Civil', filed_date: '' }, deadlines: [], loading: false }; },
  methods: {
    async run() {
      this.loading = true; this.deadlines = [];
      try { const r = await aiDeadlinePrediction(this.form); this.deadlines = r.deadlines; }
      catch (e) { console.error(e); } finally { this.loading = false; }
    },
  },
};
</script>
