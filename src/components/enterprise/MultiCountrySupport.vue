<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Multi-Country Support</h1><p class="body-2 grey--text">Manage legal practice across multiple jurisdictions</p></v-col></v-row>
    <v-row>
      <v-col v-for="country in countries" :key="country.code" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <div class="text-h4 mr-3">{{ country.flag }}</div>
            <div><div class="subtitle-2 font-weight-bold">{{ country.name }}</div><div class="caption grey--text">{{ country.legal_system }}</div></div>
            <v-spacer></v-spacer>
            <v-chip small :color="country.active ? 'success' : 'orange'" dark>{{ country.active ? 'Active' : 'Configure' }}</v-chip>
          </div>
          <v-divider class="my-2"></v-divider>
          <v-list dense>
            <v-list-item v-for="f in country.features" :key="f"><v-list-item-icon><v-icon x-small color="success">mdi-check</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title class="caption">{{ f }}</v-list-item-title></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Multi-Country Features</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col cols="12" md="4" v-for="f in multiFeatures" :key="f.label">
          <v-list-item><v-list-item-icon><v-icon color="indigo" small>{{ f.icon }}</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>{{ f.label }}</v-list-item-title><v-list-item-subtitle>{{ f.desc }}</v-list-item-subtitle></v-list-item-content></v-list-item>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script>
export default {
  name: 'MultiCountrySupport',
  data() {
    return {
      countries: [
        { code: 'TN', name: 'Tunisia', flag: '🇹🇳', legal_system: 'Civil Law (French-based)', active: true, features: ['Arabic & French UI', 'TND currency', 'Tunisian court integration', 'COC / Code du Travail', 'GDPR-aligned data protection'] },
        { code: 'MA', name: 'Morocco', flag: '🇲🇦', legal_system: 'Civil Law (French-based)', active: false, features: ['Arabic & French UI', 'MAD currency', 'Moroccan court procedures', 'Code des Obligations et Contrats'] },
        { code: 'DZ', name: 'Algeria', flag: '🇩🇿', legal_system: 'Civil Law (French-based)', active: false, features: ['Arabic & French UI', 'DZD currency', 'Algerian legal code support'] },
        { code: 'FR', name: 'France', flag: '🇫🇷', legal_system: 'Civil Law', active: false, features: ['French UI', 'EUR currency', 'GDPR compliance', 'French court system'] },
      ],
      multiFeatures: [
        { label: 'Multi-Currency', desc: 'TND, EUR, USD, MAD and more', icon: 'mdi-currency-usd' },
        { label: 'Multi-Language', desc: 'Arabic, French, English interface', icon: 'mdi-translate' },
        { label: 'Jurisdiction Rules', desc: 'Per-country legal procedures', icon: 'mdi-scale-balance' },
        { label: 'Tax Compliance', desc: 'Per-country tax rules and rates', icon: 'mdi-percent' },
        { label: 'Time Zones', desc: 'Automatic timezone handling', icon: 'mdi-clock-outline' },
        { label: 'Data Residency', desc: 'Data stored in chosen region', icon: 'mdi-database-check' },
      ],
    };
  },
};
</script>
