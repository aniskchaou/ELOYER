<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Evidence Chain of Custody</h1><p class="body-2 grey--text">Immutable audit trail for all evidence handling</p></v-col>
      <v-col cols="auto"><v-btn color="amber darken-3" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>Log Transfer</v-btn></v-col>
    </v-row>

    <v-alert type="info" outlined class="mb-4 body-2">
      Every transfer, examination or storage change of evidence must be logged here to maintain legal integrity.
    </v-alert>

    <v-card outlined :loading="loading">
      <v-timeline dense class="pa-4" v-if="records.length">
        <v-timeline-item v-for="r in records" :key="r.id" :color="actionColor(r.action)" small>
          <div class="d-flex align-center mb-1">
            <v-chip small :color="actionColor(r.action)" dark class="mr-2">{{ r.action }}</v-chip>
            <span class="caption grey--text">{{ new Date(r.timestamp).toLocaleString() }}</span>
          </div>
          <div class="body-2"><strong>Handler:</strong> {{ r.handler_name }}</div>
          <div class="body-2 mb-1"><strong>Evidence:</strong> {{ r.evidence_title || 'Case Evidence' }}</div>
          <div v-if="r.from_location || r.to_location" class="caption">
            <span v-if="r.from_location">From: {{ r.from_location }} </span>
            <v-icon x-small v-if="r.to_location">mdi-arrow-right</v-icon>
            <span v-if="r.to_location"> To: {{ r.to_location }}</span>
          </div>
          <div v-if="r.notes" class="caption grey--text mt-1">{{ r.notes }}</div>
        </v-timeline-item>
      </v-timeline>
      <div v-else-if="!loading" class="text-center grey--text pa-6">
        <v-icon large>mdi-shield-lock-outline</v-icon>
        <p class="mt-2">No custody records yet. Log every evidence transfer.</p>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>Log Custody Transfer</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-select v-model="form.action" :items="['collected','transferred','examined','stored','returned','destroyed','submitted_to_court']" label="Action *" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.from_location" label="From Location" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.to_location" label="To Location" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="3"></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="amber darken-3" dark :loading="saving" @click="log">Log</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetCustody, extAddCustody } from '@/services/externalApi';
const CASE_ID = 1;
export default {
  name: 'EvidenceChainOfCustody',
  data() {
    return {
      records: [], loading: true, dialog: false, saving: false, err: '',
      form: { case_id: CASE_ID, handler_id: 1, action: 'collected', from_location: '', to_location: '', notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.records = await extGetCustody(CASE_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async log() {
      if (!this.form.action) { this.err = 'Action required.'; return; }
      this.saving = true;
      try { await extAddCustody(this.form); this.notify('Transfer logged.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    actionColor(a) {
      const m = { collected:'amber', transferred:'blue', examined:'purple', stored:'teal', returned:'green', destroyed:'error', submitted_to_court:'indigo' };
      return m[a] || 'grey';
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
