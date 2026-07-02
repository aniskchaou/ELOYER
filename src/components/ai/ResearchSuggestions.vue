<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Research Suggestions</h1><p class="body-2 grey--text">Suggested legal resources, precedents, and statutes for active matters</p></v-col>
    </v-row>

    <v-row>
      <v-col v-for="s in suggestions" :key="s.id" cols="12" md="6">
        <v-card outlined class="pa-4 mb-3">
          <div class="d-flex align-center">
            <v-icon :color="typeColor(s.type)" class="mr-2">mdi-book-search</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ s.title }}</div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="typeColor(s.type)" dark>{{ s.type }}</v-chip>
          </div>
          <div class="caption grey--text mt-2">Case: {{ s.case }}</div>
          <p class="caption mt-2">{{ s.reason }}</p>
          <v-divider class="my-2"></v-divider>
          <div class="caption"><strong>Relevance:</strong> {{ s.relevance }}%</div>
          <v-progress-linear :value="s.relevance" height="10" rounded :color="s.relevance >= 80 ? 'green' : s.relevance >= 60 ? 'orange' : 'red'"></v-progress-linear>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'ResearchSuggestions',
  data() {
    return {
      suggestions: [
        { id: 1, title: 'Ben Ali v. Nationale (2023)', type: 'Precedent', case: 'Property Dispute – Ben Ali', reason: 'Strong similarity in procedural dismissal arguments and burden of proof.', relevance: 89 },
        { id: 2, title: 'Criminal Procedure Code Art. 47', type: 'Statute', case: 'Criminal Appeal – Smith', reason: 'Relevant to detention timelines and admissibility procedural safeguards.', relevance: 77 },
        { id: 3, title: 'Commercial Code Art. 214', type: 'Statute', case: 'Corporate Merger – ABC Ltd', reason: 'Directly impacts warranty liability limits in merger agreements.', relevance: 84 },
        { id: 4, title: 'State v. Hamdi (2022)', type: 'Case Law', case: 'Criminal Appeal – Smith', reason: 'Supports admissibility arguments for digital financial records.', relevance: 72 },
      ],
    };
  },
  methods: {
    typeColor(type) { return { Precedent: 'green', Statute: 'blue', 'Case Law': 'purple' }[type] || 'grey'; },
  },
};
</script>
