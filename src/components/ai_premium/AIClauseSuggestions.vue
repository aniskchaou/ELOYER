<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="blue darken-2">mdi-puzzle-edit</v-icon>AI Clause Suggestions</h1>
      <p class="body-2 grey--text">Get AI-recommended clauses for any contract type</p></v-col>
      <v-col cols="auto"><v-chip color="blue darken-2" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4">
          <v-select v-model="contractType" :items="types" label="Contract Type" outlined dense class="mb-2"></v-select>
          <v-textarea v-model="existingText" label="Paste existing contract text (optional)" outlined rows="6"></v-textarea>
          <v-btn color="blue darken-2" dark block :loading="loading" @click="run" class="mt-3">
            <v-icon left>mdi-auto-fix</v-icon>Suggest Clauses
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-skeleton-loader v-if="loading" type="list-item-three-line, list-item-three-line, list-item-three-line"></v-skeleton-loader>
        <v-row v-else-if="clauses.length">
          <v-col v-for="clause in clauses" :key="clause.title" cols="12">
            <v-card outlined class="pa-4">
              <div class="d-flex align-center mb-2">
                <span class="subtitle-2 font-weight-bold">{{ clause.title }}</span>
                <v-spacer></v-spacer>
                <v-chip x-small :color="riskColor(clause.risk)" dark>{{ clause.risk }} risk</v-chip>
              </div>
              <p class="body-2 mb-2">{{ clause.text }}</p>
              <v-btn x-small outlined color="blue" @click="copyClause(clause.text)"><v-icon left x-small>mdi-content-copy</v-icon>Copy</v-btn>
            </v-card>
          </v-col>
        </v-row>
        <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-puzzle-outline</v-icon><p class="mt-2">Select a contract type to get clause suggestions.</p></div>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" top color="success" :timeout="1800">Clause copied.</v-snackbar>
  </v-container>
</template>
<script>
import { aiClauseSuggestions } from '@/services/aiPremiumApi';
export default {
  name: 'AIClauseSuggestions',
  data() { return { contractType: 'Service Agreement', existingText: '', clauses: [], loading: false, snack: false,
    types: ['Service Agreement','Employment Contract','NDA','Lease Agreement','Partnership Agreement','Loan Agreement'] }; },
  methods: {
    async run() {
      this.loading = true; this.clauses = [];
      try { const r = await aiClauseSuggestions({ contract_type: this.contractType, text: this.existingText }); this.clauses = r.clauses; }
      catch (e) { console.error(e); } finally { this.loading = false; }
    },
    copyClause(text) { navigator.clipboard.writeText(text); this.snack = true; },
    riskColor(r) { return r === 'high' ? 'error' : r === 'medium' ? 'warning' : 'success'; },
  },
};
</script>
