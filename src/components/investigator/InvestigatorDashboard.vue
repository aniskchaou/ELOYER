<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="amber darken-3">mdi-magnify-scan</v-icon>Investigation Board</h1><p class="body-2 grey--text">Active case investigations, findings and evidence</p></v-col>
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
          <v-card-title class="subtitle-1">Recent Findings</v-card-title>
          <v-list dense>
            <v-list-item v-for="f in findings.slice(0,5)" :key="f.id">
              <v-list-item-icon>
                <v-icon small :color="f.is_confidential?'error':'amber darken-3'">{{ f.is_confidential ? 'mdi-lock' : 'mdi-magnify' }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ f.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ f.case_title }} · {{ f.finding_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="f.is_confidential?'error':'amber darken-3'" dark>{{ f.is_confidential ? 'CONFIDENTIAL' : f.status }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!findings.length"><v-list-item-content><v-list-item-subtitle>No findings yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="amber darken-3" dark class="mb-2" to="/investigator/findings"><v-icon left small>mdi-plus</v-icon>Add Finding</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/investigator/interviews"><v-icon left small>mdi-microphone</v-icon>Record Interview</v-btn>
          <v-btn block outlined color="orange" class="mb-2" to="/investigator/custody"><v-icon left small>mdi-shield-lock</v-icon>Chain of Custody</v-btn>
          <v-btn block outlined color="teal" to="/investigator/gps"><v-icon left small>mdi-map-marker</v-icon>GPS Logs</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { extGetFindings, extGetInterviews } from '@/services/externalApi';
export default {
  name: 'InvestigatorDashboard',
  data() { return { findings: [], interviews: [], loading: true }; },
  computed: {
    kpis() {
      return [
        { label: 'Findings', value: this.findings.length, icon: 'mdi-magnify', color: 'amber darken-3' },
        { label: 'Confidential', value: this.findings.filter(f => f.is_confidential).length, icon: 'mdi-lock', color: 'error' },
        { label: 'Interviews', value: this.interviews.length, icon: 'mdi-microphone', color: 'blue' },
        { label: 'Active Cases', value: new Set(this.findings.map(f => f.case_id)).size, icon: 'mdi-folder', color: 'teal' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.findings, this.interviews] = await Promise.all([extGetFindings({ investigator_id: 1 }), extGetInterviews()]); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
