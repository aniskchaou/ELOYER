<template>
  <v-navigation-drawer app permanent elevation="4" width="330">
    <v-list>
      <v-list-item class="py-3">
        <img src="@/assets/img/brand/logo.png" alt="Logo" style="max-height:60px; width:auto; margin-right:12px;" />
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">Eloyer</v-list-item-title>
          <v-list-item-subtitle>Legal Operations</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-select
          v-model="currentRole"
          :items="roleOptions"
          item-text="label"
          item-value="value"
          label="Current Role"
          outlined
          dense
          hide-details
          :loading="loadingNavigation"
          :disabled="loadingNavigation || !roleOptions.length"
        ></v-select>
      </v-list-item>

      <v-alert
        v-if="navigationError"
        class="mx-3 mt-2"
        dense
        outlined
        type="error"
      >
        {{ navigationError }}
      </v-alert>

      <v-list-item class="mt-2 mb-2" v-if="currentRoleMeta">
        <v-list-item-avatar :color="currentRoleMeta.color" size="34">
          <v-icon small dark>{{ currentRoleMeta.icon }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2">{{ currentRoleMeta.label }}</v-list-item-title>
          <v-list-item-subtitle>Role-based navigation active</v-list-item-subtitle>
        </v-list-item-content>
        <v-chip x-small dark :color="currentRoleMeta.color">{{ currentRoleMeta.label }}</v-chip>
      </v-list-item>

      <v-divider class="mb-2"></v-divider>

      <v-skeleton-loader
        v-if="loadingNavigation"
        class="mx-3"
        type="list-item-two-line, list-item-two-line, list-item-two-line"
      ></v-skeleton-loader>

      <v-list-group
        v-else
        v-for="section in visibleSections"
        :key="section.key"
        :prepend-icon="section.icon"
        :value="false"
      >
        <template v-slot:activator>
          <v-list-item-title>{{ section.title }}</v-list-item-title>
        </template>
        <v-list-item v-for="item in section.items" :key="item.path" link :to="{ path: item.path }">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <v-divider class="mt-2"></v-divider>
      <v-list-item>
        <v-list-item-title>Dark Mode</v-list-item-title>
        <v-switch v-model="localDark"></v-switch>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { getNavigationData } from '@/services/lawyerApi';

export default {
  name: 'Navigation',
  props: {
    isDarkMode: Boolean,
  },
  data() {
    return {
      currentRole: null,
      roleOptions: [],
      roleAccessMap: {},
      sections: [],
      loadingNavigation: false,
      navigationError: '',
    };
  },
  created() {
    this.loadNavigation();
  },
  computed: {
    localDark: {
      get() {
        return this.$vuetify ? this.$vuetify.theme.dark : false;
      },
      set(val) {
        this.toggleDarkMode(val);
      },
    },
    currentRoleMeta() {
      return this.roleOptions.find(r => r.value === this.currentRole) || null;
    },
    visibleSections() {
      const allowed = this.roleAccessMap[this.currentRole] || [];
      return this.sections.filter(section => allowed.includes(section.key));
    },
  },
  methods: {
    async loadNavigation() {
      this.loadingNavigation = true;
      this.navigationError = '';
      try {
        const payload = await getNavigationData();
        const data = payload && typeof payload === 'object' ? payload : {};
        this.roleOptions = Array.isArray(data.roles) ? data.roles : [];
        this.sections = Array.isArray(data.sections) ? data.sections : [];
        this.roleAccessMap = data.roleAccessMap && typeof data.roleAccessMap === 'object'
          ? data.roleAccessMap
          : {};

        if (!this.currentRole && this.roleOptions.length) {
          this.currentRole = this.roleOptions[0].value;
        }
      } catch (error) {
        this.navigationError = error.message || 'Failed to load navigation.';
      } finally {
        this.loadingNavigation = false;
      }
    },
    toggleDarkMode(val) {
      this.$emit('toggle-dark-mode', val);
      if (this.$vuetify) {
        this.$vuetify.theme.dark = !!val;
      }
      localStorage.setItem('eloyer-dark-mode', val ? 'true' : 'false');
    },
  },
};
</script>

<style scoped>
.v-list-item-title,
.v-list-item-icon {
  text-decoration: none !important;
}
</style>