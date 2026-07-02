<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Research Workspace</h1><p class="body-2 grey--text">AI-powered legal research with note-taking</p></v-col>
      <v-col cols="auto"><v-btn color="cyan darken-1" dark @click="openNote()"><v-icon left>mdi-plus</v-icon>New Note</v-btn></v-col>
    </v-row>

    <v-row>
      <!-- Search Panel -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2"><v-icon left color="cyan">mdi-magnify</v-icon>AI Legal Search</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="query" label="Search case law, statutes, precedents…" outlined dense append-icon="mdi-send" @click:append="search" @keyup.enter="search"></v-text-field>
          <v-select v-model="searchType" :items="searchTypes" outlined dense hide-details class="mt-2"></v-select>
          <v-list dense class="mt-3">
            <v-list-item v-for="r in results" :key="r.id" @click="selectResult(r)" style="cursor:pointer">
              <v-list-item-icon><v-icon small color="cyan">mdi-book-open-variant</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ r.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ r.citation }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="searched && !results.length">
              <v-list-item-content><v-list-item-subtitle>No results found.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Research Notes List -->
        <v-card outlined>
          <v-card-title class="subtitle-1">My Notes</v-card-title>
          <v-list dense>
            <v-list-item v-for="note in notes" :key="note.id" @click="openNote(note)" style="cursor:pointer" :class="editing && editing.id===note.id ? 'cyan lighten-5' : ''">
              <v-list-item-icon><v-icon small color="cyan">mdi-note-text</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ note.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ note.tags && note.tags.join(', ') }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!notes.length">
              <v-list-item-content><v-list-item-subtitle>No notes yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Note Editor -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" style="min-height:500px">
          <div v-if="selected" class="mb-3">
            <div class="subtitle-2 mb-1">Search Result</div>
            <v-card outlined class="pa-3 cyan lighten-5">
              <div class="subtitle-2">{{ selected.title }}</div>
              <div class="caption grey--text">{{ selected.citation }}</div>
              <p class="body-2 mt-2">{{ selected.summary }}</p>
            </v-card>
            <v-btn x-small text color="cyan" class="mt-1" @click="insertToNote">Insert into Note</v-btn>
          </div>

          <template v-if="form">
            <v-text-field v-model="form.title" label="Note Title *" outlined dense class="mb-2"></v-text-field>
            <v-combobox v-model="form.tags" label="Tags" multiple outlined dense chips small-chips deletable-chips class="mb-2"></v-combobox>
            <v-textarea v-model="form.content" label="Research Notes" outlined :rows="editing ? 10 : 8" auto-grow></v-textarea>
            <div class="d-flex justify-end mt-2">
              <v-btn text class="mr-2" @click="form=null; editing=null">Cancel</v-btn>
              <v-btn color="cyan darken-1" dark :loading="saving" @click="save">Save Note</v-btn>
            </div>
          </template>
          <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-note-plus</v-icon><p class="mt-2">Click "New Note" or select one to edit</p></div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetResearchNotes, stCreateResearchNote, stUpdateResearchNote } from '@/services/staffApi';
export default {
  name: 'ResearchWorkspace',
  data() {
    return {
      notes: [], results: [], query: '', searched: false, selected: null,
      form: null, editing: null, saving: false, searchType: 'case_law',
      snack: false, snackMsg: '', snackColor: 'success',
      searchTypes: ['case_law', 'statutes', 'precedents', 'doctrine'],
      mockDb: [
        { id: 1, title: 'Ben Ali v. Société Foncière — CA Tunis 2019', citation: 'CA-TN-2019-0442', summary: 'Adverse possession claim upheld after 15 years of continuous, uncontested use. Key principle: chain of title must be uninterrupted.' },
        { id: 2, title: 'Code des Obligations et Contrats — Art. 453', citation: 'COC-453', summary: 'Prescription extinctive de 10 ans applicable aux droits réels immobiliers. Exceptions pour les titres notariaux.' },
        { id: 3, title: 'Société ABC v. Ministère des Finances — TPI 2020', citation: 'TPI-2020-1187', summary: 'Corporate dissolution procedure requires liquidation commission and 60-day creditor notice period.' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      try { this.notes = await stGetResearchNotes(1); }
      catch (e) { console.error(e); }
    },
    search() {
      this.searched = true;
      this.results = this.mockDb.filter(r =>
        r.title.toLowerCase().includes(this.query.toLowerCase()) ||
        r.summary.toLowerCase().includes(this.query.toLowerCase())
      );
    },
    selectResult(r) { this.selected = r; },
    insertToNote() {
      if (!this.form) { this.form = { title: '', content: '', tags: [], sources: [] }; this.editing = null; }
      this.form.content = (this.form.content ? this.form.content + '\n\n' : '') +
        `[${this.selected.citation}] ${this.selected.title}\n${this.selected.summary}`;
    },
    openNote(note = null) {
      this.editing = note;
      this.form = note
        ? { title: note.title, content: note.content, tags: note.tags || [] }
        : { title: '', content: '', tags: [] };
    },
    async save() {
      if (!this.form.title) { this.notify('Title required.', 'error'); return; }
      this.saving = true;
      try {
        if (this.editing) await stUpdateResearchNote(this.editing.id, this.form);
        else await stCreateResearchNote({ ...this.form, user_id: 1 });
        this.notify(this.editing ? 'Note updated.' : 'Note saved.');
        this.form = null; this.editing = null; this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
