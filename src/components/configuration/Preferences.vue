<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Preferences</h1><p class="body-2 grey--text">Configure firm-wide application preferences</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">General Settings</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="prefs.language" :items="languages" label="Language" outlined dense></v-select>
          <v-select v-model="prefs.timezone" :items="timezones" label="Timezone" outlined dense class="mt-3"></v-select>
          <v-select v-model="prefs.dateFormat" :items="dateFormats" label="Date Format" outlined dense class="mt-3"></v-select>
          <v-select v-model="prefs.currency" :items="currencies" label="Default Currency" outlined dense class="mt-3"></v-select>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">Notification Preferences</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-switch v-model="prefs.notifications.email" label="Email Notifications" inset></v-switch>
          <v-switch v-model="prefs.notifications.sms" label="SMS Notifications" inset></v-switch>
          <v-switch v-model="prefs.notifications.push" label="Push Notifications" inset></v-switch>
          <v-switch v-model="prefs.notifications.billing" label="Billing Alerts" inset></v-switch>
          <v-switch v-model="prefs.notifications.hearings" label="Hearing Reminders" inset></v-switch>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Dashboard Defaults</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="prefs.dashboardHome" :items="dashboardViews" label="Default Dashboard" outlined dense></v-select>
          <v-checkbox v-model="prefs.showKpiCards" label="Show KPI cards on login" class="mt-2"></v-checkbox>
          <v-checkbox v-model="prefs.compactTables" label="Use compact tables" class="mt-0"></v-checkbox>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-right">
        <v-btn color="primary" @click="save"><v-icon left>mdi-content-save</v-icon> Save Preferences</v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="2000">Preferences saved successfully.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'Preferences',
  data() {
    return {
      snackbar: false,
      languages: ['English', 'French', 'Arabic'],
      timezones: ['Africa/Tunis', 'Europe/Paris', 'UTC'],
      dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      currencies: ['EUR', 'TND', 'USD'],
      dashboardViews: ['Executive Overview', 'Cases Focus', 'Billing Focus', 'Custom'],
      prefs: {
        language: 'French',
        timezone: 'Africa/Tunis',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        dashboardHome: 'Executive Overview',
        showKpiCards: true,
        compactTables: false,
        notifications: {
          email: true,
          sms: false,
          push: true,
          billing: true,
          hearings: true,
        },
      },
    };
  },
  methods: {
    save() { this.snackbar = true; },
  },
};
</script>
