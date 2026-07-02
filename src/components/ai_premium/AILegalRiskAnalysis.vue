<template>
  <AIToolWrapper title="AI Legal Risk Analysis" subtitle="Comprehensive risk assessment for contracts and situations" icon="mdi-shield-alert" color="red darken-2"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Analyse Risk" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.title" label="Document / Situation Title *" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.context_type" :items="['Contract Review','Litigation Assessment','Business Transaction','Employment Matter','Regulatory Compliance','Other']"
        label="Context Type" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.text" label="Paste relevant text or describe the situation" outlined rows="7" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiRiskAnalysis } from '@/services/aiPremiumApi';
export default {
  name: 'AILegalRiskAnalysis', components: { AIToolWrapper },
  data() { return { form: { title: '', context_type: 'Contract Review', text: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.title) { this.error = 'Enter a title.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiRiskAnalysis(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
