<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="blue darken-2">mdi-robot</v-icon>AI Drafting</h1><p class="body-2 grey--text">Generate contracts, pleadings, letters and legal summaries using AI</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">New Draft</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="form.draft_type" :items="draftTypes" item-text="label" item-value="value" label="Document Type" outlined dense class="mb-3"></v-select>
          <v-textarea v-model="form.prompt" :label="promptLabel" outlined :rows="5" auto-grow class="mb-3" :placeholder="promptPlaceholder"></v-textarea>
          <v-btn color="blue darken-2" dark block :loading="generating" @click="generate">
            <v-icon left>mdi-auto-fix</v-icon>Generate with AI
          </v-btn>
        </v-card>

        <!-- Past Drafts -->
        <v-card outlined>
          <v-card-title class="subtitle-1">Recent Drafts</v-card-title>
          <v-list dense>
            <v-list-item v-for="d in drafts" :key="d.id" @click="loadDraft(d)" style="cursor:pointer">
              <v-list-item-icon><v-icon small :color="typeColor(d.draft_type)">mdi-file-document-edit</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ d.draft_type }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(d.created_at).toLocaleDateString() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!drafts.length">
              <v-list-item-content><v-list-item-subtitle>No drafts yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" style="min-height:480px">
          <div class="d-flex align-center mb-3">
            <v-card-title class="subtitle-1 pa-0">Generated Content</v-card-title>
            <v-spacer></v-spacer>
            <v-btn v-if="currentDraft" small text @click="copyDraft"><v-icon left small>mdi-content-copy</v-icon>Copy</v-btn>
            <v-btn v-if="currentDraft" small text color="success" @click="saveDraft"><v-icon left small>mdi-content-save</v-icon>Save</v-btn>
          </div>
          <v-divider class="mb-3"></v-divider>
          <v-skeleton-loader v-if="generating" type="paragraph, paragraph, paragraph"></v-skeleton-loader>
          <v-textarea
            v-else-if="currentDraft"
            v-model="draftContent"
            outlined
            auto-grow
            style="font-family:monospace;font-size:13px"
          ></v-textarea>
          <div v-else class="text-center grey--text mt-12">
            <v-icon large>mdi-robot-outline</v-icon>
            <p class="mt-2">Select a document type, enter your instructions, and click Generate.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetAIDrafts, faCreateAIDraft, faUpdateAIDraft } from '@/services/firmadminApi';
export default {
  name: 'AIDrafting',
  computed: {
    draftContent: {
      get() {
        if (!this.currentDraft) return '';
        return this.currentDraft.edited_content != null
          ? this.currentDraft.edited_content
          : this.currentDraft.generated_content;
      },
      set(val) {
        if (this.currentDraft) this.currentDraft.edited_content = val;
      },
    },
    promptLabel() {
      const map = { contract: 'Describe the contract', pleading: 'Describe the motion', letter: 'Describe the purpose', summary: 'Describe the case' };
      return map[this.form.draft_type] || 'Instructions';
    },
    promptPlaceholder() {
      const map = { contract: 'e.g. Service agreement for legal consulting services, monthly retainer…', pleading: 'e.g. Motion to dismiss for lack of jurisdiction in contract dispute…', letter: 'e.g. Notice of termination to opposing counsel…', summary: 'e.g. Property dispute involving chain of title and adverse possession…' };
      return map[this.form.draft_type] || '';
    },
  },
  data() {
    return {
      drafts: [], generating: false, currentDraft: null,
      form: { draft_type: 'contract', prompt: '', lawyer_id: 1, case_id: 1 },
      draftTypes: [
        { label: 'Contract / Agreement', value: 'contract' },
        { label: 'Pleading / Motion', value: 'pleading' },
        { label: 'Legal Letter', value: 'letter' },
        { label: 'Case Summary', value: 'summary' },
      ],
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      try { this.drafts = await faGetAIDrafts(1); }
      catch (e) { console.error(e); }
    },
    async generate() {
      if (!this.form.prompt) { this.notify('Enter instructions first.', 'error'); return; }
      this.generating = true; this.currentDraft = null;
      try {
        const result = await faCreateAIDraft(this.form);
        this.currentDraft = result;
        this.drafts.unshift(result);
        this.notify('Draft generated.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.generating = false; }
    },
    loadDraft(d) { this.currentDraft = d; },
    async saveDraft() {
      if (!this.currentDraft) return;
      try {
        await faUpdateAIDraft(this.currentDraft.id, { edited_content: this.currentDraft.edited_content || this.currentDraft.generated_content, status: 'saved' });
        this.notify('Draft saved.');
      } catch (e) { this.notify(e.message, 'error'); }
    },
    copyDraft() {
      navigator.clipboard.writeText(this.draftContent);
      this.notify('Copied to clipboard.');
    },
    typeColor(t) { const m = { contract: 'blue', pleading: 'purple', letter: 'teal', summary: 'orange' }; return m[t] || 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
