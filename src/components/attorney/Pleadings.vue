<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Pleadings</h1><p class="body-2 grey--text">Draft, manage and track court pleadings and motions</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Pleading</v-btn></v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>
        <v-select v-model="typeFilter" :items="['All', ...pleadingTypes]" label="Type" outlined dense hide-details style="max-width:180px" class="mr-3"></v-select>
        <v-select v-model="statusFilter" :items="['All','draft','filed','rejected']" label="Status" outlined dense hide-details style="max-width:180px"></v-select>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" :loading="loading" class="elevation-0">
        <template v-slot:item.pleading_type="{ item }"><v-chip small outlined>{{ item.pleading_type }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="blue" @click="markFiled(item)" v-if="item.status==='draft'" title="Mark as Filed"><v-icon small>mdi-send</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Pleading' : 'New Pleading' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="8"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.pleading_type" :items="pleadingTypes" label="Type" outlined dense></v-select></v-col>
            <v-col cols="12"><v-textarea v-model="form.content" label="Content" outlined :rows="10" auto-grow style="font-family:monospace;font-size:13px"></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="dialog=false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined @click="draftWithAI" :loading="aiLoading"><v-icon left>mdi-robot</v-icon>AI Draft</v-btn>
          <v-btn color="blue darken-2" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetPleadings, faCreatePleading, faUpdatePleading, faCreateAIDraft } from '@/services/firmadminApi';
export default {
  name: 'Pleadings',
  data() {
    return {
      pleadings: [], loading: true, dialog: false, editing: null, saving: false, aiLoading: false, err: '',
      typeFilter: 'All', statusFilter: 'All',
      form: { case_id: 1, lawyer_id: 1, title: '', pleading_type: 'motion', content: '' },
      pleadingTypes: ['motion', 'brief', 'petition', 'reply', 'opposition', 'affidavit', 'complaint'],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'pleading_type' },
        { text: 'Case', value: 'case_title' },
        { text: 'By', value: 'lawyer_name' },
        { text: 'Status', value: 'status' },
        { text: 'Created', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() {
      return this.pleadings.filter(p =>
        (this.typeFilter === 'All' || p.pleading_type === this.typeFilter) &&
        (this.statusFilter === 'All' || p.status === this.statusFilter)
      );
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.pleadings = await faGetPleadings(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(p = null) {
      this.editing = p;
      this.form = p ? { case_id: p.case_id, lawyer_id: p.lawyer_id, title: p.title, pleading_type: p.pleading_type, content: p.content } : { case_id: 1, lawyer_id: 1, title: '', pleading_type: 'motion', content: '' };
      this.err = ''; this.dialog = true;
    },
    async draftWithAI() {
      if (!this.form.title) { this.err = 'Enter a title first.'; return; }
      this.aiLoading = true;
      try {
        const r = await faCreateAIDraft({ lawyer_id: 1, draft_type: 'pleading', prompt: this.form.title });
        this.form.content = r.generated_content;
        this.notify('AI draft inserted.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.aiLoading = false; }
    },
    async save() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdatePleading(this.editing.id, this.form);
        else await faCreatePleading(this.form);
        this.notify(this.editing ? 'Updated.' : 'Created.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async markFiled(p) {
      try { await faUpdatePleading(p.id, { status: 'filed' }); this.notify('Marked as filed.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    statusColor(s) { return s === 'filed' ? 'success' : s === 'rejected' ? 'error' : 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
