<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Performance Reviews</h1><p class="body-2 grey--text">Evaluate staff performance and track development</p></v-col>
      <v-col cols="auto"><v-btn color="brown darken-1" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>New Review</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="reviews" dense class="elevation-0">
        <template v-slot:item.overall_score="{ item }">
          <v-rating :value="item.overall_score/2" half-increments readonly dense small color="amber" background-color="grey lighten-2"></v-rating>
          <span class="caption ml-1">{{ item.overall_score }}/10</span>
        </template>
        <template v-slot:item.goals_met="{ item }"><v-icon :color="item.goals_met?'success':'error'" small>{{ item.goals_met ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='submitted'?'success':'grey'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="viewReview(item)"><v-icon small>mdi-eye</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <!-- New Review Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>New Performance Review</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="6"><v-select v-model="form.user_id" :items="employees" item-text="full_name" item-value="id" label="Employee *" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.review_period" label="Review Period *" outlined dense placeholder="e.g. Q2 2026"></v-text-field></v-col>
            <v-col cols="12">
              <div class="caption grey--text mb-1">Overall Score: {{ form.overall_score }}/10</div>
              <v-slider v-model="form.overall_score" min="1" max="10" step="1" thumb-label ticks color="brown"></v-slider>
            </v-col>
            <v-col cols="12"><v-switch v-model="form.goals_met" label="Goals Met" inset hide-details class="mb-2"></v-switch></v-col>
            <v-col cols="6"><v-textarea v-model="form.strengths" label="Strengths" outlined rows="3"></v-textarea></v-col>
            <v-col cols="6"><v-textarea v-model="form.improvements" label="Areas for Improvement" outlined rows="3"></v-textarea></v-col>
            <v-col cols="12"><v-textarea v-model="form.comments" label="Additional Comments" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="brown darken-1" dark :loading="saving" @click="submit">Submit Review</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Review Dialog -->
    <v-dialog v-model="viewDialog" max-width="540">
      <v-card v-if="selected">
        <v-card-title>{{ selected.employee_name }} — {{ selected.review_period }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-3">
          <div class="mb-2"><strong>Score:</strong> {{ selected.overall_score }}/10 · Goals met: {{ selected.goals_met ? 'Yes' : 'No' }}</div>
          <div v-if="selected.strengths" class="mb-2"><strong>Strengths:</strong> {{ selected.strengths }}</div>
          <div v-if="selected.improvements" class="mb-2"><strong>Improvements:</strong> {{ selected.improvements }}</div>
          <div v-if="selected.comments" class="mb-2"><strong>Comments:</strong> {{ selected.comments }}</div>
          <div class="caption grey--text mt-2">Reviewed by: {{ selected.reviewer_name }}</div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { hrGetPerformance, hrCreatePerformance } from '@/services/hrApi';
export default {
  name: 'PerformanceTracking',
  data() {
    return {
      reviews: [], loading: true, dialog: false, viewDialog: false, saving: false, selected: null,
      form: { user_id: null, reviewer_id: 1, review_period: '', overall_score: 7, goals_met: true, strengths: '', improvements: '', comments: '' },
      employees: [{ id: 1, full_name: 'Ahmed Cherni' }, { id: 2, full_name: 'System Admin' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Employee', value: 'employee_name' }, { text: 'Period', value: 'review_period' },
        { text: 'Score', value: 'overall_score' }, { text: 'Goals', value: 'goals_met' },
        { text: 'Reviewer', value: 'reviewer_name' }, { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reviews = await hrGetPerformance(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async submit() {
      if (!this.form.user_id || !this.form.review_period) return;
      this.saving = true;
      try { await hrCreatePerformance(this.form); this.notify('Review submitted.'); this.dialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    viewReview(r) { this.selected = r; this.viewDialog = true; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
