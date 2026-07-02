<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Summarization</h1><p class="body-2 grey--text">Generate concise summaries from legal documents and case notes</p></v-col>
    </v-row>

    <v-card outlined class="pa-4 mb-4">
      <v-textarea v-model="inputText" label="Paste legal text or notes" outlined rows="8"></v-textarea>
      <v-row class="mt-2">
        <v-col cols="12" md="3"><v-select v-model="style" :items="styles" label="Summary Style" outlined dense></v-select></v-col>
        <v-col cols="12" md="3"><v-select v-model="length" :items="lengths" label="Length" outlined dense></v-select></v-col>
      </v-row>
      <v-btn color="primary" :loading="loading" @click="summarize"><v-icon left>mdi-text-box-search</v-icon> Summarize</v-btn>
    </v-card>

    <v-card outlined class="pa-4" v-if="summary">
      <v-card-title class="subtitle-1">Generated Summary</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <p class="body-2">{{ summary }}</p>
      <v-btn x-small text color="primary">Copy</v-btn>
    </v-card>
  </v-container>
</template>
<script>
export default {
  name: 'Summarization',
  data() {
    return {
      inputText: 'The claimant argues that the contract was terminated without lawful notice. The respondent maintains that material breach justified immediate termination. Evidence includes email correspondence, payroll records, and witness statements.',
      summary: '',
      style: 'Legal Brief',
      length: 'Medium',
      loading: false,
      styles: ['Legal Brief', 'Plain Language', 'Bullet Points', 'Executive Summary'],
      lengths: ['Short', 'Medium', 'Detailed'],
    };
  },
  methods: {
    summarize() {
      this.loading = true;
      setTimeout(() => {
        this.summary = 'The dispute centers on whether contract termination was lawful. The claimant alleges insufficient notice; the respondent cites material breach. Key evidence includes emails, payroll data, and witness testimony. Main legal issue: adequacy of termination procedure and proof of breach.';
        this.loading = false;
      }, 900);
    },
  },
};
</script>
