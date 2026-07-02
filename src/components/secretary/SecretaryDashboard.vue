<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="pink darken-1">mdi-briefcase-edit</v-icon>Reception Dashboard</h1><p class="body-2 grey--text">Today's appointments, messages and firm overview</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
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
          <v-card-title class="subtitle-1">Today's Appointments</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="a in appointments" :key="a.id">
              <v-list-item-icon><v-icon small :color="apptColor(a.status)">mdi-calendar-check</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ a.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ a.client_name || 'Walk-in' }} · {{ formatTime(a.appointment_date) }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="apptColor(a.status)" dark>{{ a.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!appointments.length"><v-list-item-content><v-list-item-subtitle>No appointments today.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block outlined color="pink darken-1" class="mb-2" to="/secretary/appointments"><v-icon left small>mdi-calendar-plus</v-icon>Book Appointment</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/secretary/email-templates"><v-icon left small>mdi-email</v-icon>Email Templates</v-btn>
          <v-btn block outlined color="green" class="mb-2" to="/secretary/sms-reminders"><v-icon left small>mdi-message-text</v-icon>Schedule SMS</v-btn>
          <v-btn block outlined color="teal" to="/secretary/contacts"><v-icon left small>mdi-contacts</v-icon>Contacts</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { stGetAppointments } from '@/services/staffApi';
export default {
  name: 'SecretaryDashboard',
  data() { return { appointments: [], loading: true }; },
  computed: {
    stats() {
      return [
        { label: "Today's Appts", value: this.appointments.length, icon: 'mdi-calendar', color: 'pink' },
        { label: 'Confirmed', value: this.appointments.filter(a => a.status === 'scheduled').length, icon: 'mdi-check-circle', color: 'green' },
        { label: 'Cancelled', value: this.appointments.filter(a => a.status === 'cancelled').length, icon: 'mdi-close-circle', color: 'red' },
        { label: 'Completed', value: this.appointments.filter(a => a.status === 'completed').length, icon: 'mdi-flag-checkered', color: 'blue' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.appointments = await stGetAppointments(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    formatTime(d) { return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; },
    apptColor(s) { return s === 'scheduled' ? 'blue' : s === 'completed' ? 'success' : s === 'cancelled' ? 'error' : 'orange'; },
  },
};
</script>
