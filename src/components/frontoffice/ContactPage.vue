<template>
  <div>
    <FrontOfficeNav />

    <!-- Hero -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55);padding:140px 0 80px">
      <v-container class="text-center">
        <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">GET IN TOUCH</div>
        <h1 style="color:white;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-1px" class="mb-4">Contact Us</h1>
        <p style="color:rgba(255,255,255,.65);font-size:1.1rem;max-width:500px;margin:0 auto">Ready to modernise your practice? Talk to our team and get a personalised demo.</p>
      </v-container>
    </section>

    <!-- Contact Content -->
    <section class="py-20" style="background:#f8f9fc">
      <v-container>
        <v-row>
          <!-- Left: Info -->
          <v-col cols="12" md="4" class="pr-md-8">
            <div class="overline mb-6" style="color:#C8A96E;letter-spacing:3px">REACH US</div>

            <div v-for="info in contactInfo" :key="info.label" class="d-flex align-start mb-8">
              <div class="mr-4 flex-shrink-0" style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#0A1628,#162f55);display:flex;align-items:center;justify-content:center">
                <v-icon color="#C8A96E" size="20">{{ info.icon }}</v-icon>
              </div>
              <div>
                <div class="caption font-weight-bold mb-1" style="color:#94a3b8;letter-spacing:1px">{{ info.label }}</div>
                <div class="font-weight-bold" style="color:#0A1628;font-size:15px">{{ info.primary }}</div>
                <div v-if="info.secondary" style="color:#64748b;font-size:13px">{{ info.secondary }}</div>
              </div>
            </div>

            <!-- Office Locations -->
            <div class="overline mb-4 mt-8" style="color:#C8A96E;letter-spacing:3px">OFFICES</div>
            <div v-for="office in offices" :key="office.city" class="mb-5 pa-4" style="background:white;border-radius:16px;border:1.5px solid #f1f5f9">
              <div class="d-flex align-center mb-2">
                <div style="width:8px;height:8px;border-radius:50%;background:#C8A96E;margin-right:10px;flex-shrink:0"></div>
                <div class="font-weight-bold" style="color:#0A1628;font-size:14px">{{ office.city }}</div>
                <v-chip v-if="office.hq" x-small color="#0A1628" dark class="ml-2" style="font-size:9px">HQ</v-chip>
              </div>
              <p class="caption mb-0" style="color:#64748b;line-height:1.6;margin-left:18px">{{ office.address }}</p>
            </div>

            <!-- Social -->
            <div class="overline mb-4 mt-6" style="color:#C8A96E;letter-spacing:3px">FOLLOW US</div>
            <div class="d-flex" style="gap:10px">
              <v-btn v-for="s in socials" :key="s.icon" icon :href="s.href" style="background:#0A1628">
                <v-icon color="white" small>{{ s.icon }}</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Right: Form -->
          <v-col cols="12" md="8">
            <v-card elevation="0" class="pa-8" style="border-radius:24px;border:1.5px solid #e2e8f0">
              <div class="subtitle-1 font-weight-bold mb-1" style="color:#0A1628">Send us a message</div>
              <p class="body-2 mb-8" style="color:#64748b">We respond to all enquiries within 24 hours on business days.</p>

              <!-- Type tabs -->
              <v-btn-toggle v-model="formType" mandatory class="mb-8" rounded style="border:1.5px solid #f1f5f9">
                <v-btn v-for="t in formTypes" :key="t.value" :value="t.value" small style="font-size:12px;font-weight:600;padding:0 16px;height:38px" active-class="btn-active">{{ t.label }}</v-btn>
              </v-btn-toggle>

              <v-form ref="form" v-model="valid" @submit.prevent="submit">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.first_name" label="First Name *" outlined dense :rules="[r => !!r || 'Required']" class="mb-1"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.last_name" label="Last Name *" outlined dense :rules="[r => !!r || 'Required']" class="mb-1"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.email" label="Work Email *" outlined dense type="email" :rules="[r => !!r || 'Required', r => /.+@.+/.test(r) || 'Invalid email']" class="mb-1"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.phone" label="Phone Number" outlined dense class="mb-1"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.firm_name" label="Firm / Company Name" outlined dense class="mb-1"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select v-model="form.firm_size" :items="firmSizes" label="Firm Size" outlined dense class="mb-1"></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select v-model="form.interest" :items="interests" label="I'm interested in…" outlined dense class="mb-1"></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="form.message" label="Message *" outlined rows="5" :rules="[r => !!r || 'Required']" placeholder="Tell us about your practice and what you're looking to achieve with ELoyer…"></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox v-model="form.gdpr" :rules="[r => !!r || 'You must accept to continue']" hide-details class="mb-4">
                      <template v-slot:label>
                        <span style="font-size:12px;color:#64748b">I agree to ELoyer's <router-link to="/privacy" style="color:#C8A96E">Privacy Policy</router-link> and consent to being contacted about my enquiry.</span>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>

                <v-alert v-if="submitted" type="success" rounded="lg" class="mb-4">
                  <strong>Message sent!</strong> We'll get back to you within 24 hours.
                </v-alert>

                <v-btn block x-large rounded elevation="0" type="submit" :loading="submitting" :disabled="!valid"
                  style="background:linear-gradient(135deg,#0A1628,#162f55);color:white;font-weight:800;height:54px;font-size:1rem">
                  <v-icon left>mdi-send</v-icon>Send Message
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Map placeholder -->
    <section style="background:#0A1628;height:300px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;opacity:.3">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(200,169,110,.4)" stroke-width="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div class="text-center" style="position:relative;z-index:1">
        <v-icon color="#C8A96E" size="48" class="mb-3">mdi-map-marker-circle</v-icon>
        <div style="color:white;font-size:1.2rem;font-weight:700">Tunis, Tunisia · Paris, France</div>
        <div style="color:rgba(255,255,255,.5);font-size:14px" class="mt-1">Serving law firms across MENA and Europe</div>
      </div>
    </section>

    <FrontOfficeFooter />
  </div>
</template>

<script>
import FrontOfficeNav from './FrontOfficeNav.vue';
import FrontOfficeFooter from './FrontOfficeFooter.vue';

export default {
  name: 'ContactPage',
  components: { FrontOfficeNav, FrontOfficeFooter },
  data() {
    return {
      formType: 'demo', valid: false, submitting: false, submitted: false,
      form: { first_name:'', last_name:'', email:'', phone:'', firm_name:'', firm_size:'', interest:'', message:'', gdpr: false },
      formTypes: [
        { label: 'Book a Demo', value: 'demo' },
        { label: 'Sales Enquiry', value: 'sales' },
        { label: 'Technical Support', value: 'support' },
        { label: 'General', value: 'general' },
      ],
      firmSizes: ['Solo (1 lawyer)', '2–5 lawyers', '6–15 lawyers', '16–50 lawyers', '50+ lawyers'],
      interests: ['Case Management', 'AI Legal Tools', 'Client Portal', 'Billing & Trust', 'Enterprise Features', 'Migration from another system', 'Other'],
      contactInfo: [
        { label: 'EMAIL', icon: 'mdi-email', primary: 'contact@eloyer.io', secondary: 'We respond within 24 hours' },
        { label: 'PHONE', icon: 'mdi-phone', primary: '+216 71 100 200', secondary: 'Mon–Fri, 9:00–18:00 CET' },
        { label: 'LIVE CHAT', icon: 'mdi-chat', primary: 'Chat with us now', secondary: 'Average response: 5 minutes' },
      ],
      offices: [
        { city: 'Tunis, Tunisia', address: '12 Rue de la République, Les Berges du Lac, Tunis 1053', hq: true },
        { city: 'Paris, France', address: '15 Rue de Rivoli, 75001 Paris (Partner Office)', hq: false },
      ],
      socials: [
        { icon: 'mdi-linkedin', href: '#' }, { icon: 'mdi-twitter', href: '#' },
        { icon: 'mdi-facebook', href: '#' }, { icon: 'mdi-youtube', href: '#' },
      ],
    };
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;
      this.submitting = true;
      await new Promise(r => setTimeout(r, 1500));
      this.submitting = false;
      this.submitted = true;
      this.$refs.form.reset();
    },
  },
};
</script>
<style scoped>
.py-20 { padding-top:80px !important; padding-bottom:80px !important; }
.btn-active { background:linear-gradient(135deg,#0A1628,#162f55) !important; color:white !important; }
</style>
