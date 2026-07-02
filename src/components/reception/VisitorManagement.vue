<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Visitor Management</h1><p class="body-2 grey--text">Check in visitors and maintain a daily visitor log</p></v-col>
      <v-col cols="auto"><v-btn color="teal" dark @click="dialog=true"><v-icon left>mdi-account-plus</v-icon>Check In</v-btn></v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-card-title>
        <v-text-field v-model="dateFilter" type="date" outlined dense hide-details @change="load" style="max-width:180px"></v-text-field>
        <v-spacer></v-spacer>
        <span class="caption grey--text">{{ visitors.length }} visitors</span>
      </v-card-title>
      <v-data-table :headers="headers" :items="visitors" dense class="elevation-0">
        <template v-slot:item.badge_number="{ item }"><code>{{ item.badge_number }}</code></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='checked_in'?'teal':'grey'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.check_in_at="{ item }">{{ new Date(item.check_in_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }}</template>
        <template v-slot:item.check_out_at="{ item }">{{ item.check_out_at ? new Date(item.check_out_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—' }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn x-small outlined color="teal" @click="checkout(item)" v-if="item.status==='checked_in'">Check Out</v-btn>
          <v-btn x-small outlined color="blue" @click="addToQueue(item)" title="Add to Queue"><v-icon x-small>mdi-account-arrow-right</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>Check In Visitor</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.full_name" label="Full Name *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.company" label="Company" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.phone" label="Phone" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="form.email" label="Email" outlined dense type="email"></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.purpose" label="Purpose of Visit" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="saving" @click="checkin">Check In</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetVisitors, stCheckIn, stCheckOut, stAddToQueue } from '@/services/staffApi';
export default {
  name: 'VisitorManagement',
  data() {
    return {
      visitors: [], loading: true, dialog: false, saving: false, err: '',
      dateFilter: new Date().toISOString().slice(0,10),
      form: { full_name: '', company: '', phone: '', email: '', purpose: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Badge', value: 'badge_number', width: 80 },
        { text: 'Name', value: 'full_name' },
        { text: 'Company', value: 'company' },
        { text: 'Purpose', value: 'purpose' },
        { text: 'Host', value: 'host_name' },
        { text: 'In', value: 'check_in_at' },
        { text: 'Out', value: 'check_out_at' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.visitors = await stGetVisitors(this.dateFilter); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async checkin() {
      if (!this.form.full_name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        const v = await stCheckIn(this.form);
        this.notify(`${v.full_name} checked in. Badge #${v.badge_number}.`);
        this.dialog = false; this.form = { full_name: '', company: '', phone: '', email: '', purpose: '' }; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async checkout(v) {
      try { await stCheckOut(v.id); this.notify(`${v.full_name} checked out.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async addToQueue(v) {
      try { await stAddToQueue({ visitor_id: v.id, service_type: 'consultation' }); this.notify(`${v.full_name} added to queue.`); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
