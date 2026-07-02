<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Precedents</h1><p class="body-2 grey--text">Track relevant precedents linked to active cases</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Precedent</v-btn></v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col cols="6" md="4">
        <v-select v-model="filterCase" :items="caseNames" label="Filter by Case" outlined dense clearable hide-details></v-select>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="filteredPrecedents" class="elevation-1">
      <template v-slot:item.relevance="{ item }">
        <v-rating :value="item.relevance" readonly dense length="5" color="amber" background-color="grey lighten-1" size="16"></v-rating>
      </template>
      <template v-slot:item.type="{ item }">
        <v-chip x-small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="orange" @click="edit(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="red" @click="del(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="580px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Precedent' : 'Add Precedent' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Case Title / Reference" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.type" :items="types" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.year" label="Year" outlined dense type="number"></v-text-field></v-col>
          </v-row>
          <v-select v-model="form.linkedCase" :items="caseNames" label="Linked Case" outlined dense class="mt-3"></v-select>
          <v-textarea v-model="form.notes" label="Notes / Why relevant" outlined rows="3" class="mt-3"></v-textarea>
          <div class="mt-2 caption">Relevance Rating</div>
          <v-rating v-model="form.relevance" length="5" color="amber" background-color="grey lighten-1"></v-rating>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.title }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-chip small :color="typeColor(selected.type)" dark class="mb-3">{{ selected.type }}</v-chip>
          <p><strong>Year:</strong> {{ selected.year }}</p>
          <p><strong>Linked Case:</strong> {{ selected.linkedCase }}</p>
          <div class="mt-1"><strong>Relevance:</strong></div>
          <v-rating :value="selected.relevance" readonly dense length="5" color="amber" background-color="grey lighten-1"></v-rating>
          <p class="mt-2"><strong>Notes:</strong><br>{{ selected.notes }}</p>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Precedents',
  data() {
    return {
      dialog: false, viewDialog: false, editMode: false, selected: null, filterCase: null,
      form: { id: null, title: '', type: '', year: '', linkedCase: '', notes: '', relevance: 3 },
      types: ['Civil', 'Criminal', 'Administrative', 'Commercial', 'Constitutional'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      precedents: [
        { id: 1, title: 'Ben Ali v. Nationale – Termination', type: 'Civil', year: 2023, linkedCase: 'Property Dispute – Ben Ali', notes: 'Establishes employer burden of proof in wrongful termination cases.', relevance: 5 },
        { id: 2, title: 'State v. Hamdi – Financial Fraud', type: 'Criminal', year: 2022, linkedCase: 'Criminal Appeal – Smith', notes: 'Digital evidence admissibility established. Directly applicable to our appeal.', relevance: 4 },
        { id: 3, title: 'Construction Co. Liability', type: 'Commercial', year: 2021, linkedCase: 'Corporate Merger – ABC Ltd', notes: 'Useful for contractor due diligence sections in merger agreement.', relevance: 3 },
      ],
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'type' }, { text: 'Year', value: 'year' },
        { text: 'Linked Case', value: 'linkedCase' }, { text: 'Relevance', value: 'relevance' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredPrecedents() { return this.filterCase ? this.precedents.filter(p => p.linkedCase === this.filterCase) : this.precedents; },
  },
  methods: {
    typeColor(t) { return { Civil: 'green', Criminal: 'red', Administrative: 'purple', Commercial: 'blue', Constitutional: 'orange' }[t] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', type: '', year: '', linkedCase: '', notes: '', relevance: 3 }; this.dialog = true; },
    view(p) { this.selected = p; this.viewDialog = true; },
    edit(p) { this.editMode = true; this.form = { ...p }; this.dialog = true; },
    del(id) { this.precedents = this.precedents.filter(p => p.id !== id); },
    save() {
      if (this.editMode) { const i = this.precedents.findIndex(p => p.id === this.form.id); if (i !== -1) this.precedents.splice(i, 1, { ...this.form }); }
      else this.precedents.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
