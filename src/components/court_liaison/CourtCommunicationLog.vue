<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Court Communication Log</h1><p class="body-2 grey--text">Log all communications with courts, clerks and judges</p></v-col>
      <v-col cols="auto"><v-btn color="purple darken-1" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>Log Communication</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="comms" dense class="elevation-0">
        <template v-slot:item.communication_type="{ item }"><v-chip x-small :color="typeColor(item.communication_type)" dark>{{ item.communication_type }}</v-chip></template>
        <template v-slot:item.follow_up_date="{ item }">
          <span :class="item.follow_up_date && isNear(item.follow_up_date) ? 'orange--text font-weight-bold' : ''">{{ item.follow_up_date || '—' }}</span>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>Log Court Communication</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="6"><v-select v-model="form.communication_type" :items="['call','email','in_person','fax','letter']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.court_name" label="Court Name" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="form.contact_person" label="Contact Person / Clerk" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.summary" label="Summary *" outlined rows="3"></v-textarea></v-col>
            <v-col cols="6"><v-text-field v-model="form.outcome" label="Outcome" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.follow_up_date" label="Follow-up Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="purple darken-1" dark :loading="saving" @click="log">Log</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetCourtComms, extCreateCourtComm } from '@/services/externalApi';
export default {
  name: 'CourtCommunicationLog',
  data() {
    return {
      comms: [], loading: true, dialog: false, saving: false, err: '',
      form: { logged_by: 1, case_id: 1, communication_type: 'call', court_name: '', contact_person: '', summary: '', outcome: '', follow_up_date: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Type', value: 'communication_type' }, { text: 'Court', value: 'court_name' },
        { text: 'Contact', value: 'contact_person' }, { text: 'Summary', value: 'summary' },
        { text: 'Outcome', value: 'outcome' }, { text: 'Follow-up', value: 'follow_up_date' },
        { text: 'Date', value: 'created_at' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.comms = await extGetCourtComms(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async log() {
      if (!this.form.summary) { this.err = 'Summary required.'; return; }
      this.saving = true;
      try { await extCreateCourtComm(this.form); this.notify('Communication logged.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    isNear(d) { return d && (new Date(d) - new Date()) < 3 * 86400000; },
    typeColor(t) { const m = { call:'blue', email:'teal', in_person:'purple', fax:'grey', letter:'orange' }; return m[t]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
