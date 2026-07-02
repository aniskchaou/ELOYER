<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="amber darken-2">mdi-database-search</v-icon>AI Knowledge Base Search</h1>
      <p class="body-2 grey--text">Search internal cases, templates, precedents and research notes with AI</p></v-col>
      <v-col cols="auto"><v-chip color="amber darken-2" dark small><v-icon left x-small>mdi-star</v-icon>Premium AI</v-chip></v-col>
    </v-row>
    <v-card outlined class="pa-4 mb-4">
      <v-text-field v-model="query" label="Search the knowledge base…" outlined dense append-icon="mdi-send"
        @click:append="search" @keyup.enter="search" placeholder="e.g. wrongful termination employment Tunisia"></v-text-field>
      <v-chip-group v-model="selectedSuggestion" active-class="amber darken-2 white--text" class="mt-1">
        <v-chip v-for="s in suggestions" :key="s" small @click="query=s; search()">{{ s }}</v-chip>
      </v-chip-group>
    </v-card>
    <v-skeleton-loader v-if="loading" type="list-item-three-line, list-item-three-line, list-item-three-line"></v-skeleton-loader>
    <v-card outlined v-else-if="result" class="pa-4">
      <div class="body-2" style="white-space:pre-wrap">{{ result }}</div>
      <div class="caption grey--text mt-3">{{ tokens }} tokens · searched in {{ responseMs }}ms</div>
    </v-card>
    <div v-else class="text-center grey--text mt-12">
      <v-icon x-large>mdi-database-search-outline</v-icon>
      <p class="mt-2">Enter a query to search the firm's knowledge base.</p>
    </div>
  </v-container>
</template>
<script>
import { aiKnowledgeSearch } from '@/services/aiPremiumApi';
export default {
  name: 'AIKnowledgeBaseSearch',
  data() { return { query: '', result: '', loading: false, tokens: 0, responseMs: 0, selectedSuggestion: null,
    suggestions: ['Contract breach remedies','Employee termination Tunisia','Force majeure clause','Child custody ruling','Corporate due diligence'] }; },
  methods: {
    async search() {
      if (!this.query) return;
      this.loading = true; this.result = '';
      const start = Date.now();
      try { const r = await aiKnowledgeSearch({ query: this.query }); this.result = r.result; this.tokens = r.tokens; this.responseMs = Date.now() - start; }
      catch (e) { console.error(e); } finally { this.loading = false; }
    },
  },
};
</script>
