<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">E-Filing</h1><p class="body-2 grey--text">Submit and track electronic court filings online</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openFiling"><v-icon left>mdi-file-upload</v-icon> New Filing</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>Filing Queue
        <v-spacer></v-spacer>
        <v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable style="max-width:180px"></v-select>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredFilings">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="orange" v-if="item.status==='Draft'" @click="submit(item)"><v-icon small>mdi-send</v-icon></v-btn>
          <v-btn icon small color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- New Filing Dialog (stepper) -->
    <v-dialog v-model="dialog" max-width="620px">
      <v-card>
        <v-card-title>New E-Filing</v-card-title>
        <v-divider></v-divider>
        <v-stepper v-model="step" class="elevation-0">
          <v-stepper-header>
            <v-stepper-step :complete="step>1" step="1">Case Info</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step>2" step="2">Documents</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Review</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-select v-model="form.case" :items="caseNames" label="Case" outlined dense class="mb-3"></v-select>
              <v-select v-model="form.court" :items="courtNames" label="Court" outlined dense class="mb-3"></v-select>
              <v-select v-model="form.filingType" :items="filingTypes" label="Filing Type" outlined dense class="mb-3"></v-select>
              <v-text-field v-model="form.deadline" label="Submission Deadline" outlined dense type="date" class="mb-3"></v-text-field>
              <v-btn color="primary" @click="step=2">Next</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-file-input label="Upload Documents" outlined dense multiple prepend-icon="mdi-paperclip" accept=".pdf,.docx" class="mb-3"></v-file-input>
              <v-textarea v-model="form.description" label="Filing Description" outlined rows="3" class="mb-3"></v-textarea>
              <v-btn text @click="step=1">Back</v-btn>
              <v-btn color="primary" class="ml-2" @click="step=3">Next</v-btn>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-sheet outlined class="pa-3 mb-3">
                <p><strong>Case:</strong> {{ form.case }}</p>
                <p><strong>Court:</strong> {{ form.court }}</p>
                <p><strong>Type:</strong> {{ form.filingType }}</p>
                <p><strong>Deadline:</strong> {{ form.deadline }}</p>
              </v-sheet>
              <v-btn text @click="step=2">Back</v-btn>
              <v-btn color="primary" class="ml-2" @click="saveFiling">Submit Filing</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'EFiling',
  data() {
    return {
      filterStatus: null, dialog: false, step: 1,
      form: { case: '', court: '', filingType: '', deadline: '', description: '' },
      statuses: ['Draft', 'Submitted', 'Accepted', 'Rejected', 'Pending Review'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      courtNames: ['Commercial Court – Tunis', 'Civil Court – Sousse', 'Criminal Court – Tunis'],
      filingTypes: ['Motion', 'Complaint', 'Answer', 'Brief', 'Appeal', 'Settlement'],
      filings: [
        { id: 1, case: 'Property Dispute – Ben Ali', court: 'Civil Court – Sousse', filingType: 'Motion', deadline: '2026-05-15', status: 'Submitted', submittedDate: '2026-04-28', refNumber: 'EFIL-2026-0045' },
        { id: 2, case: 'Criminal Appeal – Smith', court: 'Criminal Court – Tunis', filingType: 'Brief', deadline: '2026-05-10', status: 'Draft', submittedDate: '', refNumber: '' },
        { id: 3, case: 'Corporate Merger – ABC Ltd', court: 'Commercial Court – Tunis', filingType: 'Settlement', deadline: '2026-04-01', status: 'Accepted', submittedDate: '2026-03-25', refNumber: 'EFIL-2026-0032' },
      ],
      headers: [
        { text: 'Case', value: 'case' }, { text: 'Court', value: 'court' }, { text: 'Type', value: 'filingType' },
        { text: 'Deadline', value: 'deadline' }, { text: 'Ref #', value: 'refNumber' },
        { text: 'Status', value: 'status' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Filings', value: this.filings.length, color: 'blue', icon: 'mdi-file-multiple' },
        { label: 'Drafts', value: this.filings.filter(f => f.status === 'Draft').length, color: 'grey', icon: 'mdi-file-edit' },
        { label: 'Accepted', value: this.filings.filter(f => f.status === 'Accepted').length, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Rejected', value: this.filings.filter(f => f.status === 'Rejected').length, color: 'red', icon: 'mdi-close-circle' },
      ];
    },
    filteredFilings() { return this.filterStatus ? this.filings.filter(f => f.status === this.filterStatus) : this.filings; },
  },
  methods: {
    statusColor(s) { return { Draft: 'grey', Submitted: 'blue', Accepted: 'green', Rejected: 'red', 'Pending Review': 'orange' }[s] || 'grey'; },
    openFiling() { this.step = 1; this.form = { case: '', court: '', filingType: '', deadline: '', description: '' }; this.dialog = true; },
    view(item) { void item; },
    submit(item) { item.status = 'Submitted'; item.submittedDate = new Date().toISOString().split('T')[0]; },
    download(item) { void item; },
    saveFiling() { this.filings.push({ ...this.form, id: Date.now(), status: 'Submitted', submittedDate: new Date().toISOString().split('T')[0], refNumber: 'EFIL-2026-' + String(Date.now()).slice(-4) }); this.dialog = false; },
  },
};
</script>
