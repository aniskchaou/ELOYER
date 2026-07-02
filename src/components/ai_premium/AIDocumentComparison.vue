<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="deep-purple darken-1">mdi-compare</v-icon>AI Document Comparison</h1>
      <p class="body-2 grey--text">Compare two contract versions and identify material differences</p></v-col>
      <v-col cols="auto"><v-chip color="deep-purple darken-1" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-3">
          <div class="subtitle-2 mb-2">Document A (Original)</div>
          <v-text-field v-model="doc_a_name" label="Document A name" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="doc_a" label="Paste Document A text" outlined rows="8" auto-grow></v-textarea>
        </v-card>
        <v-card outlined class="pa-4">
          <div class="subtitle-2 mb-2">Document B (Revised)</div>
          <v-text-field v-model="doc_b_name" label="Document B name" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="doc_b" label="Paste Document B text" outlined rows="8" auto-grow></v-textarea>
        </v-card>
        <v-btn color="deep-purple darken-1" dark block :loading="loading" @click="compare" class="mt-3">
          <v-icon left>mdi-compare</v-icon>Compare Documents
        </v-btn>
        <v-alert v-if="error" type="error" dense class="mt-3">{{ error }}</v-alert>
      </v-col>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" style="min-height:400px">
          <div class="d-flex align-center mb-3">
            <span class="subtitle-2">Comparison Report</span>
            <v-spacer></v-spacer>
            <v-chip x-small outlined v-if="tokens">{{ tokens }} tokens</v-chip>
          </div>
          <v-divider class="mb-3"></v-divider>
          <v-skeleton-loader v-if="loading" type="paragraph, paragraph, table"></v-skeleton-loader>
          <div v-else-if="result" class="body-2" style="white-space:pre-wrap">{{ result }}</div>
          <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-compare-horizontal</v-icon><p class="mt-2">Paste both documents and click Compare.</p></div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { aiDocumentComparison } from '@/services/aiPremiumApi';
export default {
  name: 'AIDocumentComparison',
  data() { return { doc_a: '', doc_b: '', doc_a_name: 'Original v1', doc_b_name: 'Revised v2', result: '', loading: false, error: '', tokens: 0 }; },
  methods: {
    async compare() {
      if (!this.doc_a || !this.doc_b) { this.error = 'Paste both documents.'; return; }
      this.loading = true; this.error = ''; this.result = '';
      try { const r = await aiDocumentComparison({ doc_a: this.doc_a_name, doc_b: this.doc_b_name, text_a: this.doc_a, text_b: this.doc_b }); this.result = r.result; this.tokens = r.tokens; }
      catch (e) { this.error = e.message; } finally { this.loading = false; }
    },
  },
};
</script>
