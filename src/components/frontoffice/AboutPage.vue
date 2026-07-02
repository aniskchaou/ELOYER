<template>
  <div>
    <FrontOfficeNav />

    <!-- Hero -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55);padding:140px 0 80px">
      <v-container class="text-center">
        <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">ABOUT US</div>
        <h1 style="color:white;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-1px" class="mb-4">Built by Lawyers, for Lawyers</h1>
        <p style="color:rgba(255,255,255,.65);font-size:1.1rem;max-width:600px;margin:0 auto">ELoyer was founded by a team of legal professionals and software engineers who believed the legal industry deserved better tools.</p>
      </v-container>
    </section>

    <!-- Mission -->
    <section class="py-20" style="background:white">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6" class="pr-md-12">
            <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">OUR MISSION</div>
            <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);font-weight:900;color:#0A1628;letter-spacing:-1px" class="mb-6">Democratising Legal Technology in North Africa</h2>
            <p style="color:#64748b;font-size:1.05rem;line-height:1.85" class="mb-6">
              Law firms across Tunisia, Morocco and the wider MENA region have long been underserved by legal technology. We set out to change that — building a platform that combines global best practices with deep local knowledge.
            </p>
            <p style="color:#64748b;font-size:1.05rem;line-height:1.85" class="mb-8">
              Today, ELoyer serves hundreds of law firms — from solo practitioners to multi-office partnerships — helping them reduce administrative overhead, serve more clients, and practice law with greater confidence.
            </p>
            <v-row>
              <v-col v-for="m in metrics" :key="m.label" cols="6">
                <div style="border-left:3px solid #C8A96E;padding-left:16px">
                  <div style="font-size:2rem;font-weight:900;color:#0A1628">{{ m.value }}</div>
                  <div style="color:#64748b;font-size:13px">{{ m.label }}</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="6">
            <div style="background:linear-gradient(135deg,#0A1628,#162f55);border-radius:24px;padding:48px;color:white">
              <div class="overline mb-6" style="color:#C8A96E;letter-spacing:3px">OUR VALUES</div>
              <div v-for="value in values" :key="value.title" class="d-flex align-start mb-8">
                <div class="mr-4 flex-shrink-0" style="width:44px;height:44px;border-radius:12px;background:rgba(200,169,110,.15);display:flex;align-items:center;justify-content:center">
                  <v-icon color="#C8A96E" size="20">{{ value.icon }}</v-icon>
                </div>
                <div>
                  <div class="font-weight-bold mb-1" style="font-size:15px">{{ value.title }}</div>
                  <p style="color:rgba(255,255,255,.6);font-size:13.5px;line-height:1.7;margin:0">{{ value.desc }}</p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Team -->
    <section class="py-20" style="background:#f8f9fc">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">THE TEAM</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);font-weight:900;color:#0A1628">Meet the Leadership Team</h2>
        </div>
        <v-row justify="center">
          <v-col v-for="member in team" :key="member.name" cols="12" sm="6" md="3" class="text-center mb-6">
            <v-avatar :color="member.color" size="100" class="mb-4">
              <span class="white--text" style="font-size:2rem;font-weight:800">{{ member.initials }}</span>
            </v-avatar>
            <div class="subtitle-1 font-weight-bold mb-1" style="color:#0A1628">{{ member.name }}</div>
            <div style="color:#C8A96E;font-size:13px;font-weight:600" class="mb-2">{{ member.role }}</div>
            <p class="caption" style="color:#64748b;line-height:1.6">{{ member.bio }}</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Timeline -->
    <section class="py-20" style="background:white">
      <v-container style="max-width:800px">
        <div class="text-center mb-12">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">OUR JOURNEY</div>
          <h2 style="font-size:2rem;font-weight:900;color:#0A1628">Company Milestones</h2>
        </div>
        <div v-for="(milestone, i) in milestones" :key="milestone.year" class="d-flex mb-10">
          <div class="text-right mr-6 flex-shrink-0" style="width:80px">
            <div style="font-size:1.1rem;font-weight:900;color:#C8A96E">{{ milestone.year }}</div>
          </div>
          <div style="position:relative;padding-left:24px">
            <div style="position:absolute;left:0;top:6px;width:12px;height:12px;border-radius:50%;background:#C8A96E"></div>
            <div v-if="i < milestones.length-1" style="position:absolute;left:5px;top:18px;bottom:-36px;width:2px;background:linear-gradient(#C8A96E,#f1f5f9)"></div>
            <div class="subtitle-2 font-weight-bold mb-1" style="color:#0A1628">{{ milestone.title }}</div>
            <p class="body-2 mb-0" style="color:#64748b;line-height:1.7">{{ milestone.desc }}</p>
          </div>
        </div>
      </v-container>
    </section>

    <!-- CTA -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55)" class="py-16 text-center">
      <v-container>
        <h2 style="color:white;font-size:2rem;font-weight:900" class="mb-4">Join Hundreds of Law Firms</h2>
        <p style="color:rgba(255,255,255,.65)" class="mb-8">Start your free trial today. No credit card required.</p>
        <div class="d-flex justify-center" style="gap:16px">
          <v-btn x-large rounded elevation="0" to="/contact" style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:800;height:52px;padding:0 36px">Get Started Free</v-btn>
          <v-btn x-large rounded outlined to="/contact" style="border-color:rgba(255,255,255,.3);color:white;height:52px;padding:0 28px">Contact Sales</v-btn>
        </div>
      </v-container>
    </section>

    <FrontOfficeFooter />
  </div>
</template>

<script>
import FrontOfficeNav from './FrontOfficeNav.vue';
import FrontOfficeFooter from './FrontOfficeFooter.vue';

export default {
  name: 'AboutPage',
  components: { FrontOfficeNav, FrontOfficeFooter },
  data() {
    return {
      metrics: [
        { value: '500+', label: 'Law firms served' }, { value: '12,000+', label: 'Cases managed' },
        { value: '4.9/5', label: 'Customer rating' }, { value: '98.9%', label: 'Platform uptime' },
      ],
      values: [
        { title: 'Built for Legal Professionals', desc: 'Every feature is designed with real legal workflows in mind — not adapted from generic software.', icon: 'mdi-scale-balance' },
        { title: 'Security First', desc: 'We treat client data with the same confidentiality obligation your profession requires.', icon: 'mdi-shield-lock' },
        { title: 'Continuous Innovation', desc: 'We ship new features every two weeks based on direct feedback from practicing lawyers.', icon: 'mdi-lightning-bolt' },
        { title: 'Regional Expertise', desc: 'Deep knowledge of North African and French-based civil law systems embedded in the platform.', icon: 'mdi-earth' },
      ],
      team: [
        { name: 'Ahmed Cherni', role: 'CEO & Co-Founder', bio: 'Former senior partner with 15 years of civil litigation experience. LLM from Paris II.', initials: 'AC', color: '#0A1628' },
        { name: 'Sonia Belhaj', role: 'CTO & Co-Founder', bio: 'Software architect with a decade building legal SaaS platforms. Previously at a Big 4 legaltech firm.', initials: 'SB', color: '#162f55' },
        { name: 'Karim Ferjani', role: 'Head of Product', bio: 'Product leader passionate about making legal tools accessible and intuitive for all practitioners.', initials: 'KF', color: '#C8A96E' },
        { name: 'Leila Dridi', role: 'Head of Legal Affairs', bio: 'Expert in data protection and compliance law. Ensures ELoyer meets the highest regulatory standards.', initials: 'LD', color: '#0891b2' },
      ],
      milestones: [
        { year: '2020', title: 'Founded', desc: 'ELoyer was incorporated in Tunis with a mission to modernise legal practice management in the MENA region.' },
        { year: '2021', title: 'First 50 Firms', desc: 'Launched the beta platform and onboarded the first 50 law firms across Tunisia, with strong positive feedback from early adopters.' },
        { year: '2022', title: 'Series A Funding', desc: 'Raised $2.5M in seed funding to expand the team, accelerate product development and launch in Morocco.' },
        { year: '2023', title: 'AI Integration', desc: 'Launched the first AI legal tools — contract generation, document summarisation and risk analysis — to exceptional client response.' },
        { year: '2024', title: '500 Firms Milestone', desc: 'Reached 500 active law firm clients and expanded operations to France and the broader francophone market.' },
        { year: '2025', title: 'Enterprise Platform', desc: 'Launched the Enterprise tier with SSO, white-label branding, custom workflows and advanced compliance tools.' },
        { year: '2026', title: 'Today', desc: '20 premium AI tools, 18 user roles, full enterprise feature set and growing across 6 markets.' },
      ],
    };
  },
};
</script>
<style scoped>
.py-20 { padding-top:80px !important; padding-bottom:80px !important; }
</style>
