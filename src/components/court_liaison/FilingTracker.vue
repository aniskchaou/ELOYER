<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Filing Tracker</h1><p class="body-2 grey--text">Track all court filings from preparation to confirmation</p></v-col>
      <v-col cols="auto"><v-btn color="purple darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Filing</v-btn></v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center">
          <div class="overline grey--text">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="purple darken-1 white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="in_review">In Review</v-chip><v-chip value="filed">Filed</v-chip><v-chip value="rejected">Rejected</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.filing_type="{ item }"><v-chip x-small outlined>{{ item.filing_type }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.deadline="{ item }">
          <span :class="isNear(item.deadline) && item.status !== 'filed' ? 'red--text font-weight-bold' : ''">
            {{ item.deadline ? new Date(item.deadline).toLocaleDateString() : '—' }}
          </span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn v-if="item.status==='pending' || item.status==='in_review'" icon small color="success" @click="markFiled(item)" title="Mark Filed">
            <v-icon small>mdi-check-circle</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Filing' : 'New Filing' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.filing_type" :items="['motion','brief','petition','notice','order','other']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.court_name" label="Court" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.deadline" label="Deadline" outlined dense type="datetime-local"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.reference_number" label="Reference No." outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="purple darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Add' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetFilings, extCreateFiling, extUpdateFiling } from '@/services/externalApi';
export default {
  name: 'FilingTracker',
  data() {
    return {
      filings: [], loading: true, dialog: false, editing: null, saving: false, err: '', filter: '',
      form: { managed_by: 1, case_id: 1, title: '', filing_type: 'motion', court_name: '', deadline: '', reference_number: '', notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'filing_type' },
        { text: 'Court', value: 'court_name' }, { text: 'Deadline', value: 'deadline' },
        { text: 'Ref #', value: 'reference_number' }, { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.filter ? this.filings.filter(f => f.status === this.filter) : this.filings; },
    stats() {
      return [
        { label: 'Total', value: this.filings.length, color: 'purple' },
        { label: 'Pending', value: this.filings.filter(f => f.status === 'pending').length, color: 'orange' },
        { label: 'Filed', value: this.filings.filter(f => f.status === 'filed').length, color: 'green' },
        { label: 'Overdue', value: this.filings.filter(f => f.deadline && this.isNear(f.deadline) && f.status !== 'filed').length, color: 'red' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.filings = await extGetFilings({ user_id: 1 }); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(f = null) {
      this.editing = f;
      this.form = f ? { managed_by: f.managed_by, case_id: f.case_id, title: f.title, filing_type: f.filing_type, court_name: f.court_name, deadline: f.deadline ? f.deadline.slice(0,16) : '', reference_number: f.reference_number, notes: f.notes } : { managed_by: 1, case_id: 1, title: '', filing_type: 'motion', court_name: '', deadline: '', reference_number: '', notes: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await extUpdateFiling(this.editing.id, this.form);
        else await extCreateFiling(this.form);
        this.notify(this.editing ? 'Updated.' : 'Filing added.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async markFiled(f) {
      try { await extUpdateFiling(f.id, { status: 'filed', filed_at: new Date().toISOString() }); this.notify('Marked as filed.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    isNear(d) { return d && (new Date(d) - new Date()) < 3 * 86400000; },
    statusColor(s) { const m = { pending:'orange', in_review:'blue', filed:'success', rejected:'error' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
