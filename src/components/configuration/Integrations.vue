<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Integrations</h1><p class="body-2 grey--text">Manage third-party services and connected apps</p></v-col>
    </v-row>

    <v-row>
      <v-col v-for="i in integrations" :key="i.id" cols="12" md="6" lg="4">
        <v-card outlined class="pa-4 mb-3">
          <div class="d-flex align-center mb-2">
            <v-icon :color="i.enabled ? 'green' : 'grey'" class="mr-2">{{ i.icon }}</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ i.name }}</div>
            <v-spacer></v-spacer>
            <v-switch v-model="i.enabled" inset hide-details @change="toggle(i)"></v-switch>
          </div>
          <div class="caption grey--text mb-2">{{ i.description }}</div>
          <v-chip x-small :color="i.enabled ? 'green' : 'grey'" dark>{{ i.enabled ? 'Connected' : 'Disconnected' }}</v-chip>
          <v-divider class="my-3"></v-divider>
          <div class="d-flex">
            <v-btn x-small text color="primary" @click="configure(i)">Configure</v-btn>
            <v-btn x-small text color="blue">Logs</v-btn>
            <v-spacer></v-spacer>
            <v-btn x-small text color="red" @click="disconnect(i)" v-if="i.enabled">Disconnect</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>Configure {{ selected.name }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="config.apiKey" label="API Key" outlined dense :type="showSecret ? 'text' : 'password'"></v-text-field>
          <v-text-field v-model="config.endpoint" label="Endpoint URL" outlined dense class="mt-3"></v-text-field>
          <v-checkbox v-model="showSecret" label="Show API key" class="mt-1"></v-checkbox>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="saveConfig">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" color="green" timeout="1800">Integration updated.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'Integrations',
  data() {
    return {
      dialog: false,
      showSecret: false,
      snackbar: false,
      selected: null,
      config: { apiKey: '', endpoint: '' },
      integrations: [
        { id: 1, name: 'Google Calendar', icon: 'mdi-calendar', description: 'Sync hearings and meetings with Google Calendar.', enabled: true },
        { id: 2, name: 'Outlook 365', icon: 'mdi-microsoft-outlook', description: 'Connect email and calendar with Microsoft 365.', enabled: false },
        { id: 3, name: 'DocuSign', icon: 'mdi-file-sign', description: 'Enable digital signatures for contracts and notices.', enabled: true },
        { id: 4, name: 'Stripe', icon: 'mdi-credit-card', description: 'Process online invoice payments and billing.', enabled: false },
        { id: 5, name: 'OpenAI', icon: 'mdi-robot', description: 'Power AI legal insights and summarization modules.', enabled: true },
      ],
    };
  },
  methods: {
    toggle(item) { void item; this.snackbar = true; },
    configure(item) { this.selected = item; this.config = { apiKey: '', endpoint: '' }; this.dialog = true; },
    disconnect(item) { item.enabled = false; this.snackbar = true; },
    saveConfig() { this.dialog = false; this.snackbar = true; },
  },
};
</script>
