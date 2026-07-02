<template>
  <AIToolWrapper title="AI Contract Generation" subtitle="Generate professional contracts from a description" icon="mdi-file-sign" color="indigo darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Generate Contract" @run="run" @clear="clear">
    <template v-slot:input>
      <v-select v-model="form.contract_type" :items="types" label="Contract Type *" outlined dense class="mb-2"></v-select>
      <v-text-field v-model="form.party_a" label="Party A (Provider)" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.party_b" label="Party B (Client)" outlined dense class="mb-2"></v-text-field>
      <v-textarea v-model="form.description" label="Scope of Work / Description" outlined rows="3" auto-grow class="mb-2"></v-textarea>
      <v-row dense>
        <v-col cols="6"><v-text-field v-model="form.amount" label="Contract Value (TND)" outlined dense></v-text-field></v-col>
        <v-col cols="6"><v-text-field v-model="form.duration" label="Duration" outlined dense placeholder="12 months"></v-text-field></v-col>
      </v-row>
    </template>
    <template v-slot:result>
      <div class="body-2" style="white-space:pre-wrap;font-family:monospace;font-size:12px">{{ result }}</div>
    </template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiContractGeneration } from '@/services/aiPremiumApi';
export default {
  name: 'AIContractGeneration', components: { AIToolWrapper },
  data() { return { form: { contract_type: 'SERVICE AGREEMENT', party_a: '', party_b: '', description: '', amount: '', duration: '' },
    result: '', loading: false, error: '', tokens: 0,
    types: ['SERVICE AGREEMENT','EMPLOYMENT CONTRACT','NDA','LEASE AGREEMENT','PARTNERSHIP AGREEMENT','LOAN AGREEMENT','SALE CONTRACT'] }; },
  methods: {
    async run() {
      if (!this.form.contract_type) { this.error = 'Select a contract type.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiContractGeneration(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
