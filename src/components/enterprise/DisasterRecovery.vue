<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Disaster Recovery</h1><p class="body-2 grey--text">Automated backups, restore points and business continuity</p></v-col>
      <v-col cols="auto"><v-btn color="brown darken-1" dark :loading="triggering" @click="triggerBackup"><v-icon left>mdi-database-plus</v-icon>Backup Now</v-btn></v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <v-icon :color="s.color" large>{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="body-1 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Config -->
    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Backup Configuration</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense v-if="drStats">
            <v-list-item><v-list-item-content><v-list-item-title>Schedule</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="green" dark>{{ drStats.schedule }}</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Retention</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>{{ drStats.retention_days }} days</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Offsite Storage</v-list-item-title></v-list-item-content><v-list-item-action><v-icon color="success">mdi-check-circle</v-icon></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Encryption</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="green" dark>{{ drStats.encryption }}</v-chip></v-list-item-action></v-list-item>
          </v-list>
        </v-card>
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Recovery Time Objectives</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item><v-list-item-content><v-list-item-title>RTO (Recovery Time)</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="orange" dark>4 hours</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>RPO (Recovery Point)</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="blue" dark>24 hours</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Last Test</v-list-item-title></v-list-item-content><v-list-item-action><span class="caption">2026-06-01</span></v-list-item-action></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Backup History (Last 20)</v-card-title>
          <v-data-table :headers="headers" :items="logs" dense class="elevation-0">
            <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='completed'?'success':'error'" dark>{{ item.status }}</v-chip></template>
            <template v-slot:item.size_bytes="{ item }">{{ item.size_bytes ? (item.size_bytes / 1048576).toFixed(1) + ' MB' : '—' }}</template>
            <template v-slot:item.duration_seconds="{ item }">{{ item.duration_seconds }}s</template>
            <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleString() }}</template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetDR, entTriggerBackup } from '@/services/enterpriseApi';
export default {
  name: 'DisasterRecovery',
  data() {
    return {
      logs: [], drStats: null, loading: true, triggering: false, snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Type', value: 'backup_type' }, { text: 'Status', value: 'status' },
        { text: 'Size', value: 'size_bytes' }, { text: 'Duration', value: 'duration_seconds' },
        { text: 'By', value: 'initiated_by' }, { text: 'Date', value: 'created_at' },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Backups', value: this.drStats ? this.drStats.total_backups : 0, icon: 'mdi-database', color: 'brown' },
        { label: 'Total Size', value: this.drStats ? this.drStats.total_size_gb + ' GB' : '0 GB', icon: 'mdi-database-check', color: 'green' },
        { label: 'Last Backup', value: this.drStats && this.drStats.last_backup ? new Date(this.drStats.last_backup).toLocaleDateString() : '—', icon: 'mdi-clock', color: 'blue' },
        { label: 'Encryption', value: this.drStats ? this.drStats.encryption : 'AES-256', icon: 'mdi-lock', color: 'indigo' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { const r = await entGetDR(); this.logs = r.logs; this.drStats = r.stats; }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async triggerBackup() {
      this.triggering = true;
      try { await entTriggerBackup(); this.snackMsg = 'Backup completed successfully.'; this.snackColor = 'success'; this.snack = true; this.load(); }
      catch (e) { this.snackMsg = e.message; this.snackColor = 'error'; this.snack = true; }
      finally { this.triggering = false; }
    },
  },
};
</script>
