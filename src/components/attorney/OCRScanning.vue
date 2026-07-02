<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">OCR Scanning</h1><p class="body-2 grey--text">Upload scanned documents and extract text automatically</p></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Upload Document</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-file-input v-model="file" label="Select scanned file" outlined dense accept="image/*,.pdf" prepend-icon="mdi-scanner" @change="onFileSelect" class="mb-2"></v-file-input>
          <v-text-field v-model="form.original_filename" label="Document Name" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.language" :items="languages" item-text="label" item-value="value" label="Document Language" outlined dense class="mb-3"></v-select>
          <v-btn color="blue darken-2" dark block :loading="uploading" @click="upload" :disabled="!form.original_filename">
            <v-icon left>mdi-text-recognition</v-icon>Extract Text
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" style="min-height:300px">
          <v-card-title class="subtitle-1 pb-2 d-flex align-center">
            Extracted Text
            <v-chip x-small class="ml-2" :color="processing ? 'orange' : current && current.status === 'completed' ? 'success' : 'grey'" dark>
              {{ processing ? 'Processing…' : (current ? current.status : 'waiting') }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn v-if="current && current.extracted_text" small text @click="copy"><v-icon left small>mdi-content-copy</v-icon>Copy</v-btn>
          </v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-progress-linear v-if="processing" indeterminate color="blue"></v-progress-linear>
          <v-textarea v-else-if="current && current.extracted_text" :value="current.extracted_text" outlined auto-grow readonly style="font-family:monospace;font-size:12px" rows="10"></v-textarea>
          <div v-else class="text-center grey--text mt-6"><v-icon large>mdi-file-search</v-icon><p class="mt-2">Upload a document to extract text.</p></div>
        </v-card>
      </v-col>

      <!-- History -->
      <v-col cols="12">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">OCR History</v-card-title>
          <v-data-table :headers="headers" :items="docs" dense class="elevation-0">
            <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='completed'?'success':item.status==='processing'?'orange':'grey'" dark>{{ item.status }}</v-chip></template>
            <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
            <template v-slot:item.actions="{ item }"><v-btn icon small @click="current=item"><v-icon small>mdi-eye</v-icon></v-btn></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetOCR, faSubmitOCR } from '@/services/firmadminApi';
export default {
  name: 'OCRScanning',
  data() {
    return {
      docs: [], loading: true, uploading: false, processing: false, current: null, file: null,
      form: { uploaded_by: 1, original_filename: '', language: 'fr' },
      languages: [{ label: 'French', value: 'fr' }, { label: 'Arabic', value: 'ar' }, { label: 'English', value: 'en' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Filename', value: 'original_filename' },
        { text: 'Language', value: 'language' },
        { text: 'Status', value: 'status' },
        { text: 'Uploaded', value: 'created_at' },
        { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.docs = await faGetOCR(1); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    onFileSelect(f) { if (f) this.form.original_filename = f.name; },
    async upload() {
      if (!this.form.original_filename) { this.notify('Enter a filename.', 'error'); return; }
      this.uploading = true;
      try {
        const result = await faSubmitOCR(this.form);
        this.current = result;
        this.docs.unshift(result);
        this.processing = true;
        // Poll for completion
        const poll = setInterval(async () => {
          try {
            const updated = await faGetOCR(1);
            const found = updated.find(d => d.id === result.id);
            if (found && found.status === 'completed') {
              this.current = found;
              this.docs = updated;
              this.processing = false;
              clearInterval(poll);
              this.notify('Text extracted successfully.');
            }
          } catch (_) { clearInterval(poll); this.processing = false; }
        }, 2500);
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.uploading = false; }
    },
    copy() { navigator.clipboard.writeText(this.current.extracted_text); this.notify('Copied!'); },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
