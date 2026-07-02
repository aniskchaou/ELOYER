<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="teal">mdi-account-circle</v-icon>Welcome, Client</h1>
        <p class="body-2 grey--text">Your personal legal dashboard — cases, documents and messages</p>
      </v-col>
      <v-col cols="auto">
        <v-badge :content="unreadCount" :value="unreadCount > 0" color="error" overlap>
          <v-btn icon><v-icon>mdi-bell</v-icon></v-btn>
        </v-badge>
      </v-col>
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
      <!-- Active Cases -->
      <v-col cols="12" md="7">
        <v-card outlined>
          <v-card-title class="subtitle-1">My Cases</v-card-title>
          <v-list dense>
            <v-list-item v-for="c in (data.cases||[]).slice(0,4)" :key="c.id">
              <v-list-item-icon><v-icon small :color="statusColor(c.status)">mdi-folder</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ c.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ c.lawyer_name }} · {{ c.case_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="statusColor(c.status)" dark>{{ c.status }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!(data.cases||[]).length"><v-list-item-content><v-list-item-subtitle>No active cases.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
          <v-card-actions><v-btn x-small text color="teal" to="/client/cases">View all →</v-btn></v-card-actions>
        </v-card>
      </v-col>

      <!-- Unread Updates + Quick Actions -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4" v-if="(data.unread_updates||[]).length">
          <v-card-title class="subtitle-1 pb-2">New Updates</v-card-title>
          <v-divider class="mb-2"></v-divider>
          <v-list dense>
            <v-list-item v-for="u in (data.unread_updates||[]).slice(0,3)" :key="u.id">
              <v-list-item-icon><v-icon small color="teal">mdi-bell</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ u.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(u.created_at).toLocaleDateString() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="teal" dark class="mb-2" to="/client/invoices"><v-icon left small>mdi-credit-card</v-icon>Pay Invoice</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/client/documents"><v-icon left small>mdi-file-upload</v-icon>Upload Document</v-btn>
          <v-btn block outlined color="purple" class="mb-2" to="/client/appointments"><v-icon left small>mdi-calendar-plus</v-icon>Book Appointment</v-btn>
          <v-btn block outlined color="orange" to="/client/chat"><v-icon left small>mdi-message</v-icon>Message Lawyer</v-btn>
        </v-card>
      </v-col>

      <!-- Upcoming Appointments -->
      <v-col cols="12" v-if="(data.upcoming_appointments||[]).length">
        <v-card outlined>
          <v-card-title class="subtitle-1">Upcoming Appointments</v-card-title>
          <v-list dense>
            <v-list-item v-for="a in data.upcoming_appointments" :key="a.id">
              <v-list-item-icon><v-icon small color="blue">mdi-calendar-check</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ a.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(a.appointment_date).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}) }} · {{ a.location || 'Office' }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { cpGetDashboard } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientPortal',
  data() { return { data: {}, loading: true }; },
  computed: {
    unreadCount() { return (this.data.unread_updates || []).length; },
    kpis() {
      return [
        { label: 'Active Cases', value: (this.data.cases || []).filter(c => c.status !== 'closed').length, icon: 'mdi-folder-open', color: 'teal' },
        { label: 'Documents', value: this.data.document_count || 0, icon: 'mdi-file-document', color: 'blue' },
        { label: 'Unpaid Invoices', value: (this.data.invoices || []).filter(i => i.status === 'pending').length, icon: 'mdi-receipt', color: 'orange' },
        { label: 'Appointments', value: (this.data.upcoming_appointments || []).length, icon: 'mdi-calendar', color: 'purple' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await cpGetDashboard(CLIENT_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    statusColor(s) { const m = { open:'blue', in_progress:'orange', closed:'grey', won:'success' }; return m[s]||'grey'; },
  },
};
</script>
