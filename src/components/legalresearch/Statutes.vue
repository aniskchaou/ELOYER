<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Statute Library</h1><p class="body-2 grey--text">Browse laws, codes, and regulations with article-level annotations</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search statutes..." outlined dense class="mb-3"></v-text-field>
        <v-select v-model="filterArea" :items="areas" label="Practice Area" outlined dense clearable class="mb-3"></v-select>
        <v-list dense outlined rounded>
          <v-list-item-group v-model="selectedId" color="primary">
            <v-list-item v-for="s in filteredStatutes" :key="s.id" :value="s.id" @click="select(s)">
              <v-list-item-icon><v-icon small color="blue">mdi-book-open-variant</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="caption font-weight-bold">{{ s.title }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ s.area }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col cols="12" md="8">
        <div v-if="!selectedStatute" class="text-center grey--text py-16">
          <v-icon large>mdi-book-open-page-variant</v-icon><br><span class="caption">Select a statute from the list</span>
        </div>
        <v-card outlined v-else>
          <v-card-title class="subtitle-1">{{ selectedStatute.title }} <v-spacer></v-spacer>
            <v-chip small color="blue" dark>{{ selectedStatute.area }}</v-chip>
          </v-card-title>
          <v-card-subtitle>{{ selectedStatute.code }} · Last updated: {{ selectedStatute.updated }}</v-card-subtitle>
          <v-divider></v-divider>
          <v-card-text>
            <div class="caption grey--text mb-3">{{ selectedStatute.description }}</div>
            <v-expansion-panels accordion>
              <v-expansion-panel v-for="art in selectedStatute.articles" :key="art.num">
                <v-expansion-panel-header class="caption font-weight-bold">Art. {{ art.num }} – {{ art.title }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <p class="caption">{{ art.content }}</p>
                  <div v-if="art.note" class="mt-2 pa-2 amber lighten-5 rounded">
                    <v-icon x-small color="amber darken-2">mdi-note-text</v-icon>
                    <span class="caption ml-1">{{ art.note }}</span>
                  </div>
                  <v-btn x-small text color="primary" class="mt-2" @click="addNote(art)">
                    <v-icon x-small left>mdi-pencil</v-icon> Add Note
                  </v-btn>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="noteDialog" max-width="440px">
      <v-card v-if="noteTarget">
        <v-card-title class="subtitle-2">Add Note – Art. {{ noteTarget.num }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4"><v-textarea v-model="noteText" label="Your annotation" outlined rows="4"></v-textarea></v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="noteDialog=false">Cancel</v-btn><v-btn color="primary" @click="saveNote">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Statutes',
  data() {
    return {
      search: '', filterArea: null, selectedId: null, selectedStatute: null, noteDialog: false, noteTarget: null, noteText: '',
      areas: ['Civil Law', 'Criminal Law', 'Commercial Law', 'Administrative Law', 'Labor Law'],
      statutes: [
        {
          id: 1, title: 'Code of Obligations and Contracts', code: 'COC-1906', area: 'Civil Law', updated: '2023-01-15',
          description: 'Governs contracts, obligations, and civil liability in Tunisian law.',
          articles: [
            { num: 73, title: 'Formation of Contract', content: 'A contract is formed by the meeting of minds between two parties capable of contracting...', note: 'Applicable to all client contracts – verify capacity clause.' },
            { num: 95, title: 'Breach of Obligation', content: 'Failure to perform a contractual obligation entitles the creditor to claim damages...', note: '' },
          ],
        },
        {
          id: 2, title: 'Criminal Procedure Code', code: 'CPC-1968', area: 'Criminal Law', updated: '2024-06-01',
          description: 'Procedures governing investigation, prosecution, and trial in criminal matters.',
          articles: [
            { num: 14, title: 'Right to Defense', content: 'Every accused has the right to legal representation at all stages of the procedure...', note: 'Ensure compliance in all criminal defense cases.' },
            { num: 47, title: 'Detention Limits', content: 'Pre-trial detention may not exceed 6 months without judicial review...', note: '' },
          ],
        },
      ],
    };
  },
  computed: {
    filteredStatutes() {
      return this.statutes.filter(s =>
        (!this.filterArea || s.area === this.filterArea) &&
        (!this.search || s.title.toLowerCase().includes(this.search.toLowerCase()))
      );
    },
  },
  methods: {
    select(s) { this.selectedStatute = s; },
    addNote(art) { this.noteTarget = art; this.noteText = art.note || ''; this.noteDialog = true; },
    saveNote() { this.noteTarget.note = this.noteText; this.noteDialog = false; },
  },
};
</script>
