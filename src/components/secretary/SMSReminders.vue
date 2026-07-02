<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">SMS Reminders</h1><p class="body-2 grey--text">Schedule and track automated SMS notifications to clients</p></v-col>
      <v-col cols="auto"><v-btn color="pink darken-1" dark @click="dialog=true"><v-icon left>mdi-message-plus</v-icon>Schedule SMS</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="statusFilter" mandatory active-class="pink darken-1 white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="sent">Sent</v-chip><v-chip value="cancelled">Cancelled</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.send_at="{ item }">{{ new Date(item.send_at).toLocaleString([], {dateStyle:'short',timeStyle:'short'}) }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.status==='pending'" icon small color="error" @click="cancel(item)" title="Cancel"><v-icon small>mdi-cancel</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Schedule SMS Reminder</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.recipient_phone" label="Phone Number *" outlined dense class="mb-2" placeholder="+216 XX XXX XXX"></v-text-field>
          <v-text-field v-model="form.recipient_name" label="Recipient Name" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="selectedTemplate" :items="quickMessages" item-text="label" item-value="msg" label="Quick Message" outlined dense clearable class="mb-2" @change="v => form.message = v || form.message"></v-select>
          <v-textarea v-model="form.message" label="Message *" outlined rows="3"></v-textarea>
          <v-text-field v-model="form.send_at" label="Send At *" outlined dense type="datetime-local" class="mt-2"></v-text-field>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="pink darken-1" dark :loading="saving" @click="schedule">Schedule</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetSmsReminders, stCreateSmsReminder, stCancelSmsReminder } from '@/services/staffApi';
export default {
  name: 'SMSReminders',
  data() {
    return {
      reminders: [], loading: true, dialog: false, saving: false, err: '', statusFilter: '', selectedTemplate: null,
      form: { recipient_phone: '', recipient_name: '', message: '', send_at: '', created_by: 1 },
      quickMessages: [
        { label: 'Appointment Reminder', msg: 'Rappel: Votre rendez-vous chez Cabinet Cherni est demain. Merci de confirmer.' },
        { label: 'Invoice Due', msg: 'Votre facture est due prochainement. Merci de procéder au règlement.' },
        { label: 'Hearing Reminder', msg: 'Rappel: Votre audience est programmée. Veuillez apporter vos documents.' },
      ],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Recipient', value: 'recipient_name' },
        { text: 'Phone', value: 'recipient_phone' },
        { text: 'Message', value: 'message' },
        { text: 'Send At', value: 'send_at' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.statusFilter ? this.reminders.filter(r => r.status === this.statusFilter) : this.reminders; },
    stats() {
      return [
        { label: 'Total', value: this.reminders.length, icon: 'mdi-message', color: 'pink' },
        { label: 'Pending', value: this.reminders.filter(r => r.status === 'pending').length, icon: 'mdi-clock', color: 'orange' },
        { label: 'Sent', value: this.reminders.filter(r => r.status === 'sent').length, icon: 'mdi-check', color: 'green' },
        { label: 'Cancelled', value: this.reminders.filter(r => r.status === 'cancelled').length, icon: 'mdi-close', color: 'grey' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reminders = await stGetSmsReminders(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async schedule() {
      if (!this.form.recipient_phone || !this.form.message || !this.form.send_at) { this.err = 'Phone, message and date required.'; return; }
      this.saving = true;
      try { await stCreateSmsReminder(this.form); this.notify('SMS scheduled.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async cancel(r) {
      try { await stCancelSmsReminder(r.id); this.notify('Cancelled.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    statusColor(s) { return s === 'sent' ? 'success' : s === 'pending' ? 'orange' : 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
