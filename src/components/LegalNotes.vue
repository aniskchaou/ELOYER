<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Legal Notes</h1>

    <!-- Add Note Button -->
    <v-btn color="primary" class="mb-4" @click="dialog = true">
      <v-icon left>mdi-plus</v-icon> New Note
    </v-btn>

    <!-- Search Notes -->
    <v-text-field
      v-model="search"
      label="Search Notes..."
      prepend-inner-icon="mdi-magnify"
      class="mb-6"
    ></v-text-field>

    <!-- Notes List -->
    <v-row>
      <v-col cols="12" md="4" v-for="note in filteredNotes" :key="note.id">
        <v-card outlined class="pa-4 hover:shadow-lg transition">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold">{{ note.title }}</h2>
            <v-chip small :color="note.pinned ? 'yellow' : 'grey'" @click="togglePin(note)">
              <v-icon small>mdi-pin</v-icon>
            </v-chip>
          </div>
          <p class="text-sm text-gray-600">{{ note.content }}</p>
          <div class="mt-3 flex justify-between">
            <v-chip small v-for="tag in note.tags" :key="tag" color="blue" class="mr-1">
              {{ tag }}
            </v-chip>
          </div>
          <div class="mt-3 flex justify-end space-x-2">
            <v-btn icon color="primary" @click="editNote(note)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteNote(note.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Note Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-xl font-bold">{{ editMode ? 'Edit Note' : 'New Note' }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="currentNote.title" label="Title"></v-text-field>
          <v-textarea v-model="currentNote.content" label="Content" rows="5"></v-textarea>
          <v-combobox v-model="currentNote.tags" label="Tags" multiple chips clearable></v-combobox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveNote">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: "LegalNotes",
  data() {
    return {
      dialog: false,
      editMode: false,
      search: "",
      notes: [
        { id: 1, title: "Contract Review", content: "Check clause 7(b) regarding arbitration.", tags: ["Contract", "Review"], pinned: true },
        { id: 2, title: "Court Hearing Prep", content: "Prepare witness statements for tomorrow.", tags: ["Court", "Hearing"], pinned: false },
        { id: 3, title: "Client Research", content: "Look into prior judgments on IP disputes.", tags: ["Research", "IP"], pinned: false },
      ],
      currentNote: { id: null, title: "", content: "", tags: [], pinned: false }
    };
  },
  computed: {
    filteredNotes() {
      return this.notes.filter(n =>
        n.title.toLowerCase().includes(this.search.toLowerCase()) ||
        n.content.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  methods: {
    togglePin(note) {
      note.pinned = !note.pinned;
    },
    editNote(note) {
      this.currentNote = { ...note };
      this.editMode = true;
      this.dialog = true;
    },
    saveNote() {
      if (this.editMode) {
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) this.notes[index] = { ...this.currentNote };
      } else {
        this.notes.push({ ...this.currentNote, id: Date.now() });
      }
      this.resetForm();
    },
    deleteNote(id) {
      this.notes = this.notes.filter(n => n.id !== id);
    },
    resetForm() {
      this.currentNote = { id: null, title: "", content: "", tags: [], pinned: false };
      this.editMode = false;
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
