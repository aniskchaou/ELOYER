<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Two-Factor Authentication (2FA)</h1><p class="body-2 grey--text">Enforce 2FA across the firm for enhanced security</p></v-col></v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Global 2FA Policy</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-switch v-model="required" inset label="Require 2FA for all users" :color="required ? 'success' : 'grey'" @change="save" hide-details class="mb-4"></v-switch>
          <v-switch v-model="trusted" inset label="Allow trusted device bypass (30 days)" color="blue" hide-details class="mb-4"></v-switch>
          <v-select v-model="method" :items="['TOTP (Authenticator App)','SMS OTP','Email OTP']" label="Preferred Method" outlined dense class="mb-3"></v-select>
          <v-btn color="red darken-2" dark block @click="save" :loading="saving"><v-icon left>mdi-content-save</v-icon>Save Policy</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Enrollment Status</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item><v-list-item-content><v-list-item-title>Users Enrolled</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="success" dark>4 / 12</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Users Pending</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small color="orange" dark>8</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Login attempts blocked (7d)</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>2</v-chip></v-list-item-action></v-list-item>
          </v-list>
          <v-btn outlined color="orange" small class="mt-3" @click="remind">Send Enrollment Reminder</v-btn>
        </v-card>
        <v-card outlined class="pa-4 mt-4">
          <v-card-title class="subtitle-1 pb-2">Supported Methods</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in methods" :key="m.name">
              <v-list-item-icon><v-icon small :color="m.available ? 'success' : 'grey'">{{ m.icon }}</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ m.name }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="m.available ? 'success' : 'grey'" dark>{{ m.available ? 'Available' : 'Soon' }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" color="success" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'TwoFactorAuth',
  data() {
    return {
      required: false, trusted: true, method: 'TOTP (Authenticator App)', saving: false, snack: false, snackMsg: '',
      methods: [
        { name: 'TOTP (Google Authenticator, Authy)', icon: 'mdi-shield-key', available: true },
        { name: 'SMS OTP', icon: 'mdi-message-text', available: true },
        { name: 'Email OTP', icon: 'mdi-email-lock', available: true },
        { name: 'Hardware Key (FIDO2/WebAuthn)', icon: 'mdi-usb', available: false },
      ],
    };
  },
  methods: {
    save() { this.saving = true; setTimeout(() => { this.saving = false; this.snackMsg = '2FA policy saved.'; this.snack = true; }, 700); },
    remind() { this.snackMsg = 'Enrollment reminders sent to 8 users.'; this.snack = true; },
  },
};
</script>
