<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Court Notices</h1><p class="body-2 grey--text">Upload and manage official court documents and notices</p></v-col>
      <v-col cols="auto"><v-btn color="purple darken-1" dark @click="dialog=true"><v-icon left>mdi-upload</v-icon>Upload Notice</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="purple darken-1 white--text">
          <v-chip value="">All</v-chip><v-chip value="received">Received</v-chip><v-chip value="processed">Processed</v-chip>
        </v-chip-group>
        <v-spacer></v-spacer>
        <v-chip v-if="urgent.length" small color="error" dark>{{ urgent.length }} urgent</v-chip>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.is_urgent="{ item }">
          <v-icon v-if="item.is_urgent" color="error" small>mdi-alert</v-icon>
        </template>
        <template v-slot:item.notice_type="{ item }"><v-chip x-small outlined>{{ item.notice_type }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='received'?'blue':'success'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.notice_date="{ item }">{{ item.notice_date || '—' }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="success" @click="markProcessed(item)" v-if="item.status==='received'" title="Mark processed">
            <v-icon small>mdi-check</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>Upload Court Notice</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Notice Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.notice_type" :items="['summons','judgment','order','motion','subpoena','ruling','general']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.notice_date" label="Notice Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="form.court_name" label="Court Name" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.content" label="Summary / Content" outlined rows="3" auto-grow></v-textarea></v-col>
            <v-col cols="12"><v-switch v-model="form.is_urgent" label="Mark as Urgent" inset hide-details color="error"></v-switch></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="purple darken-1" dark :loading="saving" @click="upload">Upload</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetNotices, extCreateNotice, extUpdateNotice } from '@/services/externalApi';
export default {
  name: 'CourtNotices',
  data() {
    return {
      notices: [], loading: true, dialog: false, saving: false, err: '', filter: '',
      form: { uploaded_by: 1, case_id: 1, title: '', notice_type: 'general', court_name: '', notice_date: '', content: '', is_urgent: false },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: '!', value: 'is_urgent', width: 40, sortable: false },
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'notice_type' },
        { text: 'Court', value: 'court_name' }, { text: 'Date', value: 'notice_date' },
        { text: 'Case', value: 'case_title' }, { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    urgent() { return this.notices.filter(n => n.is_urgent); },
    filtered() { return this.filter ? this.notices.filter(n => n.status === this.filter) : this.notices; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.notices = await extGetNotices(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async upload() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try { await extCreateNotice(this.form); this.notify('Notice uploaded.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async markProcessed(n) {
      try { await extUpdateNotice(n.id, { status: 'processed' }); this.notify('Marked processed.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
