<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Document Comparison</h1>
        <p class="body-2 grey--text">Compare two versions of a document side by side</p>
      </v-col>
    </v-row>

    <!-- Document selectors -->
    <v-card outlined class="mb-4 pa-4">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-select v-model="docA" :items="documents" item-text="name" item-value="id"
            label="Document A (Original)" outlined dense return-object></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="docB" :items="documents" item-text="name" item-value="id"
            label="Document B (Revised)" outlined dense return-object></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" block :disabled="!docA || !docB" @click="compare">
            <v-icon left>mdi-compare</v-icon> Compare
          </v-btn>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn outlined block @click="clear"><v-icon left>mdi-refresh</v-icon> Clear</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Stats bar -->
    <v-row v-if="compared" class="mb-4">
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="overline">Added Lines</div>
          <p class="text-h5 green--text font-weight-bold">{{ stats.added }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="overline">Removed Lines</div>
          <p class="text-h5 red--text font-weight-bold">{{ stats.removed }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="overline">Modified Lines</div>
          <p class="text-h5 orange--text font-weight-bold">{{ stats.modified }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="overline">Similarity</div>
          <p class="text-h5 blue--text font-weight-bold">{{ stats.similarity }}%</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Side-by-side diff -->
    <v-card v-if="compared" outlined>
      <v-card-title class="pb-2">
        Comparison Result
        <v-spacer></v-spacer>
        <v-chip-group v-model="showFilter" mandatory>
          <v-chip value="all" filter>All</v-chip>
          <v-chip value="added" filter color="green" dark>Added</v-chip>
          <v-chip value="removed" filter color="red" dark>Removed</v-chip>
          <v-chip value="modified" filter color="orange" dark>Modified</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-divider></v-divider>
      <v-row no-gutters>
        <v-col cols="6" class="border-right">
          <div class="pa-2 overline grey--text text-center">{{ docA.name }} (Original)</div>
          <v-divider></v-divider>
          <div class="pa-3" style="font-family:monospace;font-size:13px;">
            <div v-for="(line, i) in visibleLeft" :key="i"
              :class="lineClass(line.type)"
              style="padding:2px 8px;margin:1px 0;border-radius:3px;"
            >{{ line.num }}. {{ line.text }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="pa-2 overline grey--text text-center">{{ docB.name }} (Revised)</div>
          <v-divider></v-divider>
          <div class="pa-3" style="font-family:monospace;font-size:13px;">
            <div v-for="(line, i) in visibleRight" :key="i"
              :class="lineClass(line.type)"
              style="padding:2px 8px;margin:1px 0;border-radius:3px;"
            >{{ line.num }}. {{ line.text }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-else outlined class="pa-12 text-center">
      <v-icon size="64" color="grey lighten-2">mdi-compare</v-icon>
      <p class="mt-4 grey--text">Select two documents and click Compare to view differences.</p>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Comparison',
  data() {
    return {
      docA: null,
      docB: null,
      compared: false,
      showFilter: 'all',
      stats: { added: 0, removed: 0, modified: 0, similarity: 0 },
      leftLines: [],
      rightLines: [],
      documents: [
        { id: 1, name: 'Service Agreement v1.0', content: [
          'This Service Agreement is entered into by and between the parties.',
          'Services shall be delivered within 30 days.',
          'Payment is due upon receipt of invoice.',
          'Either party may terminate with 30 days notice.',
          'Governing law: France.',
        ]},
        { id: 2, name: 'Service Agreement v2.0', content: [
          'This Service Agreement is entered into by and between the parties.',
          'Services shall be delivered within 14 days.',
          'Payment is due within 30 days of invoice.',
          'Either party may terminate with 60 days notice.',
          'All disputes shall be resolved by arbitration.',
          'Governing law: France.',
        ]},
        { id: 3, name: 'NDA Draft A', content: [
          'This Non-Disclosure Agreement is made on January 1, 2025.',
          'The receiving party shall not disclose confidential information.',
          'Obligation lasts for 2 years after termination.',
        ]},
        { id: 4, name: 'NDA Draft B', content: [
          'This Non-Disclosure Agreement is made on March 15, 2025.',
          'The receiving party agrees to keep all information confidential.',
          'Obligation lasts for 5 years after termination.',
          'Arbitration clause applies.',
        ]},
      ],
    };
  },
  computed: {
    visibleLeft() {
      if (this.showFilter === 'all') return this.leftLines;
      return this.leftLines.filter(l => this.showFilter === 'removed' ? l.type === 'removed' : l.type === this.showFilter || l.type === 'same');
    },
    visibleRight() {
      if (this.showFilter === 'all') return this.rightLines;
      return this.rightLines.filter(l => this.showFilter === 'added' ? l.type === 'added' : l.type === this.showFilter || l.type === 'same');
    },
  },
  methods: {
    compare() {
      const a = this.docA.content;
      const b = this.docB.content;
      const left = [];
      const right = [];
      const maxLen = Math.max(a.length, b.length);
      let added = 0, removed = 0, modified = 0;
      for (let i = 0; i < maxLen; i++) {
        const lineA = a[i] || null;
        const lineB = b[i] || null;
        if (lineA === lineB) {
          left.push({ num: i + 1, text: lineA, type: 'same' });
          right.push({ num: i + 1, text: lineB, type: 'same' });
        } else if (!lineA) {
          left.push({ num: i + 1, text: '', type: 'empty' });
          right.push({ num: i + 1, text: lineB, type: 'added' });
          added++;
        } else if (!lineB) {
          left.push({ num: i + 1, text: lineA, type: 'removed' });
          right.push({ num: i + 1, text: '', type: 'empty' });
          removed++;
        } else {
          left.push({ num: i + 1, text: lineA, type: 'modified' });
          right.push({ num: i + 1, text: lineB, type: 'modified' });
          modified++;
        }
      }
      this.leftLines = left;
      this.rightLines = right;
      const same = maxLen - added - removed - modified;
      this.stats = { added, removed, modified, similarity: Math.round((same / maxLen) * 100) };
      this.compared = true;
    },
    clear() { this.compared = false; this.docA = null; this.docB = null; },
    lineClass(type) {
      return { 'green lighten-4': type === 'added', 'red lighten-4': type === 'removed', 'orange lighten-4': type === 'modified' };
    },
  },
};
</script>
