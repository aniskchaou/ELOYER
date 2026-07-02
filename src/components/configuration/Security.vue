<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Security Settings</h1><p class="body-2 grey--text">Manage authentication, password policy, and login audit</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">Authentication</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-switch v-model="security.twoFactorRequired" label="Require Two-Factor Authentication" inset></v-switch>
          <v-switch v-model="security.rememberDevice" label="Allow Trusted Devices" inset></v-switch>
          <v-select v-model="security.sessionTimeout" :items="timeouts" label="Session Timeout" outlined dense class="mt-3"></v-select>
          <v-select v-model="security.passwordExpiry" :items="passwordExpiries" label="Password Expiry" outlined dense class="mt-3"></v-select>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Password Policy</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model.number="security.minLength" label="Minimum Length" type="number" outlined dense></v-text-field>
          <v-checkbox v-model="security.requireUpper" label="Require uppercase letters" class="mt-1"></v-checkbox>
          <v-checkbox v-model="security.requireNumber" label="Require numbers" class="mt-0"></v-checkbox>
          <v-checkbox v-model="security.requireSpecial" label="Require special characters" class="mt-0"></v-checkbox>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1">Recent Login Activity</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="headers" :items="logs" dense>
            <template v-slot:item.status="{ item }">
              <v-chip x-small :color="item.status === 'Success' ? 'green' : 'red'" dark>{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.risk="{ item }">
              <v-chip x-small :color="item.risk === 'Low' ? 'green' : item.risk === 'Medium' ? 'orange' : 'red'" dark>{{ item.risk }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-right">
        <v-btn color="primary" @click="save"><v-icon left>mdi-content-save</v-icon> Save Security Settings</v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="2000">Security settings saved.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'Security',
  data() {
    return {
      snackbar: false,
      timeouts: ['15 minutes', '30 minutes', '1 hour', '4 hours'],
      passwordExpiries: ['30 days', '60 days', '90 days', 'Never'],
      security: {
        twoFactorRequired: true,
        rememberDevice: true,
        sessionTimeout: '30 minutes',
        passwordExpiry: '90 days',
        minLength: 10,
        requireUpper: true,
        requireNumber: true,
        requireSpecial: true,
      },
      logs: [
        { user: 'ahmed.cherni', time: '2026-05-10 09:14', ip: '196.203.10.44', status: 'Success', risk: 'Low' },
        { user: 'karim.slim', time: '2026-05-10 08:58', ip: '196.203.10.59', status: 'Success', risk: 'Low' },
        { user: 'unknown', time: '2026-05-09 23:44', ip: '185.77.12.90', status: 'Failed', risk: 'High' },
        { user: 'nadia.chaker', time: '2026-05-09 17:05', ip: '196.203.10.61', status: 'Success', risk: 'Medium' },
        { user: 'sami.ghorbel', time: '2026-05-09 08:21', ip: '102.15.84.40', status: 'Failed', risk: 'Medium' },
      ],
      headers: [
        { text: 'User', value: 'user' },
        { text: 'Timestamp', value: 'time' },
        { text: 'IP Address', value: 'ip' },
        { text: 'Status', value: 'status' },
        { text: 'Risk', value: 'risk' },
      ],
    };
  },
  methods: {
    save() { this.snackbar = true; },
  },
};
</script>
