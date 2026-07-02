<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Court Categories</h1><p class="body-2 grey--text">Manage court jurisdictions and category classifications</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Category</v-btn></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined>
          <v-card-title class="subtitle-1">Categories
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" single-line hide-details dense style="max-width:160px"></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item v-for="cat in filteredCats" :key="cat.id" :class="selected && selected.id === cat.id ? 'blue lighten-5' : ''" @click="selected = cat">
              <v-list-item-icon><v-icon :color="cat.color">{{ cat.icon }}</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ cat.name }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ cat.level }} · {{ cat.casesCount }} cases</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon x-small color="orange" @click.stop="editCat(cat)"><v-icon small>mdi-pencil</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" v-if="selected">
          <v-card-title><v-icon :color="selected.color" class="mr-2">{{ selected.icon }}</v-icon>{{ selected.name }}</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row>
            <v-col cols="6"><strong>Level:</strong> {{ selected.level }}</v-col>
            <v-col cols="6"><strong>Jurisdiction:</strong> {{ selected.jurisdiction }}</v-col>
            <v-col cols="6"><strong>Active Cases:</strong> {{ selected.casesCount }}</v-col>
            <v-col cols="6"><strong>Filing Fee:</strong> {{ selected.filingFee }}</v-col>
            <v-col cols="12"><strong>Description:</strong> {{ selected.description }}</v-col>
          </v-row>
          <v-divider class="my-3"></v-divider>
          <div class="overline mb-2">Sub-courts</div>
          <v-chip v-for="s in selected.subCourts" :key="s" class="mr-1 mb-1" small outlined>{{ s }}</v-chip>
        </v-card>
        <v-card outlined class="pa-6 text-center" v-else>
          <v-icon size="56" color="grey lighten-2">mdi-gavel</v-icon>
          <p class="grey--text mt-3">Select a category to view details</p>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="540px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Category' : 'New Category' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Category Name" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.level" :items="levels" label="Court Level" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.jurisdiction" :items="jurisdictions" label="Jurisdiction" outlined dense></v-select></v-col>
          </v-row>
          <v-text-field v-model="form.filingFee" label="Filing Fee" outlined dense class="mt-3"></v-text-field>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'CourtCategories',
  data() {
    return {
      search: '', selected: null, dialog: false, editMode: false,
      form: { id: null, name: '', level: '', jurisdiction: '', filingFee: '', description: '' },
      levels: ['First Instance', 'Appeals', 'Supreme', 'Administrative', 'Commercial', 'Military'],
      jurisdictions: ['National', 'Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul'],
      categories: [
        { id: 1, name: 'Commercial Court', level: 'First Instance', jurisdiction: 'Tunis', casesCount: 34, filingFee: '€120', icon: 'mdi-briefcase', color: 'blue', description: 'Handles commercial disputes, mergers, and corporate litigation.', subCourts: ['Bankruptcy Chamber', 'Contract Disputes'] },
        { id: 2, name: 'Civil Court', level: 'First Instance', jurisdiction: 'Sousse', casesCount: 22, filingFee: '€80', icon: 'mdi-scale-balance', color: 'green', description: 'Civil matters including property, family, and contract disputes.', subCourts: ['Family Chamber', 'Property Chamber'] },
        { id: 3, name: 'Administrative Court', level: 'Administrative', jurisdiction: 'National', casesCount: 11, filingFee: '€200', icon: 'mdi-domain', color: 'purple', description: 'Administrative law disputes with government entities.', subCourts: ['Tax Disputes', 'Public Contracts'] },
        { id: 4, name: 'Criminal Court', level: 'First Instance', jurisdiction: 'Tunis', casesCount: 8, filingFee: '€0', icon: 'mdi-gavel', color: 'red', description: 'Criminal proceedings and penal code enforcement.', subCourts: ['Felony Division', 'Misdemeanor Division'] },
      ],
    };
  },
  computed: { filteredCats() { return this.search ? this.categories.filter(c => c.name.toLowerCase().includes(this.search.toLowerCase())) : this.categories; } },
  methods: {
    openAdd() { this.editMode = false; this.form = { id: null, name: '', level: '', jurisdiction: '', filingFee: '', description: '' }; this.dialog = true; },
    editCat(cat) { this.editMode = true; this.form = { ...cat }; this.dialog = true; },
    save() {
      if (this.editMode) { const i = this.categories.findIndex(c => c.id === this.form.id); if (i !== -1) this.categories.splice(i, 1, { ...this.form, icon: 'mdi-gavel', color: 'grey', casesCount: 0, subCourts: [] }); }
      else this.categories.push({ ...this.form, id: Date.now(), icon: 'mdi-gavel', color: 'grey', casesCount: 0, subCourts: [] });
      this.dialog = false;
    },
  },
};
</script>
