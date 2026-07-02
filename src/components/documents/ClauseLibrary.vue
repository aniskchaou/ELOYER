<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Clause Library</h1>
        <p class="body-2 grey--text">Standard and custom legal clauses for quick insertion</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openAdd">
          <v-icon left>mdi-plus</v-icon> New Clause
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3">
          <v-select v-model="filterCategory" :items="categories" label="Category" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filterJurisdiction" :items="jurisdictions" label="Jurisdiction" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search clauses" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="viewMode" :items="['List','Grid']" outlined dense></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Grid view -->
    <v-row v-if="viewMode === 'Grid'">
      <v-col v-for="clause in filteredClauses" :key="clause.id" cols="12" md="4">
        <v-card outlined class="pa-3" style="height:100%">
          <div class="d-flex justify-space-between align-center">
            <v-chip small :color="categoryColor(clause.category)" dark>{{ clause.category }}</v-chip>
            <v-chip x-small outlined>{{ clause.jurisdiction }}</v-chip>
          </div>
          <v-card-title class="body-1 font-weight-bold pt-2 pb-1 px-0">{{ clause.title }}</v-card-title>
          <p class="caption grey--text" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">{{ clause.text }}</p>
          <v-card-actions class="px-0">
            <v-btn x-small text color="primary" @click="viewClause(clause)">View</v-btn>
            <v-btn x-small text color="green" @click="copyClause(clause)">Copy</v-btn>
            <v-btn x-small text color="orange" @click="editClause(clause)">Edit</v-btn>
            <v-btn x-small text color="red" @click="deleteClause(clause.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- List view -->
    <v-card v-else outlined>
      <v-data-table :headers="headers" :items="filteredClauses" :search="search" class="elevation-0">
        <template v-slot:item.category="{ item }">
          <v-chip small :color="categoryColor(item.category)" dark>{{ item.category }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="viewClause(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="green" @click="copyClause(item)"><v-icon small>mdi-content-copy</v-icon></v-btn>
          <v-btn icon small color="orange" @click="editClause(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteClause(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Snackbar for copy -->
    <v-snackbar v-model="snackbar" timeout="2000" color="success">Clause copied to clipboard!</v-snackbar>

    <!-- View / Add / Edit dialog -->
    <v-dialog v-model="dialog" max-width="680px">
      <v-card>
        <v-card-title>{{ dialogMode === 'view' ? 'View Clause' : editMode ? 'Edit Clause' : 'New Clause' }}
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title" outlined dense :readonly="dialogMode === 'view'"></v-text-field>
          <v-row class="mt-2">
            <v-col cols="6">
              <v-select v-model="form.category" :items="categories" label="Category" outlined dense :readonly="dialogMode === 'view'"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="form.jurisdiction" :items="jurisdictions" label="Jurisdiction" outlined dense :readonly="dialogMode === 'view'"></v-select>
            </v-col>
          </v-row>
          <v-textarea v-model="form.text" label="Clause Text" outlined rows="8" class="mt-2" :readonly="dialogMode === 'view'"
            style="font-family:serif;"></v-textarea>
        </v-card-text>
        <v-card-actions v-if="dialogMode !== 'view'">
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveClause">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'ClauseLibrary',
  data() {
    return {
      dialog: false,
      dialogMode: 'add',
      editMode: false,
      snackbar: false,
      search: '',
      viewMode: 'List',
      filterCategory: null,
      filterJurisdiction: null,
      form: { id: null, title: '', category: '', jurisdiction: '', text: '' },
      categories: ['Liability', 'Confidentiality', 'Termination', 'Payment', 'Indemnification', 'Dispute Resolution', 'Intellectual Property', 'Force Majeure'],
      jurisdictions: ['France', 'Belgium', 'International', 'EU', 'Switzerland'],
      clauses: [
        { id: 1, title: 'Limitation of Liability', category: 'Liability', jurisdiction: 'France', text: 'In no event shall either party be liable for indirect, incidental, special, or consequential damages arising out of or in connection with this Agreement, even if such party has been advised of the possibility of such damages.' },
        { id: 2, title: 'Standard Confidentiality', category: 'Confidentiality', jurisdiction: 'International', text: 'Each party agrees to keep confidential all information received from the other party and not to disclose it to any third party without prior written consent, during the term and for five (5) years thereafter.' },
        { id: 3, title: 'Termination for Cause', category: 'Termination', jurisdiction: 'EU', text: 'Either party may terminate this Agreement immediately upon written notice if the other party materially breaches any term of this Agreement and fails to cure such breach within thirty (30) days after receiving written notice.' },
        { id: 4, title: 'Payment Terms Net 30', category: 'Payment', jurisdiction: 'France', text: 'Invoices are due and payable within thirty (30) days of the invoice date. Late payments shall bear interest at the rate of 1.5% per month from the due date until paid.' },
        { id: 5, title: 'Force Majeure', category: 'Force Majeure', jurisdiction: 'International', text: 'Neither party shall be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including acts of God, government action, war, or natural disaster.' },
        { id: 6, title: 'Arbitration Clause', category: 'Dispute Resolution', jurisdiction: 'Belgium', text: 'Any dispute arising out of or in connection with this Agreement shall be referred to and finally resolved by arbitration under the ICC Rules. The seat of arbitration shall be Brussels.' },
      ],
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Category', value: 'category' },
        { text: 'Jurisdiction', value: 'jurisdiction' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredClauses() {
      let list = this.clauses;
      if (this.filterCategory) list = list.filter(c => c.category === this.filterCategory);
      if (this.filterJurisdiction) list = list.filter(c => c.jurisdiction === this.filterJurisdiction);
      if (this.search) list = list.filter(c => c.title.toLowerCase().includes(this.search.toLowerCase()) || c.text.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    categoryColor(cat) {
      const map = { Liability: 'red', Confidentiality: 'blue', Termination: 'orange', Payment: 'green', Indemnification: 'purple', 'Dispute Resolution': 'teal', 'Intellectual Property': 'indigo', 'Force Majeure': 'brown' };
      return map[cat] || 'grey';
    },
    openAdd() { this.dialogMode = 'add'; this.editMode = false; this.form = { id: null, title: '', category: '', jurisdiction: '', text: '' }; this.dialog = true; },
    viewClause(item) { this.dialogMode = 'view'; this.form = { ...item }; this.dialog = true; },
    editClause(item) { this.dialogMode = 'edit'; this.editMode = true; this.form = { ...item }; this.dialog = true; },
    copyClause(item) { navigator.clipboard.writeText(item.text).catch(() => {}); this.snackbar = true; },
    saveClause() {
      if (this.editMode) {
        const idx = this.clauses.findIndex(c => c.id === this.form.id);
        if (idx !== -1) this.clauses.splice(idx, 1, { ...this.form });
      } else {
        this.clauses.push({ ...this.form, id: Date.now() });
      }
      this.dialog = false;
    },
    deleteClause(id) { this.clauses = this.clauses.filter(c => c.id !== id); },
  },
};
</script>
