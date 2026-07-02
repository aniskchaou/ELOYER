<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Contract Generator</h1><p class="body-2 grey--text">Generate professional legal contracts in minutes using guided templates</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-3">
          <v-card-title class="subtitle-1">New Contract</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="wizard.type" :items="contractTypes" label="Contract Type" outlined dense class="mb-3" @change="resetWizard"></v-select>
          <v-select v-model="wizard.template" :items="templates" label="Base Template" outlined dense class="mb-3" :disabled="!wizard.type"></v-select>
          <v-select v-model="wizard.language" :items="['French','Arabic','English']" label="Language" outlined dense class="mb-3"></v-select>
          <v-btn block color="primary" :disabled="!wizard.template" @click="stepper=1; generating=false">Start Generator <v-icon right>mdi-arrow-right</v-icon></v-btn>
        </v-card>

        <v-card outlined class="pa-3 mt-4">
          <v-card-title class="subtitle-1">Recent Contracts</v-card-title>
          <v-divider class="mb-2"></v-divider>
          <v-list dense>
            <v-list-item v-for="r in recent" :key="r.id">
              <v-list-item-icon><v-icon color="primary">mdi-file-document</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="caption">{{ r.name }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ r.date }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-btn icon x-small><v-icon small>mdi-download</v-icon></v-btn></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined>
          <v-stepper v-model="stepper" class="elevation-0">
            <v-stepper-header>
              <v-stepper-step :complete="stepper > 1" step="1">Parties</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step :complete="stepper > 2" step="2">Terms</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step :complete="stepper > 3" step="3">Review</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="4">Generate</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <v-row class="my-2">
                  <v-col cols="12"><div class="overline mb-2">Party A (Client / First Party)</div></v-col>
                  <v-col cols="6"><v-text-field v-model="parties.aName" label="Full Name / Company" outlined dense></v-text-field></v-col>
                  <v-col cols="6"><v-text-field v-model="parties.aId" label="ID / Reg. Number" outlined dense></v-text-field></v-col>
                  <v-col cols="12"><v-text-field v-model="parties.aAddress" label="Address" outlined dense></v-text-field></v-col>
                  <v-col cols="12"><div class="overline mb-2 mt-2">Party B (Lawyer / Law Firm)</div></v-col>
                  <v-col cols="6"><v-text-field v-model="parties.bName" label="Lawyer / Firm Name" outlined dense></v-text-field></v-col>
                  <v-col cols="6"><v-text-field v-model="parties.bBar" label="Bar Number" outlined dense></v-text-field></v-col>
                </v-row>
                <v-btn color="primary" @click="stepper=2">Next</v-btn>
              </v-stepper-content>

              <v-stepper-content step="2">
                <v-row class="my-2">
                  <v-col cols="6"><v-text-field v-model="terms.startDate" label="Start Date" outlined dense type="date"></v-text-field></v-col>
                  <v-col cols="6"><v-text-field v-model="terms.endDate" label="End Date" outlined dense type="date"></v-text-field></v-col>
                  <v-col cols="6"><v-text-field v-model="terms.fee" label="Fee Amount (€)" outlined dense type="number"></v-text-field></v-col>
                  <v-col cols="6"><v-select v-model="terms.feeType" :items="['Fixed','Hourly','Contingency','Retainer']" label="Fee Type" outlined dense></v-select></v-col>
                  <v-col cols="12"><v-textarea v-model="terms.scope" label="Scope of Work" outlined rows="3"></v-textarea></v-col>
                  <v-col cols="12"><v-textarea v-model="terms.special" label="Special Clauses (optional)" outlined rows="2"></v-textarea></v-col>
                </v-row>
                <v-btn text @click="stepper=1">Back</v-btn>
                <v-btn color="primary" class="ml-2" @click="stepper=3">Next</v-btn>
              </v-stepper-content>

              <v-stepper-content step="3">
                <v-sheet outlined class="pa-4 mb-3" style="font-family:serif;line-height:1.8;max-height:360px;overflow-y:auto">
                  <strong>{{ wizard.type || 'CONTRACT' }}</strong><br><br>
                  <strong>BETWEEN:</strong> {{ parties.aName || '[Party A]' }} ({{ parties.aId || 'ID' }})<br>
                  <strong>AND:</strong> {{ parties.bName || '[Party B]' }} (Bar: {{ parties.bBar || 'N/A' }})<br><br>
                  <strong>Period:</strong> {{ terms.startDate || '...' }} to {{ terms.endDate || '...' }}<br>
                  <strong>Fee:</strong> {{ terms.fee || '...' }} ({{ terms.feeType || '...' }})<br><br>
                  <strong>Scope:</strong> {{ terms.scope || '...' }}<br><br>
                  <span v-if="terms.special"><strong>Special Clauses:</strong> {{ terms.special }}<br><br></span>
                  Signatures: ________________________ / ________________________
                </v-sheet>
                <v-btn text @click="stepper=2">Back</v-btn>
                <v-btn color="primary" class="ml-2" @click="generate">Generate Contract</v-btn>
              </v-stepper-content>

              <v-stepper-content step="4">
                <div v-if="generating" class="text-center py-6">
                  <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
                  <p>Generating contract…</p>
                </div>
                <div v-else class="text-center py-6">
                  <v-icon color="green" size="56">mdi-check-circle</v-icon>
                  <p class="text-h6 mt-3">Contract Generated!</p>
                  <p class="grey--text">{{ wizard.type }} – {{ parties.aName }}</p>
                  <div class="mt-3">
                    <v-btn color="primary" class="mr-2"><v-icon left>mdi-download</v-icon> Download PDF</v-btn>
                    <v-btn outlined color="primary"><v-icon left>mdi-email-send</v-icon> Send to Client</v-btn>
                  </div>
                </div>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'ContractGenerator',
  data() {
    return {
      stepper: 1, generating: false,
      wizard: { type: '', template: '', language: 'French' },
      parties: { aName: '', aId: '', aAddress: '', bName: 'Maître Ahmed Cherni', bBar: 'TUN-1234' },
      terms: { startDate: '', endDate: '', fee: '', feeType: 'Fixed', scope: '', special: '' },
      contractTypes: ['Retainer Agreement', 'Fixed Fee Contract', 'Contingency Agreement', 'Employment Contract', 'NDA', 'Settlement Agreement'],
      templates: ['Standard Template', 'Corporate Template', 'Individual Client Template'],
      recent: [
        { id: 1, name: 'Retainer – ABC SARL', date: '2026-04-30' },
        { id: 2, name: 'Fixed Fee – Ben Ali', date: '2026-03-15' },
        { id: 3, name: 'NDA – HelpAid', date: '2026-02-01' },
      ],
    };
  },
  methods: {
    resetWizard() { this.wizard.template = ''; },
    generate() {
      this.generating = true;
      this.stepper = 4;
      setTimeout(() => { this.generating = false; }, 1500);
    },
  },
};
</script>
