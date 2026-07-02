<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Accounting Integration</h1><p class="body-2 grey--text">Connect ELoyer with QuickBooks, Xero or Sage</p></v-col></v-row>
    <v-row>
      <v-col v-for="pkg in packages" :key="pkg.name" cols="12" md="4">
        <v-card outlined class="pa-4 text-center">
          <v-icon x-large :color="pkg.color" class="mb-3">{{ pkg.icon }}</v-icon>
          <div class="subtitle-1 font-weight-bold mb-2">{{ pkg.name }}</div>
          <v-chip small :color="pkg.connected ? 'success' : 'grey'" dark class="mb-3">{{ pkg.connected ? 'Connected' : 'Not Connected' }}</v-chip>
          <div v-if="pkg.connected" class="caption grey--text mb-3">Last sync: {{ pkg.lastSync }}</div>
          <div v-else class="caption grey--text mb-3">{{ pkg.desc }}</div>
          <v-btn :color="pkg.connected ? 'error' : pkg.color" :outlined="pkg.connected" block small @click="toggle(pkg)">{{ pkg.connected ? 'Disconnect' : 'Connect' }}</v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Synced Data</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col cols="6" md="3" v-for="d in syncData" :key="d.label">
          <div class="text-center">
            <v-icon :color="d.color" large>{{ d.icon }}</v-icon>
            <div class="caption mt-1">{{ d.label }}</div>
            <v-chip x-small :color="d.color" dark class="mt-1">{{ d.status }}</v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <v-snackbar v-model="snack" color="success" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'AccountingIntegration',
  data() {
    return {
      packages: [
        { name: 'QuickBooks', icon: 'mdi-calculator', color: 'green darken-2', connected: false, desc: 'Sync invoices, payments and expenses.' },
        { name: 'Xero', icon: 'mdi-chart-line', color: 'blue darken-1', connected: false, desc: 'Two-way sync for all financial records.' },
        { name: 'Sage', icon: 'mdi-leaf', color: 'teal darken-1', connected: false, desc: 'Export billing data to Sage 50 or Sage 200.' },
      ],
      syncData: [
        { label: 'Invoices', icon: 'mdi-receipt', color: 'green', status: 'Auto-sync' },
        { label: 'Payments', icon: 'mdi-cash-check', color: 'teal', status: 'Auto-sync' },
        { label: 'Expenses', icon: 'mdi-credit-card', color: 'orange', status: 'Manual' },
        { label: 'Payroll', icon: 'mdi-account-cash', color: 'blue', status: 'Export only' },
      ],
      snack: false, snackMsg: '',
    };
  },
  methods: {
    toggle(pkg) {
      pkg.connected = !pkg.connected;
      if (pkg.connected) pkg.lastSync = new Date().toLocaleString();
      this.snackMsg = pkg.connected ? `${pkg.name} connected.` : `${pkg.name} disconnected.`;
      this.snack = true;
    },
  },
};
</script>
