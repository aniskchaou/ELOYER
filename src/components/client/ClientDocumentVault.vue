<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Document Vault</h1><p class="body-2 grey--text">Securely upload, view and download your legal documents</p></v-col>
      <v-col cols="auto"><v-btn color="teal" dark @click="uploadDialog=true"><v-icon left>mdi-upload</v-icon>Upload</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search documents…" dense outlined single-line hide-details style="max-width:280px"></v-text-field>
        <v-spacer></v-spacer><span class="caption grey--text">{{ docs.length }} files</span>
      </v-card-title>
      <v-data-table :headers="headers" :items="docs" :search="search" dense class="elevation-0">
        <template v-slot:item.source_type="{ item }">
          <v-chip x-small :color="item.source_type==='client_upload'?'teal':'blue'" dark>{{ item.source_type === 'client_upload' ? 'Uploaded by you' : 'From lawyer' }}</v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="blue" :href="item.document_url||'#'" target="_blank" title="Download"><v-icon small>mdi-download</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="uploadDialog" max-width="440">
      <v-card>
        <v-card-title>Upload Document</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-file-input v-model="file" label="Select file" outlined dense accept=".pdf,.doc,.docx,.jpg,.png" @change="onFileSelect" class="mb-2"></v-file-input>
          <v-text-field v-model="form.title" label="Document Title *" outlined dense class="mb-2"></v-text-field>
          <v-alert type="info" dense outlined class="caption">Max 20MB. Accepted: PDF, Word, JPG, PNG</v-alert>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="uploadDialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="saving" @click="upload">Upload</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { cpGetDocuments, cpUploadDocument } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientDocumentVault',
  data() {
    return {
      docs: [], loading: true, uploadDialog: false, saving: false, err: '', file: null, search: '',
      form: { title: '', case_id: 1 },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Case', value: 'case_title' },
        { text: 'Source', value: 'source_type' },
        { text: 'Date', value: 'created_at' },
        { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.docs = await cpGetDocuments(CLIENT_ID); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    onFileSelect(f) { if (f && !this.form.title) this.form.title = f.name.replace(/\.[^.]+$/, ''); },
    async upload() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try {
        await cpUploadDocument(CLIENT_ID, { ...this.form, document_url: '#uploaded' });
        this.notify('Document uploaded.');
        this.uploadDialog = false; this.form = { title: '', case_id: 1 }; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
