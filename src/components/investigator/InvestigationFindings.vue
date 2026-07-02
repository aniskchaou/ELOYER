<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Investigation Findings</h1><p class="body-2 grey--text">Document and manage all case findings, observations and reports</p></v-col>
      <v-col cols="auto"><v-btn color="amber darken-3" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Finding</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="typeFilter" mandatory active-class="amber darken-3 white--text">
          <v-chip value="">All</v-chip><v-chip value="general">General</v-chip><v-chip value="surveillance">Surveillance</v-chip><v-chip value="forensic">Forensic</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.finding_type="{ item }"><v-chip x-small outlined>{{ item.finding_type }}</v-chip></template>
        <template v-slot:item.is_confidential="{ item }">
          <v-icon v-if="item.is_confidential" color="error" small>mdi-lock</v-icon>
        </template>
        <template v-slot:item.location="{ item }">
          <span v-if="item.gps_lat && item.gps_lng" class="caption teal--text">
            <v-icon x-small color="teal">mdi-map-marker</v-icon>{{ item.gps_lat }}, {{ item.gps_lng }}
          </span>
          <span v-else class="grey--text">{{ item.location || '—' }}</span>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Finding' : 'New Finding' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="8"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.finding_type" :items="['general','surveillance','forensic','witness','document','digital','physical']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="12"><v-textarea v-model="form.description" label="Description *" outlined rows="4" auto-grow></v-textarea></v-col>
            <v-col cols="12"><v-text-field v-model="form.location" label="Location" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.gps_lat" label="GPS Latitude" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.gps_lng" label="GPS Longitude" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="12"><v-switch v-model="form.is_confidential" label="Mark as Confidential" inset hide-details color="error"></v-switch></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="amber darken-3" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Submit' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetFindings, extCreateFinding } from '@/services/externalApi';
export default {
  name: 'InvestigationFindings',
  data() {
    return {
      findings: [], loading: true, dialog: false, editing: null, saving: false, err: '', typeFilter: '',
      form: { case_id: 1, investigator_id: 1, title: '', finding_type: 'general', description: '', location: '', gps_lat: null, gps_lng: null, is_confidential: false },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: '🔒', value: 'is_confidential', width: 40, sortable: false },
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'finding_type' },
        { text: 'Case', value: 'case_title' }, { text: 'Location', value: 'location' },
        { text: 'Date', value: 'created_at' }, { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.typeFilter ? this.findings.filter(f => f.finding_type === this.typeFilter) : this.findings; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.findings = await extGetFindings({ investigator_id: 1 }); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(f = null) {
      this.editing = f;
      this.form = f ? { ...f } : { case_id: 1, investigator_id: 1, title: '', finding_type: 'general', description: '', location: '', gps_lat: null, gps_lng: null, is_confidential: false };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try { await extCreateFinding(this.form); this.notify('Finding added.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
