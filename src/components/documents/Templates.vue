<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Templates</h1><p class="body-2 grey--text">Reusable document templates for common legal matters</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Template</v-btn></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="12" md="3"><v-select v-model="filterCat" :items="categories" label="Category" outlined dense clearable></v-select></v-col>
      <v-col cols="12" md="3"><v-select v-model="filterLang" :items="languages" label="Language" outlined dense clearable></v-select></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search templates" outlined dense></v-text-field></v-col>
    </v-row>
    <v-row>
      <v-col v-for="t in filtered" :key="t.id" cols="12" md="4">
        <v-card outlined class="pa-3" style="height:100%">
          <div class="d-flex justify-space-between align-center mb-2">
            <v-chip small :color="catColor(t.category)" dark>{{ t.category }}</v-chip>
            <v-chip x-small outlined>{{ t.language }}</v-chip>
          </div>
          <v-card-title class="body-1 font-weight-bold px-0 py-1">{{ t.name }}</v-card-title>
          <p class="caption grey--text">{{ t.description }}</p>
          <div class="caption">Last updated: {{ t.updated }}</div>
          <v-card-actions class="px-0 pt-2">
            <v-btn x-small text color="primary" @click="viewTpl(t)">Preview</v-btn>
            <v-btn x-small text color="green" @click="useTpl(t)">Use</v-btn>
            <v-btn x-small text color="orange" @click="editTpl(t)">Edit</v-btn>
            <v-btn x-small text color="red" @click="deleteTpl(t.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="640px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Template' : 'New Template' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Template Name" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.category" :items="categories" label="Category" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.language" :items="languages" label="Language" outlined dense></v-select></v-col>
          </v-row>
          <v-text-field v-model="form.description" label="Description" outlined dense class="mt-3"></v-text-field>
          <v-textarea v-model="form.content" label="Template Content" outlined rows="8" class="mt-3" style="font-family:serif"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="680px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.name }}<v-spacer></v-spacer><v-btn icon @click="previewDialog=false"><v-icon>mdi-close</v-icon></v-btn></v-card-title>
        <v-divider></v-divider>
        <v-card-text><v-sheet outlined class="pa-4" style="font-family:serif;line-height:1.8;white-space:pre-wrap">{{ selected.content }}</v-sheet></v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'LegalTemplates',
  data() {
    return {
      search: '', filterCat: null, filterLang: null, dialog: false, previewDialog: false, editMode: false, selected: null,
      form: { id: null, name: '', category: '', language: 'French', description: '', content: '' },
      categories: ['Corporate', 'Criminal', 'Family', 'Real Estate', 'Employment', 'IP', 'Administrative'],
      languages: ['French', 'Arabic', 'English'],
      templates: [
        { id: 1, name: 'Standard Retainer Agreement', category: 'Corporate', language: 'French', description: 'Template for monthly retainer engagements.', content: 'CONVENTION D\'HONORAIRES\n\nEntre Maître [NOM], avocat...\n\nArticle 1 – Objet\n...\nArticle 2 – Honoraires\n...', updated: '2026-03-01' },
        { id: 2, name: 'Divorce Petition', category: 'Family', language: 'Arabic', description: 'Standard divorce petition template.', content: 'طلب الطلاق\n\nالمدعي: ...\nالمدعى عليه: ...\nالأسباب: ...', updated: '2026-01-15' },
        { id: 3, name: 'Employment Contract', category: 'Employment', language: 'French', description: 'CDI employment contract template.', content: 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE\n\nEntre la société [NOM]...\n\nArticle 1 – Poste\n...\nArticle 2 – Rémunération\n...', updated: '2026-02-20' },
        { id: 4, name: 'IP Assignment Agreement', category: 'IP', language: 'English', description: 'Intellectual property assignment template.', content: 'IP ASSIGNMENT AGREEMENT\n\nThis Agreement is between [ASSIGNOR] and [ASSIGNEE]...\n\n1. Assignment of Rights\n...', updated: '2025-12-10' },
      ],
    };
  },
  computed: {
    filtered() {
      let list = this.templates;
      if (this.filterCat) list = list.filter(t => t.category === this.filterCat);
      if (this.filterLang) list = list.filter(t => t.language === this.filterLang);
      if (this.search) list = list.filter(t => t.name.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    catColor(c) { return { Corporate: 'blue', Criminal: 'red', Family: 'pink', 'Real Estate': 'brown', Employment: 'teal', IP: 'indigo', Administrative: 'grey' }[c] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, name: '', category: '', language: 'French', description: '', content: '' }; this.dialog = true; },
    editTpl(t) { this.editMode = true; this.form = { ...t }; this.dialog = true; },
    viewTpl(t) { this.selected = t; this.previewDialog = true; },
    useTpl(t) { void t; },
    save() {
      if (this.editMode) { const i = this.templates.findIndex(t => t.id === this.form.id); if (i !== -1) this.templates.splice(i, 1, { ...this.form, updated: new Date().toISOString().split('T')[0] }); }
      else this.templates.push({ ...this.form, id: Date.now(), updated: new Date().toISOString().split('T')[0] });
      this.dialog = false;
    },
    deleteTpl(id) { this.templates = this.templates.filter(t => t.id !== id); },
  },
};
</script>
