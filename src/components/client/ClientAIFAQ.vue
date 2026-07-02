<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Legal FAQ</h1><p class="body-2 grey--text">Find instant answers to common legal questions</p></v-col>
    </v-row>

    <v-card outlined class="pa-4 mb-4">
      <v-text-field v-model="query" label="Ask a question or search the FAQ…" outlined dense append-icon="mdi-send" @click:append="search" @keyup.enter="search" clearable @click:clear="reset" placeholder="e.g. How do I pay my invoice?"></v-text-field>
      <div class="d-flex flex-wrap mt-1">
        <v-chip v-for="s in suggestions" :key="s" small outlined class="mr-1 mb-1" @click="query=s; search()">{{ s }}</v-chip>
      </div>
    </v-card>

    <v-skeleton-loader v-if="loading" type="list-item-two-line, list-item-two-line"></v-skeleton-loader>

    <v-expansion-panels v-else-if="faqs.length" accordion>
      <v-expansion-panel v-for="faq in faqs" :key="faq.id" @click="trackView(faq)">
        <v-expansion-panel-header>
          <div class="d-flex align-center">
            <v-icon small color="teal" class="mr-2">mdi-help-circle</v-icon>
            <span class="body-2 font-weight-medium">{{ faq.question }}</span>
            <v-spacer></v-spacer>
            <v-chip x-small :color="catColor(faq.category)" dark class="ml-2 mr-4">{{ faq.category }}</v-chip>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <p class="body-2 mt-2">{{ faq.answer }}</p>
          <div class="caption grey--text mt-2">{{ faq.views }} views</div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-else class="text-center grey--text mt-6">
      <v-icon large>mdi-robot-outline</v-icon>
      <p class="mt-2">No matching FAQ found. <a @click="contactLawyer" class="teal--text" style="cursor:pointer">Message your lawyer directly →</a></p>
    </div>
  </v-container>
</template>
<script>
import { cpGetFAQ, cpFAQView } from '@/services/portalApi';
export default {
  name: 'ClientAIFAQ',
  data() {
    return {
      faqs: [], loading: false, query: '',
      suggestions: ['Case status?', 'Pay invoice?', 'Upload documents?', 'E-signature?', 'Appointment?'],
    };
  },
  created() { this.search(); },
  methods: {
    async search() {
      this.loading = true;
      try { this.faqs = await cpGetFAQ(this.query || undefined); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    reset() { this.query = ''; this.search(); },
    async trackView(faq) {
      try { await cpFAQView(faq.id); faq.views = (faq.views || 0) + 1; }
      catch (_) { /* non-blocking */ }
    },
    contactLawyer() { this.$router.push('/client/chat'); },
    catColor(c) { const m = { cases:'blue', billing:'green', documents:'orange', appointments:'purple', security:'red', esignature:'teal' }; return m[c]||'grey'; },
  },
};
</script>
