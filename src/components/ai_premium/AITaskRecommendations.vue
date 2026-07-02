<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="orange darken-2">mdi-clipboard-list</v-icon>AI Task Recommendations</h1>
      <p class="body-2 grey--text">Get AI-suggested tasks based on case stage and deadlines</p></v-col>
      <v-col cols="auto"><v-chip color="orange darken-2" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4">
          <v-text-field v-model="form.case_title" label="Case Title" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.case_stage" :items="['Intake','Pre-Trial','Discovery','Trial','Post-Trial','Appeal']" label="Case Stage" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="form.hearing_days" label="Days Until Next Hearing" outlined dense type="number" class="mb-2"></v-text-field>
          <v-btn color="orange darken-2" dark block :loading="loading" @click="run" class="mt-2">
            <v-icon left>mdi-auto-fix</v-icon>Get Recommendations
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-skeleton-loader v-if="loading" type="list-item-three-line, list-item-three-line, list-item-three-line"></v-skeleton-loader>
        <v-card outlined v-else-if="tasks.length">
          <v-list dense>
            <v-list-item v-for="(t, i) in tasks" :key="i">
              <v-list-item-icon>
                <v-avatar size="28" :color="priorityColor(t.priority)" dark>
                  <span class="white--text caption font-weight-bold">{{ i+1 }}</span>
                </v-avatar>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">{{ t.title }}</v-list-item-title>
                <v-list-item-subtitle>Due in {{ t.due_days }} days · {{ t.reason }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="priorityColor(t.priority)" dark>{{ t.priority }}</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
        <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-clipboard-list-outline</v-icon><p class="mt-2">Fill in case details to get task recommendations.</p></div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { aiTaskRecommendations } from '@/services/aiPremiumApi';
export default {
  name: 'AITaskRecommendations',
  data() { return { form: { case_title: '', case_stage: 'Pre-Trial', hearing_days: 10 }, tasks: [], loading: false }; },
  methods: {
    async run() {
      this.loading = true; this.tasks = [];
      try { const r = await aiTaskRecommendations(this.form); this.tasks = r.tasks; }
      catch (e) { console.error(e); } finally { this.loading = false; }
    },
    priorityColor(p) { return p === 'high' ? 'error' : p === 'normal' ? 'blue' : 'grey'; },
  },
};
</script>
