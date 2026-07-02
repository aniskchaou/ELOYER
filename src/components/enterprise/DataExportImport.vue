<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Data Export / Import</h1><p class="body-2 grey--text">Export firm data as CSV or JSON for backup or migration</p></v-col>
      <v-col cols="auto"><v-btn color="teal darken-1" dark @click="openCreate"><v-icon left>mdi-database-export</v-icon>New Export</v-btn></v-col>
    </v-row>

    <v-row>
      <!-- Export Types -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Available Exports</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="e in exportTypes" :key="e.type" @click="quickExport(e.type)" style="cursor:pointer">
              <v-list-item-icon><v-icon small :color="e.color">{{ e.icon }}</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ e.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ e.desc }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-btn x-small outlined :color="e.color" :loading="exporting === e.type">Export</v-btn></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Export History -->
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Export History</v-card-title>
          <v-data-table :headers="headers" :items="exports" dense class="elevation-0">
            <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status === 'completed' ? 'success' : item.status === 'processing' ? 'orange' : 'error'" dark>{{ item.status }}</v-chip></template>
            <template v-slot:item.file_size_bytes="{ item }">{{ item.file_size_bytes ? (item.file_size_bytes / 1024).toFixed(0) + ' KB' : '—' }}</template>
            <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small color="blue" v-if="item.status === 'completed'" :href="item.file_url || '#'" title="Download"><v-icon small>mdi-download</v-icon></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetExports, entCreateExport } from '@/services/enterpriseApi';
export default {
  name: 'DataExportImport',
  data() {
    return {
      exports: [], loading: true, exporting: null, snack: false, snackMsg: '', snackColor: 'success',
      exportTypes: [
        { type: 'cases', label: 'All Cases', desc: 'Case titles, types, statuses, dates', icon: 'mdi-folder', color: 'blue' },
        { type: 'clients', label: 'Client List', desc: 'Client names, emails, phones', icon: 'mdi-account-group', color: 'teal' },
        { type: 'invoices', label: 'Invoices & Payments', desc: 'All billing records', icon: 'mdi-receipt', color: 'green' },
        { type: 'users', label: 'Staff Directory', desc: 'Users, roles, departments', icon: 'mdi-account-multiple', color: 'indigo' },
        { type: 'documents', label: 'Document Index', desc: 'Document metadata and links', icon: 'mdi-file-document', color: 'orange' },
        { type: 'audit_logs', label: 'Audit Logs', desc: 'Platform activity history', icon: 'mdi-history', color: 'brown' },
        { type: 'full_backup', label: 'Full Data Backup', desc: 'All firm data in JSON format', icon: 'mdi-database', color: 'red darken-1' },
      ],
      headers: [
        { text: 'Type', value: 'export_type' }, { text: 'Status', value: 'status' },
        { text: 'Rows', value: 'row_count' }, { text: 'Size', value: 'file_size_bytes' },
        { text: 'Date', value: 'created_at' }, { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.exports = await entGetExports(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {},
    async quickExport(type) {
      this.exporting = type;
      try {
        await entCreateExport({ export_type: type, requested_by: 1 });
        this.notify(`Export started. It will be ready in a few seconds.`);
        setTimeout(() => this.load(), 3500);
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.exporting = null; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
