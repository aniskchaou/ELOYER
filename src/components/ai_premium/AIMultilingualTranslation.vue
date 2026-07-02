<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="cyan darken-2">mdi-translate</v-icon>AI Multilingual Translation</h1>
      <p class="body-2 grey--text">Translate legal documents between Arabic, French and English</p></v-col>
      <v-col cols="auto"><v-chip color="cyan darken-2" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-row dense class="mb-2">
            <v-col cols="5"><v-select v-model="from_lang" :items="langs" label="From" outlined dense></v-select></v-col>
            <v-col cols="2" class="d-flex align-center justify-center">
              <v-btn icon @click="swap"><v-icon>mdi-swap-horizontal</v-icon></v-btn>
            </v-col>
            <v-col cols="5"><v-select v-model="to_lang" :items="langs" label="To" outlined dense></v-select></v-col>
          </v-row>
          <v-textarea v-model="text" label="Source Text *" outlined rows="10" auto-grow></v-textarea>
          <v-btn color="cyan darken-2" dark block :loading="loading" @click="translate" class="mt-3">
            <v-icon left>mdi-translate</v-icon>Translate
          </v-btn>
          <v-alert v-if="error" type="error" dense class="mt-3">{{ error }}</v-alert>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" style="min-height:400px">
          <div class="d-flex align-center mb-3">
            <span class="subtitle-2">Translation</span>
            <v-spacer></v-spacer>
            <v-chip x-small outlined v-if="tokens">{{ tokens }} tokens</v-chip>
            <v-btn icon small @click="copyResult" v-if="result"><v-icon small>mdi-content-copy</v-icon></v-btn>
          </div>
          <v-divider class="mb-3"></v-divider>
          <v-skeleton-loader v-if="loading" type="paragraph, paragraph"></v-skeleton-loader>
          <div v-else class="body-2" style="white-space:pre-wrap" :dir="to_lang === 'Arabic' ? 'rtl' : 'ltr'">{{ result }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" top color="success" :timeout="1800">Copied.</v-snackbar>
  </v-container>
</template>
<script>
import { aiTranslation } from '@/services/aiPremiumApi';
export default {
  name: 'AIMultilingualTranslation',
  data() { return { from_lang: 'French', to_lang: 'English', text: '', result: '', loading: false, error: '', tokens: 0, snack: false,
    langs: ['French','Arabic','English','German','Italian','Spanish'] }; },
  methods: {
    async translate() {
      if (!this.text) { this.error = 'Enter text to translate.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiTranslation({ text: this.text, from_lang: this.from_lang, to_lang: this.to_lang }); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
    swap() { [this.from_lang, this.to_lang] = [this.to_lang, this.from_lang]; },
    copyResult() { navigator.clipboard.writeText(this.result); this.snack = true; },
  },
};
</script>
