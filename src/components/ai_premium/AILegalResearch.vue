<template>
  <AIToolWrapper title="AI Legal Research" subtitle="Search statutes, precedents and doctrine with AI" icon="mdi-book-search" color="purple darken-2"
    :loading="loading" :result="result" :error="error" :tokens="tokens" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.query" label="Research Query *" outlined dense class="mb-2"
        placeholder="e.g. wrongful termination employee reinstatement Tunisia"></v-text-field>
      <v-select v-model="form.area" :items="areas" label="Practice Area" outlined dense clearable></v-select>
    </template>
    <template v-slot:result>
      <div class="body-2" style="white-space:pre-wrap">{{ result }}</div>
    </template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiLegalResearch } from '@/services/aiPremiumApi';
export default {
  name: 'AILegalResearch', components: { AIToolWrapper },
  data() { return { form: { query: '', area: '' }, result: '', loading: false, error: '', tokens: 0,
    areas: ['Civil Law','Commercial Law','Labour Law','Criminal Law','Family Law','Corporate Law','Property Law'] }; },
  methods: {
    async run() {
      if (!this.form.query) { this.error = 'Enter a research query.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiLegalResearch(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
