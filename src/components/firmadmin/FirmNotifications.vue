<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Notification Settings</h1><p class="body-2 grey--text">Configure which events trigger notifications for each role</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark :loading="saving" @click="save"><v-icon left>mdi-content-save</v-icon>Save</v-btn></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" v-for="section in notifSections" :key="section.title">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2"><v-icon left small :color="section.color">{{ section.icon }}</v-icon>{{ section.title }}</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="event in section.events" :key="event.key">
              <v-list-item-content><v-list-item-title class="body-2">{{ event.label }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row">
                <v-tooltip bottom><template v-slot:activator="{on}"><v-btn icon small v-on="on" :color="event.email ? 'blue' : 'grey lighten-2'" @click="event.email=!event.email"><v-icon small>mdi-email</v-icon></v-btn></template><span>Email</span></v-tooltip>
                <v-tooltip bottom><template v-slot:activator="{on}"><v-btn icon small v-on="on" :color="event.sms ? 'green' : 'grey lighten-2'" @click="event.sms=!event.sms"><v-icon small>mdi-message-text</v-icon></v-btn></template><span>SMS</span></v-tooltip>
                <v-tooltip bottom><template v-slot:activator="{on}"><v-btn icon small v-on="on" :color="event.inapp ? 'orange' : 'grey lighten-2'" @click="event.inapp=!event.inapp"><v-icon small>mdi-bell</v-icon></v-btn></template><span>In-App</span></v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" color="success" top>Notification settings saved.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'FirmNotifications',
  data() {
    return {
      saving: false, snack: false,
      notifSections: [
        { title: 'Cases', color: 'blue', icon: 'mdi-folder', events: [
          { key: 'case_created', label: 'New case created', email: true, sms: false, inapp: true },
          { key: 'case_status', label: 'Case status changed', email: true, sms: false, inapp: true },
          { key: 'case_assigned', label: 'Case assigned to lawyer', email: true, sms: true, inapp: true },
        ]},
        { title: 'Documents', color: 'teal', icon: 'mdi-file-document', events: [
          { key: 'doc_uploaded', label: 'Document uploaded', email: false, sms: false, inapp: true },
          { key: 'doc_esigned', label: 'Document e-signed', email: true, sms: true, inapp: true },
          { key: 'doc_review', label: 'Document needs review', email: true, sms: false, inapp: true },
        ]},
        { title: 'Billing', color: 'green', icon: 'mdi-credit-card', events: [
          { key: 'invoice_created', label: 'Invoice created', email: true, sms: false, inapp: true },
          { key: 'invoice_paid', label: 'Invoice paid', email: true, sms: true, inapp: true },
          { key: 'invoice_overdue', label: 'Invoice overdue', email: true, sms: true, inapp: true },
        ]},
        { title: 'Hearings & Deadlines', color: 'orange', icon: 'mdi-calendar-alert', events: [
          { key: 'hearing_reminder', label: 'Hearing reminder (24h)', email: true, sms: true, inapp: true },
          { key: 'deadline_near', label: 'Deadline approaching', email: true, sms: true, inapp: true },
          { key: 'deadline_passed', label: 'Deadline passed', email: true, sms: false, inapp: true },
        ]},
      ],
    };
  },
  methods: {
    save() {
      this.saving = true;
      setTimeout(() => { this.saving = false; this.snack = true; }, 600);
    },
  },
};
</script>
