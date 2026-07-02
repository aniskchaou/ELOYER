<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Expert Reports</h1><p class="body-2 grey--text">Submit and manage your expert opinions and technical reports</p></v-col>
      <v-col cols="auto"><v-btn color="blue-grey darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Report</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="reports" dense class="elevation-0">
        <template v-slot:item.report_type="{ item }"><v-chip x-small outlined>{{ item.report_type.replace(/_/g,' ') }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="640">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Report' : 'New Expert Report' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="8"><v-text-field v-model="form.title" label="Report Title *" outlined dense></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.report_type" :items="reportTypes" item-text="label" item-value="value" label="Type" outlined dense></v-select></v-col>
            <v-col cols="12"><v-textarea v-model="form.content" label="Report Content" outlined :rows="10" auto-grow style="font-family:monospace;font-size:13px"></v-textarea></v-col>
            <v-col cols="12"><v-text-field v-model="form.file_url" label="Attachment URL (optional)" outlined dense></v-text-field></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="dialog=false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn outlined class="mr-2" @click="saveDraft">Save Draft</v-btn>
          <v-btn color="blue-grey darken-1" dark :loading="saving" @click="submit">Submit Report</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetReports, extCreateReport, extUpdateReport } from '@/services/externalApi';
export default {
  name: 'ExpertReports',
  data() {
    return {
      reports: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { submitted_by: 1, case_id: 1, title: '', report_type: 'expert_opinion', content: '', file_url: '' },
      reportTypes: [
        { label: 'Expert Opinion', value: 'expert_opinion' },
        { label: 'Technical Analysis', value: 'technical_analysis' },
        { label: 'Forensic Report', value: 'forensic' },
        { label: 'Medical Report', value: 'medical' },
        { label: 'Financial Audit', value: 'financial_audit' },
      ],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'report_type' },
        { text: 'Case', value: 'case_title' }, { text: 'Status', value: 'status' },
        { text: 'Reviewer', value: 'reviewed_by_name' }, { text: 'Date', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reports = await extGetReports({ user_id: 1 }); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(r = null) {
      this.editing = r;
      this.form = r ? { submitted_by: r.submitted_by, case_id: r.case_id, title: r.title, report_type: r.report_type, content: r.content, file_url: r.file_url } : { submitted_by: 1, case_id: 1, title: '', report_type: 'expert_opinion', content: '', file_url: '' };
      this.err = ''; this.dialog = true;
    },
    async saveDraft() {
      this.saving = true;
      try {
        if (this.editing) await extUpdateReport(this.editing.id, { ...this.form, status: 'draft' });
        else await extCreateReport({ ...this.form });
        this.notify('Saved as draft.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async submit() {
      if (!this.form.title || !this.form.content) { this.err = 'Title and content required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await extUpdateReport(this.editing.id, { ...this.form, status: 'submitted' });
        else await extCreateReport(this.form);
        this.notify('Report submitted.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    statusColor(s) { const m = { draft:'grey', submitted:'orange', accepted:'success', rejected:'error' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
