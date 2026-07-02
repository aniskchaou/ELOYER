<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Client Communication</h1><p class="body-2 grey--text">Manage messages and document requests with clients</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="compose=true"><v-icon left>mdi-email-plus</v-icon>New Message</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined style="min-height:480px">
          <v-card-title class="subtitle-1">Conversations</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="msg in messages" :key="msg.id" @click="selected=msg" :class="selected && selected.id===msg.id ? 'blue lighten-5':''">
              <v-list-item-icon>
                <v-badge :content="msg.is_read ? '' : '!'" :value="!msg.is_read" color="error" overlap>
                  <v-icon small>mdi-account</v-icon>
                </v-badge>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title :class="!msg.is_read ? 'font-weight-bold':''">{{ msg.subject }}</v-list-item-title>
                <v-list-item-subtitle>{{ msg.client_name || 'Unknown' }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><span class="caption grey--text">{{ new Date(msg.created_at).toLocaleDateString() }}</span></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!messages.length">
              <v-list-item-content><v-list-item-subtitle>No messages.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined style="min-height:480px" class="pa-4">
          <template v-if="selected">
            <div class="d-flex align-center mb-3">
              <div>
                <div class="subtitle-1 font-weight-bold">{{ selected.subject }}</div>
                <div class="caption grey--text">From: {{ selected.client_name }} · {{ new Date(selected.created_at).toLocaleString() }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-chip x-small :color="selected.direction==='incoming'?'blue':'green'" dark>{{ selected.direction }}</v-chip>
            </div>
            <v-divider class="mb-3"></v-divider>
            <p class="body-2">{{ selected.body }}</p>
            <v-divider class="my-3"></v-divider>
            <v-textarea v-model="reply" label="Reply…" outlined rows="3" auto-grow></v-textarea>
            <v-btn color="blue darken-2" dark small :loading="sending" @click="send">
              <v-icon left small>mdi-send</v-icon>Send Reply
            </v-btn>
          </template>
          <div v-else class="text-center grey--text mt-12"><v-icon large>mdi-email-open</v-icon><p class="mt-2">Select a message to read</p></div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Compose Dialog -->
    <v-dialog v-model="compose" max-width="540">
      <v-card>
        <v-card-title>New Message</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="newMsg.client" :items="clients" item-text="name" item-value="id" label="To (Client)" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="newMsg.subject" label="Subject" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="newMsg.body" label="Message" outlined rows="5"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="compose=false">Cancel</v-btn><v-btn color="blue darken-2" dark :loading="sending" @click="sendNew">Send</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" color="success" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'ClientCommunication',
  data() {
    return {
      selected: null, reply: '', sending: false, compose: false, snack: false, snackMsg: '',
      newMsg: { client: null, subject: '', body: '' },
      clients: [{ id: 1, name: 'Ahmed Ben Ali' }, { id: 2, name: 'ABC SARL' }, { id: 3, name: 'Leila Mansour' }],
      messages: [
        { id: 1, subject: 'New evidence available', client_name: 'Ahmed Ben Ali', body: 'I have uploaded additional survey photos for the property dispute.', created_at: new Date(), is_read: false, direction: 'incoming' },
        { id: 2, subject: 'Invoice question', client_name: 'ABC SARL', body: 'Could you clarify the fee structure on the latest invoice?', created_at: new Date(Date.now() - 86400000), is_read: true, direction: 'incoming' },
        { id: 3, subject: 'Hearing confirmed', client_name: 'Leila Mansour', body: 'Your hearing on July 5th at Civil Court Sousse is confirmed.', created_at: new Date(Date.now() - 2*86400000), is_read: true, direction: 'outgoing' },
      ],
    };
  },
  methods: {
    send() {
      if (!this.reply.trim()) return;
      this.sending = true;
      setTimeout(() => {
        this.snackMsg = 'Reply sent.'; this.snack = true;
        this.reply = ''; this.sending = false;
      }, 700);
    },
    sendNew() {
      this.sending = true;
      setTimeout(() => {
        this.snackMsg = 'Message sent.'; this.snack = true;
        this.compose = false; this.sending = false;
      }, 700);
    },
  },
};
</script>
