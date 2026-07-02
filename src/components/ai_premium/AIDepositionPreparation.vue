<template>
  <AIToolWrapper title="AI Deposition Preparation" subtitle="Generate examination questions and coaching notes for witnesses" icon="mdi-microphone-question" color="amber darken-3"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Prepare Deposition" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.witness_name" label="Witness Name *" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.witness_role" label="Role / Relationship to Case" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.examination_type" :items="['Direct','Cross','Re-Direct']" label="Examination Type" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.context" label="Case Context / Key Issues" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiDepositionPrep } from '@/services/aiPremiumApi';
export default {
  name: 'AIDepositionPreparation', components: { AIToolWrapper },
  data() { return { form: { witness_name: '', witness_role: '', examination_type: 'Direct', context: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.witness_name) { this.error = 'Enter witness name.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiDepositionPrep(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
