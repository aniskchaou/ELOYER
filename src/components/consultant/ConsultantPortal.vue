<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="blue-grey">mdi-account-star</v-icon>Consultant Portal</h1><p class="body-2 grey--text">Expert witness and consultant workspace</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in kpis" :key="s.label">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <v-icon :color="s.color" large>{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">My Expert Reports</v-card-title>
          <v-list dense>
            <v-list-item v-for="r in reports.slice(0,5)" :key="r.id">
              <v-list-item-icon><v-icon small :color="reportColor(r.status)">mdi-file-document-edit</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ r.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ r.case_title || 'General' }} · {{ r.report_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="reportColor(r.status)" dark>{{ r.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!reports.length"><v-list-item-content><v-list-item-subtitle>No reports yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
          <v-card-actions><v-btn x-small text color="blue-grey" to="/consultant/reports">View all →</v-btn></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="blue-grey darken-1" dark class="mb-2" to="/consultant/reports"><v-icon left small>mdi-file-plus</v-icon>Submit Expert Report</v-btn>
          <v-btn block outlined color="teal" class="mb-2" to="/consultant/evidence"><v-icon left small>mdi-paperclip</v-icon>Review Evidence</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/consultant/calendar"><v-icon left small>mdi-calendar</v-icon>My Calendar</v-btn>
          <v-btn block outlined color="orange" to="/consultant/invoices"><v-icon left small>mdi-receipt</v-icon>My Invoices</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { extGetReports } from '@/services/externalApi';
export default {
  name: 'ConsultantPortal',
  data() { return { reports: [], loading: true }; },
  computed: {
    kpis() {
      return [
        { label: 'Reports Submitted', value: this.reports.length, icon: 'mdi-file-document', color: 'blue-grey' },
        { label: 'Under Review', value: this.reports.filter(r => r.status === 'submitted').length, icon: 'mdi-clock', color: 'orange' },
        { label: 'Accepted', value: this.reports.filter(r => r.status === 'accepted').length, icon: 'mdi-check-circle', color: 'green' },
        { label: 'Cases', value: new Set(this.reports.filter(r => r.case_id).map(r => r.case_id)).size, icon: 'mdi-folder', color: 'teal' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reports = await extGetReports({ user_id: 1 }); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    reportColor(s) { const m = { draft:'grey', submitted:'orange', accepted:'success', rejected:'error' }; return m[s]||'grey'; },
  },
};
</script>
