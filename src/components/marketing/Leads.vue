<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Lead Pipeline</h1><p class="body-2 grey--text">Track and convert potential clients</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Lead</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stageCounts" :key="s.stage" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.stage }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.count }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>Leads
        <v-spacer></v-spacer>
        <v-select v-model="filterStage" :items="stages" label="Stage" outlined dense clearable style="max-width:180px" class="mr-2"></v-select>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense style="max-width:200px"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredLeads" :search="search">
        <template v-slot:item.stage="{ item }">
          <v-chip small :color="stageColor(item.stage)" dark>{{ item.stage }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="editLead(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="green" @click="advance(item)" v-if="item.stage !== 'Won' && item.stage !== 'Lost'"><v-icon small>mdi-arrow-right-circle</v-icon></v-btn>
          <v-btn icon small color="red" @click="del(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Lead' : 'New Lead' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Name" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.stage" :items="stages" label="Stage" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.source" :items="sources" label="Source" outlined dense></v-select></v-col>
          </v-row>
          <v-text-field v-model="form.email" label="Email" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="form.phone" label="Phone" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.practiceArea" :items="areas" label="Practice Area" outlined dense class="mt-3"></v-select>
          <v-text-field v-model="form.estimatedValue" label="Estimated Value (€)" outlined dense type="number" class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Leads',
  data() {
    return {
      search: '', filterStage: null, dialog: false, editMode: false,
      form: { id: null, name: '', stage: 'New', source: '', email: '', phone: '', practiceArea: '', estimatedValue: '' },
      stages: ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
      sources: ['Referral', 'Website', 'Social Media', 'Cold Outreach', 'Partner'],
      areas: ['Civil Law', 'Corporate Law', 'Criminal Law', 'Family Law', 'Administrative'],
      leads: [
        { id: 1, name: 'Youssef Trabelsi', stage: 'New', source: 'Referral', email: 'y.trabelsi@mail.com', phone: '+216 55 123 456', practiceArea: 'Civil Law', estimatedValue: 3000 },
        { id: 2, name: 'Rim Chaabene', stage: 'Contacted', source: 'Website', email: 'rim.c@mail.com', phone: '+216 22 654 321', practiceArea: 'Family Law', estimatedValue: 1500 },
        { id: 3, name: 'Mounir Jebali', stage: 'Proposal Sent', source: 'Social Media', email: 'mounir.j@biz.tn', phone: '+216 99 111 222', practiceArea: 'Corporate Law', estimatedValue: 8000 },
        { id: 4, name: 'Faten Ben Salem', stage: 'Won', source: 'Referral', email: 'faten.bs@mail.com', phone: '+216 71 000 111', practiceArea: 'Criminal Law', estimatedValue: 4500 },
      ],
      headers: [
        { text: 'Name', value: 'name' }, { text: 'Stage', value: 'stage' }, { text: 'Source', value: 'source' },
        { text: 'Practice Area', value: 'practiceArea' }, { text: 'Est. Value (€)', value: 'estimatedValue' },
        { text: 'Phone', value: 'phone' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredLeads() { return this.filterStage ? this.leads.filter(l => l.stage === this.filterStage) : this.leads; },
    stageCounts() {
      const colors = { New: 'blue', Contacted: 'teal', 'Proposal Sent': 'orange', Won: 'green', Lost: 'red' };
      const icons = { New: 'mdi-account-plus', Contacted: 'mdi-phone', 'Proposal Sent': 'mdi-email', Won: 'mdi-trophy', Lost: 'mdi-close-circle' };
      return ['New', 'Contacted', 'Proposal Sent', 'Won'].map(s => ({ stage: s, count: this.leads.filter(l => l.stage === s).length, color: colors[s], icon: icons[s] }));
    },
  },
  methods: {
    stageColor(s) { return { New: 'blue', Contacted: 'teal', 'Proposal Sent': 'orange', Negotiation: 'purple', Won: 'green', Lost: 'red' }[s] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, name: '', stage: 'New', source: '', email: '', phone: '', practiceArea: '', estimatedValue: '' }; this.dialog = true; },
    editLead(l) { this.editMode = true; this.form = { ...l }; this.dialog = true; },
    advance(l) {
      const idx = this.stages.indexOf(l.stage);
      if (idx < this.stages.length - 3) l.stage = this.stages[idx + 1];
    },
    del(id) { this.leads = this.leads.filter(l => l.id !== id); },
    save() {
      if (this.editMode) { const i = this.leads.findIndex(l => l.id === this.form.id); if (i !== -1) this.leads.splice(i, 1, { ...this.form }); }
      else this.leads.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
