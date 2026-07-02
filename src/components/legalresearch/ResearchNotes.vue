<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Research Notes</h1><p class="body-2 grey--text">Organize and annotate your legal research</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Note</v-btn></v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search notes..." outlined dense hide-details></v-text-field>
      </v-col>
      <v-col cols="6" md="3">
        <v-select v-model="filterTag" :items="allTags" label="Filter by Tag" outlined dense clearable hide-details></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="note in filteredNotes" :key="note.id" cols="12" md="6" lg="4">
        <v-card outlined class="mb-3" :style="'border-left: 4px solid ' + noteColor(note.category)">
          <v-card-title class="subtitle-2 pb-1">{{ note.title }}</v-card-title>
          <v-card-subtitle class="caption pb-0">{{ note.date }}</v-card-subtitle>
          <v-card-text class="py-2">
            <p class="caption mb-2">{{ note.content.slice(0, 120) }}{{ note.content.length > 120 ? '...' : '' }}</p>
            <div>
              <v-chip v-for="tag in note.tags" :key="tag" x-small outlined class="mr-1 mb-1">{{ tag }}</v-chip>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn x-small text color="primary" @click="view(note)">Read</v-btn>
            <v-btn x-small text color="orange" @click="editNote(note)">Edit</v-btn>
            <v-btn x-small text color="red" @click="del(note.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="580px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Note' : 'New Research Note' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.category" :items="categories" label="Category" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-textarea v-model="form.content" label="Note content" outlined rows="5" class="mt-3"></v-textarea>
          <v-combobox v-model="form.tags" :items="allTags" label="Tags (press Enter to add)" outlined dense multiple chips class="mt-3"></v-combobox>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="560px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.title }}</v-card-title>
        <v-card-subtitle>{{ selected.date }}</v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <p class="body-2">{{ selected.content }}</p>
          <div class="mt-3"><v-chip v-for="tag in selected.tags" :key="tag" small outlined class="mr-1">{{ tag }}</v-chip></div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'ResearchNotes',
  data() {
    return {
      search: '', filterTag: null, dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { id: null, title: '', content: '', category: '', date: '', tags: [] },
      categories: ['Case Strategy', 'Statute Analysis', 'Precedent', 'Client Brief', 'General'],
      notes: [
        { id: 1, title: 'Digital Evidence – Authentication Requirements', category: 'Case Strategy', date: '2026-04-20', content: 'Courts increasingly require metadata verification for digital evidence. Chain of custody must be documented at each stage. Certified hash values needed for banking records.', tags: ['criminal', 'digital evidence', 'Smith appeal'] },
        { id: 2, title: 'Wrongful Termination – Procedural Requirements', category: 'Precedent', date: '2026-04-15', content: 'Employer must issue written warnings before dismissal. 2023 COA ruling requires at minimum two documented warnings unless gross misconduct is proven.', tags: ['labor law', 'Ben Ali', 'termination'] },
        { id: 3, title: 'Merger Warranty Clause – Best Practices', category: 'Statute Analysis', date: '2026-05-02', content: 'Uncapped warranty clauses are increasingly challenged under Commercial Code Art. 214. Standard practice is 12-18 month cap on general warranties, with carve-outs for fraud and title.', tags: ['corporate', 'merger', 'ABC SARL'] },
      ],
    };
  },
  computed: {
    allTags() { return [...new Set(this.notes.flatMap(n => n.tags))]; },
    filteredNotes() {
      return this.notes.filter(n =>
        (!this.filterTag || n.tags.includes(this.filterTag)) &&
        (!this.search || n.title.toLowerCase().includes(this.search.toLowerCase()) || n.content.toLowerCase().includes(this.search.toLowerCase()))
      );
    },
  },
  methods: {
    noteColor(cat) { return { 'Case Strategy': '#1976D2', Precedent: '#388E3C', 'Statute Analysis': '#7B1FA2', 'Client Brief': '#F57C00', General: '#757575' }[cat] || '#9E9E9E'; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', content: '', category: '', date: new Date().toISOString().substr(0, 10), tags: [] }; this.dialog = true; },
    view(n) { this.selected = n; this.viewDialog = true; },
    editNote(n) { this.editMode = true; this.form = { ...n, tags: [...n.tags] }; this.dialog = true; },
    del(id) { this.notes = this.notes.filter(n => n.id !== id); },
    save() {
      if (this.editMode) { const i = this.notes.findIndex(n => n.id === this.form.id); if (i !== -1) this.notes.splice(i, 1, { ...this.form }); }
      else this.notes.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
