<template>
  <AIToolWrapper title="AI Email Drafting" subtitle="Draft professional legal correspondence in seconds" icon="mdi-email-edit" color="blue darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Draft Email" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.recipient" label="Recipient Email / Name" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.recipient_name" label="Recipient Salutation (e.g. Counsel, Dr.)" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.subject" label="Email Subject *" outlined dense class="mb-2"></v-text-field>
      <v-select v-model="form.tone" :items="['Formal','Professional','Firm','Conciliatory','Urgent']" label="Tone" outlined dense class="mb-2"></v-select>
      <v-textarea v-model="form.body_context" label="Key Points to Include" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap;font-family:monospace;font-size:13px">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiEmailDraft } from '@/services/aiPremiumApi';
export default {
  name: 'AIEmailDrafting', components: { AIToolWrapper },
  data() { return { form: { recipient: '', recipient_name: '', subject: '', tone: 'Formal', body_context: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.subject) { this.error = 'Enter email subject.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiEmailDraft(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
