<template>
  <AIToolWrapper title="AI Legal Citation Generator" subtitle="Generate properly formatted legal citations" icon="mdi-bookmark-multiple" color="deep-orange darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Generate Citations" @run="run" @clear="clear">
    <template v-slot:input>
      <v-textarea v-model="form.context" label="Legal Argument / Context *" outlined rows="5" auto-grow class="mb-2"
        placeholder="Describe the legal argument or situation you need citations for…"></v-textarea>
      <v-select v-model="form.area" :items="['Civil','Commercial','Labour','Criminal','Family','Corporate','Administrative']" label="Law Area" outlined dense></v-select>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiCitationGeneration } from '@/services/aiPremiumApi';
export default {
  name: 'AILegalCitationGenerator', components: { AIToolWrapper },
  data() { return { form: { context: '', area: 'Civil' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      if (!this.form.context) { this.error = 'Enter a legal argument or context.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiCitationGeneration(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
