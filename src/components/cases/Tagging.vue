<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Case Tagging &amp; Filtering</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openTagDialog">
          <v-icon left>mdi-tag-plus</v-icon> New Tag
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Tag Panel -->
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3">
          <v-card-title class="pb-2">Tags</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item-group v-model="activeTag" color="primary">
              <v-list-item :value="null">
                <v-list-item-icon><v-icon>mdi-tag-multiple</v-icon></v-list-item-icon>
                <v-list-item-content><v-list-item-title>All Cases</v-list-item-title></v-list-item-content>
                <v-list-item-action><v-chip small>{{ cases.length }}</v-chip></v-list-item-action>
              </v-list-item>
              <v-list-item v-for="tag in tags" :key="tag.id" :value="tag.id">
                <v-list-item-icon>
                  <v-icon :color="tag.color">mdi-tag</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ tag.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="d-flex flex-row">
                  <v-chip x-small>{{ casesWithTag(tag.id) }}</v-chip>
                  <v-btn icon x-small @click.stop="editTag(tag)"><v-icon x-small>mdi-pencil</v-icon></v-btn>
                  <v-btn icon x-small color="red" @click.stop="removeTag(tag.id)"><v-icon x-small>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <!-- Cases Panel -->
      <v-col cols="12" md="9">
        <v-card outlined>
          <v-card-title>
            Cases
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="caseHeaders" :items="filteredCases" :search="search" class="elevation-0">
            <template v-slot:item.tags="{ item }">
              <v-chip v-for="tid in item.tagIds" :key="tid" x-small :color="getTagColor(tid)" dark class="mr-1">
                {{ getTagName(tid) }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small color="primary" @click="manageCaseTags(item)"><v-icon small>mdi-tag-edit</v-icon></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tag CRUD dialog -->
    <v-dialog v-model="tagDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ tagEditMode ? 'Edit Tag' : 'New Tag' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="tagForm.name" label="Tag Name" outlined dense></v-text-field>
          <v-select v-model="tagForm.color" :items="colorOptions" label="Color" outlined dense class="mt-3">
            <template v-slot:item="{ item }"><v-icon :color="item">mdi-circle</v-icon><span class="ml-2">{{ item }}</span></template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="tagDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTag">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Manage case tags dialog -->
    <v-dialog v-model="caseTagDialog" max-width="480px">
      <v-card v-if="editingCase">
        <v-card-title>Tags for "{{ editingCase.name }}"</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-chip-group v-model="editingCase.tagIds" multiple column active-class="primary--text">
            <v-chip v-for="tag in tags" :key="tag.id" :value="tag.id" filter outlined :color="tag.color">
              {{ tag.name }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="caseTagDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'Tagging',
  data() {
    return {
      search: '',
      activeTag: null,
      tagDialog: false,
      caseTagDialog: false,
      tagEditMode: false,
      editingCase: null,
      tagForm: { id: null, name: '', color: 'blue' },
      colorOptions: ['blue', 'green', 'red', 'orange', 'purple', 'teal', 'indigo', 'pink'],
      tags: [
        { id: 1, name: 'Urgent', color: 'red' },
        { id: 2, name: 'Corporate', color: 'blue' },
        { id: 3, name: 'Criminal', color: 'purple' },
        { id: 4, name: 'IP', color: 'teal' },
        { id: 5, name: 'Pro Bono', color: 'green' },
      ],
      cases: [
        { id: 1, name: 'Corporate Merger – ABC Ltd', client: 'ABC Ltd', lawyer: 'John Doe', tagIds: [1, 2] },
        { id: 2, name: 'Criminal Appeal – Jane Smith', client: 'Jane Smith', lawyer: 'Emily Clark', tagIds: [3] },
        { id: 3, name: 'IP Dispute – TechCorp', client: 'TechCorp', lawyer: 'Michael Lee', tagIds: [1, 4] },
        { id: 4, name: 'Divorce – M. Lambert', client: 'M. Lambert', lawyer: 'Sara Lee', tagIds: [5] },
      ],
      caseHeaders: [
        { text: 'Case Name', value: 'name' },
        { text: 'Client', value: 'client' },
        { text: 'Lawyer', value: 'lawyer' },
        { text: 'Tags', value: 'tags', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredCases() {
      if (!this.activeTag) return this.cases;
      return this.cases.filter(c => c.tagIds.includes(this.activeTag));
    },
  },
  methods: {
    casesWithTag(id) { return this.cases.filter(c => c.tagIds.includes(id)).length; },
    getTagName(id) { const t = this.tags.find(t => t.id === id); return t ? t.name : ''; },
    getTagColor(id) { const t = this.tags.find(t => t.id === id); return t ? t.color : 'grey'; },
    openTagDialog() { this.tagEditMode = false; this.tagForm = { id: null, name: '', color: 'blue' }; this.tagDialog = true; },
    editTag(tag) { this.tagEditMode = true; this.tagForm = { ...tag }; this.tagDialog = true; },
    saveTag() {
      if (this.tagEditMode) {
        const idx = this.tags.findIndex(t => t.id === this.tagForm.id);
        if (idx !== -1) this.tags.splice(idx, 1, { ...this.tagForm });
      } else {
        this.tags.push({ ...this.tagForm, id: Date.now() });
      }
      this.tagDialog = false;
    },
    removeTag(id) {
      this.tags = this.tags.filter(t => t.id !== id);
      this.cases.forEach(c => { c.tagIds = c.tagIds.filter(tid => tid !== id); });
    },
    manageCaseTags(item) { this.editingCase = item; this.caseTagDialog = true; },
  },
};
</script>
