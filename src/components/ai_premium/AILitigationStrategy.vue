<template>
  <AIToolWrapper title="AI Litigation Strategy" subtitle="AI-powered strategic analysis with win probability and cost estimates" icon="mdi-chess-rook" color="indigo darken-2"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Analyse Strategy" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.case_title" label="Case Title" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.case_type" :items="['Civil','Commercial','Labour','Criminal','Family','Corporate','Property']" label="Case Type" outlined dense class="mb-2"></v-select>
      <v-select v-model="form.stage" :items="['Pre-Trial','Discovery','First Hearing','Trial','Appeal']" label="Current Stage" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.facts" label="Key Facts & Evidence Summary" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiLitigationStrategy } from '@/services/aiPremiumApi';
export default {
  name: 'AILitigationStrategy', components: { AIToolWrapper },
  data() { return { form: { case_title: '', case_type: 'Civil', stage: 'Pre-Trial', facts: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiLitigationStrategy(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
