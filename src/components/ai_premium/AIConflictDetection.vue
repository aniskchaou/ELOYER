<template>
  <AIToolWrapper title="AI Conflict-of-Interest Detection" subtitle="Screen new clients against existing representations" icon="mdi-account-alert" color="red darken-3"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Run Conflict Check" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.client_name" label="New Client Name *" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.opposing_party" label="Opposing Party / Other Side" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.matter_type" :items="['Civil','Commercial','Labour','Criminal','Family','Corporate']" label="Matter Type" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.description" label="Brief Description of the Matter" outlined rows="3" auto-grow></v-textarea>
    </template>
    <template v-slot:result>
      <v-alert :type="result.includes('POTENTIAL CONFLICT') ? 'error' : 'success'" outlined class="mb-3">
        {{ result.includes('POTENTIAL CONFLICT') ? 'CONFLICT DETECTED — Review Required' : 'No Conflict Detected' }}
      </v-alert>
      <div class="body-2" style="white-space:pre-wrap">{{ result }}</div>
    </template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiConflictDetection } from '@/services/aiPremiumApi';
export default {
  name: 'AIConflictDetection', components: { AIToolWrapper },
  data() { return { form: { client_name: '', opposing_party: '', matter_type: 'Civil', description: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.client_name) { this.error = 'Enter client name.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiConflictDetection(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
