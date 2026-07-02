<template>
  <AIToolWrapper title="AI Hearing Preparation" subtitle="Generate a complete hearing brief with arguments and checklist" icon="mdi-gavel" color="brown darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Prepare Hearing Brief" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.case_title" label="Case Title" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.hearing_date" label="Hearing Date" outlined dense type="date" class="mb-2"></v-text-field>
      <v-text-field v-model="form.court" label="Court Name" outlined dense class="mb-2"></v-text-field>
      <v-textarea v-model="form.key_facts" label="Key Facts / Issues" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiHearingPrep } from '@/services/aiPremiumApi';
export default {
  name: 'AIHearingPreparation', components: { AIToolWrapper },
  data() { return { form: { case_title: '', hearing_date: '', court: '', key_facts: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiHearingPrep(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
