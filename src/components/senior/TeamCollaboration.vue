<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Team Collaboration</h1><p class="body-2 grey--text">Internal discussions and case-specific threads</p></v-col>
      <v-col cols="auto"><v-btn color="indigo" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>New Thread</v-btn></v-col>
    </v-row>

    <v-row>
      <!-- Thread List -->
      <v-col cols="12" md="4">
        <v-card outlined style="min-height:500px">
          <v-card-title class="subtitle-1">Threads</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="t in threads" :key="t.id" @click="selectThread(t)" :class="selected && selected.id === t.id ? 'blue lighten-5' : ''">
              <v-list-item-icon><v-icon small>mdi-forum</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ t.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ t.case_title || 'General' }} · {{ t.message_count }} msgs</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!threads.length">
              <v-list-item-content><v-list-item-subtitle>No threads yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Messages -->
      <v-col cols="12" md="8">
        <v-card outlined style="min-height:500px" class="d-flex flex-column">
          <template v-if="selected">
            <v-card-title class="subtitle-1">{{ selected.title }}<v-spacer></v-spacer><v-chip x-small outlined>{{ selected.case_title || 'General' }}</v-chip></v-card-title>
            <v-divider></v-divider>
            <v-card-text class="flex-grow-1 overflow-y-auto" style="max-height:380px">
              <div v-for="msg in messages" :key="msg.id" class="mb-3">
                <div class="d-flex align-start">
                  <v-avatar size="30" color="indigo" class="mr-2"><span class="white--text caption">{{ initials(msg.sender_name) }}</span></v-avatar>
                  <div>
                    <div class="caption font-weight-bold">{{ msg.sender_name }} <span class="grey--text font-weight-regular">{{ new Date(msg.created_at).toLocaleTimeString() }}</span></div>
                    <div class="body-2">{{ msg.body }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!messages.length" class="text-center grey--text mt-6">No messages yet.</div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-3">
              <v-text-field v-model="newMsg" placeholder="Type a message…" outlined dense hide-details @keyup.enter="send" class="flex-grow-1 mr-2"></v-text-field>
              <v-btn color="indigo" dark :loading="sending" @click="send">Send</v-btn>
            </v-card-actions>
          </template>
          <v-card-text v-else class="text-center grey--text mt-12">Select a thread to view messages</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="createDialog" max-width="480">
      <v-card>
        <v-card-title>New Thread</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Thread Title *" outlined dense class="mb-2"></v-text-field>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="createDialog=false">Cancel</v-btn><v-btn color="indigo" dark :loading="saving" @click="createThread">Create</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { faGetThreads, faCreateThread, faGetMessages, faSendMessage } from '@/services/firmadminApi';
export default {
  name: 'TeamCollaboration',
  data() {
    return {
      threads: [], messages: [], selected: null, loading: true,
      createDialog: false, saving: false, sending: false, err: '',
      form: { title: '', created_by: 1 }, newMsg: '',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.threads = await faGetThreads(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async selectThread(t) {
      this.selected = t;
      try { this.messages = await faGetMessages(t.id); }
      catch (e) { this.messages = []; }
    },
    async createThread() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try { await faCreateThread(this.form); this.createDialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async send() {
      if (!this.newMsg.trim() || !this.selected) return;
      this.sending = true;
      try {
        const msg = await faSendMessage(this.selected.id, { sender_id: 1, body: this.newMsg });
        this.messages.push(msg);
        this.newMsg = '';
      } catch (e) { console.error(e); }
      finally { this.sending = false; }
    },
    initials(name) { return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'; },
  },
};
</script>
