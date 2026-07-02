<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="teal">mdi-desk-lamp</v-icon>Reception Desk</h1><p class="body-2 grey--text">Front desk overview — visitors, queue and appointments</p></v-col>
      <v-col cols="auto"><v-chip color="teal" dark>{{ new Date().toLocaleDateString('fr-TN', {weekday:'long', day:'numeric', month:'long'}) }}</v-chip></v-col>
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
      <!-- Today's Visitors -->
      <v-col cols="12" md="7">
        <v-card outlined>
          <v-card-title class="subtitle-1">Today's Visitors</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="v in visitors" :key="v.id">
              <v-list-item-avatar color="teal" size="32">
                <span class="white--text caption">{{ v.full_name.charAt(0) }}</span>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ v.full_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ v.company || 'Individual' }} · {{ v.purpose || 'No purpose stated' }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center">
                <v-chip x-small :color="v.status==='checked_in'?'teal':'grey'" dark class="mr-2">{{ v.status }}</v-chip>
                <v-btn x-small outlined color="teal" v-if="v.status==='checked_in'" @click="checkout(v)">Check Out</v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!visitors.length"><v-list-item-content><v-list-item-subtitle>No visitors today.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Queue + Quick Actions -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Live Queue</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="q in queue" :key="q.id">
              <v-list-item-icon>
                <v-avatar color="teal" size="28"><span class="white--text caption font-weight-bold">#{{ q.queue_number }}</span></v-avatar>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ q.visitor_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ q.service_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn x-small color="teal" dark @click="callNext(q)" v-if="q.status==='waiting'">Call</v-btn>
                <v-btn x-small color="success" @click="serveNext(q)" v-else-if="q.status==='called'">Serve</v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!queue.length"><v-list-item-content><v-list-item-subtitle>Queue is empty.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="teal" dark class="mb-2" to="/reception/visitors"><v-icon left small>mdi-account-plus</v-icon>Check In Visitor</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/reception/booking"><v-icon left small>mdi-calendar-plus</v-icon>Book Appointment</v-btn>
          <v-btn block outlined color="orange" to="/reception/intake"><v-icon left small>mdi-clipboard-text</v-icon>New Intake Form</v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetVisitors, stCheckOut, stGetQueue, stCallQueue, stServeQueue } from '@/services/staffApi';
export default {
  name: 'ReceptionDashboard',
  data() { return { visitors: [], queue: [], loading: true, snack: false, snackMsg: '', snackColor: 'success' }; },
  computed: {
    stats() {
      return [
        { label: "Visitors Today", value: this.visitors.length, icon: 'mdi-account-group', color: 'teal' },
        { label: 'Checked In', value: this.visitors.filter(v => v.status === 'checked_in').length, icon: 'mdi-account-check', color: 'green' },
        { label: 'Waiting', value: this.queue.filter(q => q.status === 'waiting').length, icon: 'mdi-clock', color: 'orange' },
        { label: 'Served', value: this.queue.filter(q => q.status === 'served').length, icon: 'mdi-flag-checkered', color: 'blue' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.visitors, this.queue] = await Promise.all([stGetVisitors(), stGetQueue()]); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async checkout(v) {
      try { await stCheckOut(v.id); this.notify(`${v.full_name} checked out.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async callNext(q) {
      try { await stCallQueue(q.id); this.notify(`Calling #${q.queue_number}`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async serveNext(q) {
      try { await stServeQueue(q.id); this.notify(`#${q.queue_number} served.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
