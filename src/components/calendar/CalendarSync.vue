<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Calendar Sync</h1><p class="body-2 grey--text">Sync your legal calendar with external calendar services</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="syncAll"><v-icon left>mdi-sync</v-icon> Sync All</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="svc in services" :key="svc.name" cols="12" md="4">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon :color="svc.color" size="32" class="mr-3">{{ svc.icon }}</v-icon>
            <div>
              <div class="subtitle-1 font-weight-bold">{{ svc.name }}</div>
              <v-chip x-small :color="svc.connected ? 'green' : 'grey'" dark>{{ svc.connected ? 'Connected' : 'Not Connected' }}</v-chip>
            </div>
            <v-spacer></v-spacer>
            <v-switch v-model="svc.connected" dense hide-details></v-switch>
          </div>
          <div class="caption grey--text mb-2">Last sync: {{ svc.lastSync }}</div>
          <div class="caption mb-3">{{ svc.synced }} events synced</div>
          <v-btn small block :color="svc.connected ? 'primary' : 'grey'" :disabled="!svc.connected" @click="syncService(svc)" outlined>
            <v-icon left small>mdi-sync</v-icon> Sync Now
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined class="mb-4">
      <v-card-title>Sync Settings</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select v-model="settings.frequency" :items="['Every hour','Every 6 hours','Daily','Manual only']" label="Sync Frequency" outlined dense></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="settings.direction" :items="['Two-way','Import only','Export only']" label="Sync Direction" outlined dense></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="settings.eventTypes" :items="eventTypes" label="Event Types to Sync" multiple chips outlined dense></v-select>
          </v-col>
          <v-col cols="12">
            <v-btn color="primary" @click="saveSettings">Save Settings</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title>Sync Log</v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="logHeaders" :items="syncLog" dense>
        <template v-slot:item.status="{ item }">
          <v-chip x-small :color="item.status === 'Success' ? 'green' : 'red'" dark>{{ item.status }}</v-chip>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar" timeout="3000" color="success">{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'CalendarSync',
  data() {
    return {
      snackbar: false, snackMsg: '',
      services: [
        { name: 'Google Calendar', icon: 'mdi-google', color: 'red', connected: true, lastSync: '2026-05-01 09:00', synced: 45 },
        { name: 'Microsoft Outlook', icon: 'mdi-microsoft-outlook', color: 'blue', connected: true, lastSync: '2026-05-01 09:00', synced: 38 },
        { name: 'Apple iCloud', icon: 'mdi-apple', color: 'grey darken-1', connected: false, lastSync: 'Never', synced: 0 },
      ],
      settings: { frequency: 'Every hour', direction: 'Two-way', eventTypes: ['Hearings', 'Meetings', 'Deadlines'] },
      eventTypes: ['Hearings', 'Meetings', 'Deadlines', 'Client Calls', 'Internal Events', 'Reminders'],
      logHeaders: [{ text: 'Date', value: 'date' }, { text: 'Service', value: 'service' }, { text: 'Events', value: 'events' }, { text: 'Status', value: 'status' }, { text: 'Message', value: 'message' }],
      syncLog: [
        { date: '2026-05-01 09:00', service: 'Google Calendar', events: 3, status: 'Success', message: '3 events synced' },
        { date: '2026-05-01 08:00', service: 'Outlook', events: 1, status: 'Success', message: '1 event synced' },
        { date: '2026-04-30 09:00', service: 'Google Calendar', events: 0, status: 'Success', message: 'No changes' },
      ],
    };
  },
  methods: {
    syncService(svc) { svc.lastSync = new Date().toLocaleString(); this.snackMsg = svc.name + ' synced!'; this.snackbar = true; },
    syncAll() { this.services.filter(s => s.connected).forEach(s => { s.lastSync = new Date().toLocaleString(); }); this.snackMsg = 'All calendars synced!'; this.snackbar = true; },
    saveSettings() { this.snackMsg = 'Settings saved!'; this.snackbar = true; },
  },
};
</script>
