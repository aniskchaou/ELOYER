<template>
  <AIToolWrapper title="AI Meeting Transcription" subtitle="Generate structured transcripts from meeting descriptions" icon="mdi-transcribe" color="blue-grey darken-1"
    :loading="loading" :result="result" :error="error" :tokens="tokens" button-label="Generate Transcript" @run="run" @clear="clear">
    <template v-slot:input>
      <v-text-field v-model="form.title" label="Meeting Title" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.participants" label="Participants (comma-separated)" outlined dense class="mb-2"></v-text-field>
      <v-text-field v-model="form.duration" label="Duration (e.g. 45 minutes)" outlined dense class="mb-2"></v-text-field>
      <v-textarea v-model="form.agenda" label="Meeting Agenda / Topics Discussed" outlined rows="4" auto-grow></v-textarea>
    </template>
    <template v-slot:result><div class="body-2" style="white-space:pre-wrap;font-family:monospace;font-size:12px">{{ result }}</div></template>
  </AIToolWrapper>
</template>
<script>
import AIToolWrapper from './AIToolWrapper.vue';
import { aiTranscription } from '@/services/aiPremiumApi';
export default {
  name: 'AIMeetingTranscription', components: { AIToolWrapper },
  data() { return { form: { title: '', participants: '', duration: '', agenda: '' }, result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async run() {
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiTranscription(this.form); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    clear() { this.result = ''; this.tokens = 0; },
  },
};
</script>
