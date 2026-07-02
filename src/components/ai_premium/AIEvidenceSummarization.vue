<template>
  <AIToolWrapper title="AI Evidence Summarization" subtitle="Analyse and summarise evidence items for case preparation" icon="mdi-briefcase-search" color="green darken-2"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Summarise Evidence" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.case_title" label="Case Title" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.evidence_count" label="Number of Evidence Items" outlined dense type="number" class="mb-2"></v-text-field>
      <v-textarea v-model="form.evidence_list" label="List Evidence Items (one per line)" outlined rows="6" auto-grow
        placeholder="Exhibit A – Signed Contract&#10;Exhibit B – Email chain&#10;Exhibit C – Payment receipt"></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiEvidenceSummary } from '@/services/aiPremiumApi';
export default {
  name: 'AIEvidenceSummarization', components: { AIToolWrapper },
  data() { return { form: { case_title: '', evidence_count: '', evidence_list: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiEvidenceSummary(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
