<template>
  <AIToolWrapper title="AI Invoice Generation" subtitle="Generate professional legal invoices automatically" icon="mdi-receipt-text" color="green darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Generate Invoice" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.client_name" label="Client Name" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.client_address" label="Client Address" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.matter" label="Matter Description" outlined dense class="mb-2"></v-text-field>
      <v-row dense>
        <v-col cols="6"><v-text-field v-model.number="form.hours" label="Consultation Hours" outlined dense type="number" step="0.5"></v-text-field></v-col>
        <v-col cols="6"><v-text-field v-model.number="form.draft_hours" label="Drafting Hours" outlined dense type="number" step="0.5"></v-text-field></v-col>
      </v-row>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap;font-family:monospace;font-size:12px">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiInvoiceGeneration } from '@/services/aiPremiumApi';
export default {
  name: 'AIInvoiceGeneration', components: { AIToolWrapper },
  data() { return { form: { client_name: '', client_address: '', matter: '', hours: 2, draft_hours: 1.5 }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiInvoiceGeneration(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
