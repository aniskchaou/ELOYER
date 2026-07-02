<template>
  <AIToolWrapper title="AI Document Summarization" subtitle="Get concise AI summaries of lengthy legal documents" icon="mdi-text-box-search" color="teal darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Summarize Document" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.title" label="Document Title" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.doc_type" :items="['Contract','Judgment','Pleading','Notice','Policy','Report','Other']" label="Document Type" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.text" label="Paste document text *" outlined rows="8" auto-grow placeholder="Paste the full document content here…"></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiDocumentSummary } from '@/services/aiPremiumApi';
export default {
  name: 'AIDocumentSummarization', components: { AIToolWrapper },
  data() { return { form: { title: '', doc_type: 'Contract', text: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.text && !this.form.title) { this.error = 'Enter document text or title.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiDocumentSummary(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
