<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">SSO Configuration</h1><p class="body-2 grey--text">Configure Single Sign-On via SAML 2.0 or OAuth</p></v-col>
      <v-col cols="auto"><v-btn :color="sso.is_active ? 'error' : 'success'" dark :loading="toggling" @click="toggleSSO">{{ sso.is_active ? 'Disable SSO' : 'Enable SSO' }}</v-btn></v-col>
    </v-row>
    <v-alert :type="sso.is_active ? 'success' : 'info'" outlined class="mb-4">
      SSO is currently <strong>{{ sso.is_active ? 'ENABLED' : 'DISABLED' }}</strong>.
      {{ sso.is_active ? 'Users will be redirected to your identity provider.' : 'Configure and test before enabling.' }}
    </v-alert>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">SAML 2.0 Configuration</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="form.provider" :items="['saml','oauth2','oidc']" label="Protocol" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="form.entity_id" label="Entity ID / Issuer" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.sso_url" label="SSO Login URL" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="form.certificate" label="X.509 Certificate" outlined rows="4" class="mb-2" placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"></v-textarea>
          <v-btn color="indigo darken-2" dark block :loading="saving" @click="save"><v-icon left>mdi-content-save</v-icon>Save Configuration</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Service Provider Details</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item><v-list-item-content><v-list-item-title>SP Entity ID</v-list-item-title><v-list-item-subtitle>https://app.eloyer.io/auth/saml/metadata</v-list-item-subtitle></v-list-item-content></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>ACS URL</v-list-item-title><v-list-item-subtitle>https://app.eloyer.io/auth/saml/callback</v-list-item-subtitle></v-list-item-content></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Name ID Format</v-list-item-title><v-list-item-subtitle>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
          <v-divider class="my-3"></v-divider>
          <div class="caption grey--text mb-2">Attribute Mapping</div>
          <v-list dense>
            <v-list-item><v-list-item-content><v-list-item-title>Email</v-list-item-title></v-list-item-content><v-list-item-action><v-text-field value="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" outlined x-small dense hide-details style="max-width:280px"></v-text-field></v-list-item-action></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetSSO, entSaveSSO, entToggleSSO } from '@/services/enterpriseApi';
export default {
  name: 'SSOConfiguration',
  data() {
    return {
      sso: { is_active: false }, form: { provider: 'saml', entity_id: '', sso_url: '', certificate: '' },
      loading: true, saving: false, toggling: false, snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        this.sso = await entGetSSO();
        if (this.sso.entity_id) this.form = { provider: this.sso.provider, entity_id: this.sso.entity_id, sso_url: this.sso.sso_url, certificate: this.sso.certificate || '' };
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async save() {
      this.saving = true;
      try { this.sso = await entSaveSSO(this.form); this.notify('SSO configuration saved.'); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    async toggleSSO() {
      this.toggling = true;
      try { const r = await entToggleSSO(); this.sso.is_active = r.is_active; this.notify(`SSO ${r.is_active ? 'enabled' : 'disabled'}.`); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.toggling = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
