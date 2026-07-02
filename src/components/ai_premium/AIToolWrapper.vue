<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">
          <v-icon left :color="color || 'purple darken-2'">{{ icon || 'mdi-robot' }}</v-icon>
          {{ title }}
        </h1>
        <p class="body-2 grey--text">{{ subtitle }}</p>
      </v-col>
      <v-col cols="auto">
        <v-chip :color="color || 'purple darken-2'" dark small>
          <v-icon left x-small>mdi-star</v-icon>Premium AI
        </v-chip>
      </v-col>
    </v-row>

    <!-- Input Panel -->
    <v-row>
      <v-col :cols="result ? 6 : 12" :md="result ? 5 : 8" class="mx-auto">
        <v-card outlined class="pa-4">
          <slot name="input"></slot>
          <v-btn :color="color || 'purple darken-2'" dark block :loading="loading" @click="$emit('run')" class="mt-3">
            <v-icon left>mdi-auto-fix</v-icon>{{ buttonLabel || 'Generate with AI' }}
          </v-btn>
          <v-alert v-if="error" type="error" dense class="mt-3">{{ error }}</v-alert>
        </v-card>
      </v-col>

      <!-- Result Panel -->
      <v-col cols="12" md="7" v-if="result || loading">
        <v-card outlined class="pa-4" style="min-height:300px">
          <div class="d-flex align-center mb-3">
            <span class="subtitle-2">AI Output</span>
            <v-spacer></v-spacer>
            <v-chip x-small color="grey" outlined v-if="tokens">{{ tokens }} tokens</v-chip>
            <v-btn icon small class="ml-2" @click="copy" title="Copy" v-if="result"><v-icon small>mdi-content-copy</v-icon></v-btn>
            <v-btn icon small class="ml-1" @click="$emit('clear')" title="Clear" v-if="result"><v-icon small>mdi-refresh</v-icon></v-btn>
          </div>
          <v-divider class="mb-3"></v-divider>
          <v-skeleton-loader v-if="loading" type="paragraph, paragraph, paragraph"></v-skeleton-loader>
          <slot name="result" v-else></slot>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="copied" top color="success" :timeout="1800">Copied to clipboard.</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'AIToolWrapper',
  props: {
    title: String, subtitle: String, icon: String, color: String,
    buttonLabel: String, loading: Boolean, result: String,
    error: String, tokens: Number,
  },
  data() { return { copied: false }; },
  methods: {
    copy() {
      if (this.result) { navigator.clipboard.writeText(this.result); this.copied = true; }
    },
  },
};
</script>
