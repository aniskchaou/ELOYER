<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Interview Records</h1><p class="body-2 grey--text">Record and manage witness and subject interviews</p></v-col>
      <v-col cols="auto"><v-btn color="amber darken-3" dark @click="open()"><v-icon left>mdi-microphone</v-icon>New Interview</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="interviews" dense class="elevation-0">
        <template v-slot:item.interview_date="{ item }">{{ new Date(item.interview_date).toLocaleDateString() }}</template>
        <template v-slot:item.key_points="{ item }">
          <span class="caption">{{ (item.key_points || []).slice(0,2).join(' · ') }}</span>
        </template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <!-- New Interview Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Interview' : 'Record Interview' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="form.interviewee_name" label="Interviewee Name *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.interviewee_role" label="Role / Relationship" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.interview_date" label="Date & Time *" outlined dense type="datetime-local"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.location" label="Location" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.summary" label="Interview Summary" outlined rows="4" auto-grow></v-textarea></v-col>
            <v-col cols="12">
              <div class="caption grey--text mb-1">Key Points (press Enter to add)</div>
              <v-combobox v-model="form.key_points" label="Key Points" multiple outlined dense chips small-chips deletable-chips></v-combobox>
            </v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="amber darken-3" dark :loading="saving" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="520">
      <v-card v-if="selected">
        <v-card-title>Interview — {{ selected.interviewee_name }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-3">
          <div class="mb-1"><strong>Role:</strong> {{ selected.interviewee_role || '—' }}</div>
          <div class="mb-1"><strong>Date:</strong> {{ new Date(selected.interview_date).toLocaleString() }}</div>
          <div class="mb-1"><strong>Location:</strong> {{ selected.location || '—' }}</div>
          <div class="mb-1"><strong>Investigator:</strong> {{ selected.investigator_name }}</div>
          <v-divider class="my-2"></v-divider>
          <div v-if="selected.summary" class="mb-2"><strong>Summary:</strong><p class="body-2 mt-1">{{ selected.summary }}</p></div>
          <div v-if="selected.key_points && selected.key_points.length">
            <strong>Key Points:</strong>
            <v-chip v-for="p in selected.key_points" :key="p" x-small outlined class="mr-1 mt-1">{{ p }}</v-chip>
          </div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetInterviews, extCreateInterview } from '@/services/externalApi';
export default {
  name: 'InterviewRecords',
  data() {
    return {
      interviews: [], loading: true, dialog: false, editing: null, viewDialog: false, selected: null, saving: false, err: '',
      form: { case_id: 1, investigator_id: 1, interviewee_name: '', interviewee_role: '', interview_date: '', location: '', summary: '', key_points: [] },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Interviewee', value: 'interviewee_name' }, { text: 'Role', value: 'interviewee_role' },
        { text: 'Date', value: 'interview_date' }, { text: 'Location', value: 'location' },
        { text: 'Key Points', value: 'key_points' }, { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.interviews = await extGetInterviews(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(i = null) {
      this.editing = i;
      this.form = i ? { ...i, interview_date: i.interview_date ? i.interview_date.slice(0,16) : '' } : { case_id: 1, investigator_id: 1, interviewee_name: '', interviewee_role: '', interview_date: '', location: '', summary: '', key_points: [] };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.interviewee_name || !this.form.interview_date) { this.err = 'Name and date required.'; return; }
      this.saving = true;
      try { await extCreateInterview(this.form); this.notify('Interview recorded.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    view(i) { this.selected = i; this.viewDialog = true; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
