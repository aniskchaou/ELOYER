<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Feature Flags</h1>
        <p class="body-2 grey--text">Toggle platform-wide features and capabilities</p>
      </v-col>
      <v-col cols="auto">
        <v-select v-model="categoryFilter" :items="['All', ...categories]" label="Category" outlined dense hide-details style="min-width:160px"></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="flag in filteredFlags" :key="flag.flag_key" cols="12" md="6">
        <v-card outlined class="pa-3">
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="subtitle-2">{{ flag.label }}</div>
              <div class="caption grey--text">{{ flag.description }}</div>
              <v-chip x-small class="mt-1" :color="categoryColor(flag.category)">{{ flag.category }}</v-chip>
            </div>
            <v-switch
              v-model="flag.default_enabled"
              inset
              :color="flag.default_enabled ? 'deep-purple darken-3' : 'grey'"
              hide-details
              class="mt-0"
              :loading="saving[flag.flag_key]"
              @change="toggle(flag)"
            ></v-switch>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay :value="loading"><v-progress-circular indeterminate color="deep-purple"></v-progress-circular></v-overlay>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetFeatureFlags, saUpdateFeatureFlag } from '@/services/superadminApi';
export default {
  name: 'FeatureFlags',
  data() {
    return {
      flags: [], loading: true, saving: {}, categoryFilter: 'All',
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  computed: {
    categories() { return [...new Set(this.flags.map(f => f.category))].sort(); },
    filteredFlags() {
      if (this.categoryFilter === 'All') return this.flags;
      return this.flags.filter(f => f.category === this.categoryFilter);
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.flags = await saGetFeatureFlags(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async toggle(flag) {
      this.$set(this.saving, flag.flag_key, true);
      try {
        await saUpdateFeatureFlag(flag.flag_key, { default_enabled: flag.default_enabled });
        this.notify(`"${flag.label}" ${flag.default_enabled ? 'enabled' : 'disabled'}.`);
      } catch (e) {
        flag.default_enabled = !flag.default_enabled;
        this.notify(e.message, 'error');
      } finally {
        this.$set(this.saving, flag.flag_key, false);
      }
    },
    categoryColor(c) {
      const m = { ai: 'purple', billing: 'green', documents: 'blue', platform: 'deep-orange', security: 'red', compliance: 'teal', reports: 'indigo' };
      return m[c] || 'grey';
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
