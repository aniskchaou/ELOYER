<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="purple">mdi-scale-balance</v-icon>Court Liaison Dashboard</h1><p class="body-2 grey--text">Court filings, notices and deadline monitoring</p></v-col>
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
      <!-- Urgent Notices -->
      <v-col cols="12" md="6">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">
            Urgent Court Notices
            <v-spacer></v-spacer>
            <v-chip x-small color="error" dark v-if="urgent.length">{{ urgent.length }} urgent</v-chip>
          </v-card-title>
          <v-list dense>
            <v-list-item v-for="n in notices.slice(0,5)" :key="n.id">
              <v-list-item-icon>
                <v-icon small :color="n.is_urgent ? 'error' : 'purple'">{{ n.is_urgent ? 'mdi-alert' : 'mdi-gavel' }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ n.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ n.court_name || '—' }} · {{ n.notice_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="n.status==='received'?'blue':'success'" dark>{{ n.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!notices.length"><v-list-item-content><v-list-item-subtitle>No notices.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <!-- Upcoming Deadlines -->
      <v-col cols="12" md="6">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Upcoming Filing Deadlines</v-card-title>
          <v-list dense>
            <v-list-item v-for="f in upcomingFilings" :key="f.id">
              <v-list-item-icon><v-icon small :color="isNear(f.deadline) ? 'error' : 'purple'">mdi-calendar-alert</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ f.title }}</v-list-item-title>
                <v-list-item-subtitle :class="isNear(f.deadline) ? 'red--text' : ''">{{ f.deadline ? new Date(f.deadline).toLocaleDateString() : '—' }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="statusColor(f.status)" dark>{{ f.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!upcomingFilings.length"><v-list-item-content><v-list-item-subtitle>No upcoming deadlines.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <!-- Quick Actions -->
      <v-col cols="12">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row dense>
            <v-col cols="6" md="3"><v-btn block outlined color="purple" to="/court-liaison/notices"><v-icon left small>mdi-upload</v-icon>Upload Notice</v-btn></v-col>
            <v-col cols="6" md="3"><v-btn block outlined color="blue" to="/court-liaison/filings"><v-icon left small>mdi-clipboard-check</v-icon>Filing Tracker</v-btn></v-col>
            <v-col cols="6" md="3"><v-btn block outlined color="orange" to="/court-liaison/deadlines"><v-icon left small>mdi-clock-alert</v-icon>Deadlines</v-btn></v-col>
            <v-col cols="6" md="3"><v-btn block outlined color="teal" to="/court-liaison/communications"><v-icon left small>mdi-phone-log</v-icon>Comm Log</v-btn></v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { extGetNotices, extGetFilings } from '@/services/externalApi';
export default {
  name: 'CourtLiaisonDashboard',
  data() { return { notices: [], filings: [], loading: true }; },
  computed: {
    urgent() { return this.notices.filter(n => n.is_urgent); },
    upcomingFilings() { return this.filings.filter(f => f.status !== 'filed' && f.deadline).slice(0, 5); },
    kpis() {
      return [
        { label: 'Notices', value: this.notices.length, icon: 'mdi-gavel', color: 'purple' },
        { label: 'Urgent', value: this.urgent.length, icon: 'mdi-alert', color: 'error' },
        { label: 'Pending Filings', value: this.filings.filter(f => f.status === 'pending').length, icon: 'mdi-clipboard-clock', color: 'orange' },
        { label: 'Filed', value: this.filings.filter(f => f.status === 'filed').length, icon: 'mdi-check-circle', color: 'green' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.notices, this.filings] = await Promise.all([extGetNotices(), extGetFilings()]); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    isNear(d) { if (!d) return false; return (new Date(d) - new Date()) < 3 * 86400000; },
    statusColor(s) { const m = { pending:'orange', filed:'success', rejected:'error', in_review:'blue' }; return m[s]||'grey'; },
  },
};
</script>
