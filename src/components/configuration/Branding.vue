<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Branding</h1><p class="body-2 grey--text">Customize your firm's visual identity</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">Firm Identity</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="branding.firmName" label="Firm Name" outlined dense></v-text-field>
          <v-text-field v-model="branding.tagline" label="Tagline" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="branding.website" label="Website" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="branding.email" label="Public Contact Email" outlined dense class="mt-3"></v-text-field>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1">Color Theme</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="branding.primaryColor" label="Primary Color" outlined dense prepend-icon="mdi-palette" class="mb-2"></v-text-field>
          <v-text-field v-model="branding.secondaryColor" label="Secondary Color" outlined dense prepend-icon="mdi-palette-outline" class="mb-2"></v-text-field>
          <v-text-field v-model="branding.accentColor" label="Accent Color" outlined dense prepend-icon="mdi-brightness-5"></v-text-field>

          <div class="mt-4 d-flex align-center">
            <div class="mr-2 caption">Preview:</div>
            <div class="swatch mr-2" :style="{ background: branding.primaryColor }"></div>
            <div class="swatch mr-2" :style="{ background: branding.secondaryColor }"></div>
            <div class="swatch" :style="{ background: branding.accentColor }"></div>
          </div>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Logo</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-file-input v-model="logo" label="Upload Logo" outlined dense accept="image/*"></v-file-input>
          <div class="caption grey--text mt-2">Recommended: PNG/SVG, min 256x256</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-right">
        <v-btn color="primary" @click="save"><v-icon left>mdi-content-save</v-icon> Save Branding</v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="2000">Branding settings saved.</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'Branding',
  data() {
    return {
      logo: null,
      snackbar: false,
      branding: {
        firmName: 'Eloyer Legal Group',
        tagline: 'Precision. Integrity. Results.',
        website: 'https://eloyer.tn',
        email: 'contact@eloyer.tn',
        primaryColor: '#1F4E79',
        secondaryColor: '#16324F',
        accentColor: '#D6A756',
      },
    };
  },
  methods: {
    save() { this.snackbar = true; },
  },
};
</script>

<style scoped>
.swatch {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
