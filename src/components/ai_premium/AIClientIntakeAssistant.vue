<template>
  <AIToolWrapper title="AI Client Intake Assistant" subtitle="Intelligently assess new client matters and suggest next steps" icon="mdi-account-plus" color="pink darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Assess Client" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.client_name" label="Client Name *" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.matter_type" :items="matters" label="Matter Type" outlined dense class="mb-2"></v-select>
      <v-text-field v-model="form.claim_value" label="Estimated Claim Value (TND)" outlined dense class="mb-2"></v-text-field>
      <v-textarea v-model="form.description" label="Brief Description of the Matter" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiClientIntake } from '@/services/aiPremiumApi';
export default {
  name: 'AIClientIntakeAssistant', components: { AIToolWrapper },
  data() { return { form: { client_name: '', matter_type: 'Civil Dispute', claim_value: '', description: '' }, result: '', loading: false, error: '', tokens: 0,
    matters: ['Civil Dispute','Labour Dispute','Commercial Contract','Family Law','Criminal Defence','Property','Corporate','Administrative'] }; },
  methods: {
    async run() {
      if (!this.form.client_name) { this.error = 'Enter client name.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiClientIntake(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
