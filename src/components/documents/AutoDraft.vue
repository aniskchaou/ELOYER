<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Automated Contract Drafting</h1>
        <p class="body-2 grey--text">Generate legal documents from templates in seconds</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Left: Template selector -->
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3">
          <v-card-title class="pb-2 body-1 font-weight-bold">Templates</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item-group v-model="selectedTemplate" color="primary">
              <v-list-item v-for="t in templates" :key="t.id" :value="t.id" @click="loadTemplate(t)">
                <v-list-item-icon><v-icon small :color="t.color">{{ t.icon }}</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="caption">{{ t.name }}</v-list-item-title>
                  <v-list-item-subtitle class="caption">{{ t.category }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <!-- Right: Draft form -->
      <v-col cols="12" md="9">
        <v-card outlined class="pa-4">
          <v-card-title class="pb-2">
            <v-icon left color="primary">mdi-file-document-edit</v-icon>
            {{ activeTemplate ? activeTemplate.name : 'Select a template to begin' }}
          </v-card-title>
          <v-divider class="mb-4"></v-divider>

          <template v-if="activeTemplate">
            <v-row>
              <v-col v-for="field in activeTemplate.fields" :key="field.key" cols="12" md="6">
                <v-text-field v-if="field.type === 'text'" v-model="formData[field.key]"
                  :label="field.label" outlined dense></v-text-field>
                <v-select v-else-if="field.type === 'select'" v-model="formData[field.key]"
                  :items="field.options" :label="field.label" outlined dense></v-select>
                <v-menu v-else-if="field.type === 'date'" v-model="field._menu" :close-on-content-click="false"
                  transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formData[field.key]" :label="field.label" readonly outlined dense
                      v-bind="attrs" v-on="on" prepend-inner-icon="mdi-calendar"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData[field.key]" @input="field._menu = false"></v-date-picker>
                </v-menu>
                <v-textarea v-else-if="field.type === 'textarea'" v-model="formData[field.key]"
                  :label="field.label" outlined rows="3" dense></v-textarea>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- Preview -->
            <v-expansion-panels flat>
              <v-expansion-panel>
                <v-expansion-panel-header class="font-weight-medium">Preview Document</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-sheet outlined class="pa-4" style="font-family:serif;line-height:1.8;white-space:pre-wrap;">
{{ previewText }}
                  </v-sheet>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-row class="mt-4">
              <v-col cols="auto">
                <v-btn color="primary" @click="generateDoc">
                  <v-icon left>mdi-file-download</v-icon> Generate &amp; Download
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn outlined @click="clearForm">
                  <v-icon left>mdi-refresh</v-icon> Clear
                </v-btn>
              </v-col>
            </v-row>
          </template>

          <v-card v-else flat class="text-center pa-12">
            <v-icon size="64" color="grey lighten-2">mdi-file-document-edit-outline</v-icon>
            <p class="mt-4 grey--text">Choose a template from the left panel to start drafting.</p>
          </v-card>
        </v-card>
      </v-col>
    </v-row>

    <!-- Saved Drafts -->
    <v-card outlined class="mt-5">
      <v-card-title><v-icon left>mdi-content-save</v-icon> Saved Drafts</v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="draftHeaders" :items="savedDrafts" class="elevation-0">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Final' ? 'green' : 'orange'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="reopen(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteDraft(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AutoDraft',
  data() {
    return {
      selectedTemplate: null,
      activeTemplate: null,
      formData: {},
      templates: [
        {
          id: 1, name: 'Non-Disclosure Agreement', category: 'Corporate', color: 'blue', icon: 'mdi-file-lock',
          fields: [
            { key: 'party1', label: 'Disclosing Party', type: 'text' },
            { key: 'party2', label: 'Receiving Party', type: 'text' },
            { key: 'purpose', label: 'Purpose of Disclosure', type: 'text' },
            { key: 'duration', label: 'Duration (years)', type: 'text' },
            { key: 'date', label: 'Effective Date', type: 'date', _menu: false },
            { key: 'jurisdiction', label: 'Governing Law / Jurisdiction', type: 'text' },
          ],
          preview: (d) => `NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into as of ${d.date || '[DATE]'} between ${d.party1 || '[PARTY 1]'} ("Disclosing Party") and ${d.party2 || '[PARTY 2]'} ("Receiving Party").\n\nPurpose: ${d.purpose || '[PURPOSE]'}\nDuration: ${d.duration || '2'} years\nGoverning Law: ${d.jurisdiction || '[JURISDICTION]'}\n\nThe Receiving Party agrees to hold in confidence all Confidential Information disclosed by the Disclosing Party.`,
        },
        {
          id: 2, name: 'Service Agreement', category: 'Corporate', color: 'green', icon: 'mdi-handshake',
          fields: [
            { key: 'client', label: 'Client Name', type: 'text' },
            { key: 'provider', label: 'Service Provider', type: 'text' },
            { key: 'services', label: 'Services Description', type: 'textarea' },
            { key: 'fee', label: 'Fee Amount', type: 'text' },
            { key: 'startDate', label: 'Start Date', type: 'date', _menu: false },
            { key: 'endDate', label: 'End Date', type: 'date', _menu: false },
          ],
          preview: (d) => `SERVICE AGREEMENT\n\nThis Agreement is between ${d.client || '[CLIENT]'} and ${d.provider || '[PROVIDER]'}.\n\nServices: ${d.services || '[SERVICES]'}\nFee: ${d.fee || '[FEE]'}\nTerm: ${d.startDate || '[START]'} to ${d.endDate || '[END]'}`,
        },
        {
          id: 3, name: 'Power of Attorney', category: 'Personal', color: 'purple', icon: 'mdi-account-key',
          fields: [
            { key: 'principal', label: 'Principal (Grantor)', type: 'text' },
            { key: 'attorney', label: 'Attorney-in-Fact', type: 'text' },
            { key: 'scope', label: 'Scope of Authority', type: 'select', options: ['General', 'Limited', 'Durable', 'Springing'] },
            { key: 'date', label: 'Effective Date', type: 'date', _menu: false },
          ],
          preview: (d) => `POWER OF ATTORNEY\n\nI, ${d.principal || '[PRINCIPAL]'}, hereby appoint ${d.attorney || '[ATTORNEY]'} as my attorney-in-fact.\n\nScope: ${d.scope || '[SCOPE]'}\nEffective Date: ${d.date || '[DATE]'}`,
        },
      ],
      savedDrafts: [
        { id: 1, name: 'NDA – TechCorp', template: 'Non-Disclosure Agreement', date: '2025-09-01', status: 'Final' },
        { id: 2, name: 'Service Agreement – ABC Ltd', template: 'Service Agreement', date: '2025-09-10', status: 'Draft' },
      ],
      draftHeaders: [
        { text: 'Document Name', value: 'name' },
        { text: 'Template', value: 'template' },
        { text: 'Date', value: 'date' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    previewText() {
      if (!this.activeTemplate) return '';
      return this.activeTemplate.preview(this.formData);
    },
  },
  methods: {
    loadTemplate(t) {
      this.activeTemplate = t;
      this.formData = {};
    },
    clearForm() { this.formData = {}; },
    generateDoc() {
      const name = prompt('Save draft as:', this.activeTemplate.name + ' – Draft');
      if (name) {
        this.savedDrafts.push({ id: Date.now(), name, template: this.activeTemplate.name, date: new Date().toISOString().split('T')[0], status: 'Draft' });
      }
    },
    reopen(item) { console.log('reopen', item.name); },
    download(item) { console.log('download', item.name); },
    deleteDraft(id) { this.savedDrafts = this.savedDrafts.filter(d => d.id !== id); },
  },
};
</script>
