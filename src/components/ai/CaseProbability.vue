<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Case Probability</h1><p class="body-2 grey--text">Win/loss probability predictions by case</p></v-col>
    </v-row>

    <v-data-table :headers="headers" :items="cases" class="elevation-1">
      <template v-slot:item.winProb="{ item }">
        <v-progress-linear :value="item.winProb" height="12" rounded :color="item.winProb >= 70 ? 'green' : item.winProb >= 50 ? 'orange' : 'red'"></v-progress-linear>
        <span class="caption">{{ item.winProb }}%</span>
      </template>
      <template v-slot:item.risk="{ item }">
        <v-chip x-small :color="item.risk === 'High' ? 'red' : item.risk === 'Medium' ? 'orange' : 'green'" dark>{{ item.risk }}</v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
export default {
  name: 'CaseProbability',
  data() {
    return {
      cases: [
        { name: 'Property Dispute – Ben Ali', stage: 'Pre-trial', winProb: 76, risk: 'Low' },
        { name: 'Criminal Appeal – Smith', stage: 'Appeal', winProb: 58, risk: 'Medium' },
        { name: 'Corporate Merger – ABC Ltd', stage: 'Negotiation', winProb: 83, risk: 'Low' },
        { name: 'Administrative Abuse Claim', stage: 'Discovery', winProb: 44, risk: 'High' },
      ],
      headers: [
        { text: 'Case', value: 'name' },
        { text: 'Stage', value: 'stage' },
        { text: 'Win Probability', value: 'winProb' },
        { text: 'Risk', value: 'risk' },
      ],
    };
  },
};
</script>
