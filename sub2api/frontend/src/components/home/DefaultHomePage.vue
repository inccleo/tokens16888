<template>
  <div data-testid="default-home" class="landing">
    <div v-if="promoVisible" class="promo">
      <div class="promo-inner">
        <Icon name="gift" size="sm" />
        <span>{{ t('home.promo.text', { site: siteName }) }}</span>
        <router-link :to="primaryCtaPath" class="promo-cta">{{ t('home.promo.cta') }}</router-link>
      </div>
      <button type="button" class="promo-close" :aria-label="t('common.close')" @click="dismissPromo">
        <Icon name="x" size="sm" />
      </button>
    </div>

    <header class="nav">
      <div class="nav-inner">
        <router-link to="/home" class="brand">
          <img :src="siteLogo || '/logo.svg'" alt="" class="brand-logo" />
          <span>{{ siteName }}</span>
        </router-link>

        <nav class="nav-links" :class="{ open: mobileOpen }">
          <router-link v-if="showModelPlaza" to="/model-plaza">{{ t('home.navLanding.modelMarket') }}</router-link>
          <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.navLanding.apiDocs') }}</a>
          <router-link v-if="showModelPlaza" to="/model-plaza">{{ t('home.navLanding.pricing') }}</router-link>
          <div class="nav-dd" :class="{ open: resourcesOpen }">
            <button type="button" @click="toggleMenu('resources')">
              {{ t('home.navLanding.resources') }}
              <Icon name="chevronDown" size="xs" />
            </button>
            <div v-if="resourcesOpen" class="nav-menu">
              <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a>
              <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
          <div class="nav-dd" :class="{ open: supportOpen }">
            <button type="button" @click="toggleMenu('support')">
              {{ t('home.navLanding.support') }}
              <Icon name="chevronDown" size="xs" />
            </button>
            <div v-if="supportOpen" class="nav-menu">
              <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a>
            </div>
          </div>
        </nav>

        <div class="nav-end">
          <LocaleSwitcher />
          <template v-if="isAuthenticated">
            <router-link :to="dashboardPath" class="credits">
              <span class="credits-mark">¥</span>
              {{ formattedBalance }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-text">{{ t('home.login') }}</router-link>
            <router-link to="/register" class="ln-btn btn-solid">{{ t('home.register') }}</router-link>
          </template>
          <button type="button" class="nav-toggle" @click="mobileOpen = !mobileOpen">
            <Icon :name="mobileOpen ? 'x' : 'menu'" size="md" />
          </button>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-copy">
        <h1>
          <span>{{ t('home.heroTitleLine1') }}</span>
          <span>{{ t('home.heroTitleLine2') }}</span>
        </h1>
        <p>{{ t('home.heroDescription', { site: siteName }) }}</p>
        <div class="hero-actions">
          <router-link :to="primaryCtaPath" class="ln-btn btn-solid">
            {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
            <Icon name="arrowRight" size="sm" />
          </router-link>
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="ln-btn btn-ghost"
          >
            {{ t('home.viewDocsCta') }}
          </a>
        </div>
      </div>
      <div class="hero-preview">
        <HomeDashboardPreview :site-name="siteName" :logo="siteLogo || '/logo.svg'" />
      </div>
    </section>

    <section class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <div v-for="n in 2" :key="n" class="marquee-group">
          <span v-for="item in providers" :key="item + n" class="marquee-item">
            <PlatformIcon :platform="providerPlatform(item)" size="md" />
            {{ item }}
          </span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('home.gateway.title') }}</h2>
      <p class="lede">{{ t('home.gateway.subtitle') }}</p>
      <div class="gateway-grid">
        <article class="panel">
          <p class="idx">01</p>
          <h3>{{ t('home.gateway.modelIndependence') }}</h3>
          <div class="radar">
            <svg viewBox="0 0 320 300" class="radar-svg">
              <polygon
                v-for="ring in radarRings"
                :key="ring"
                :points="radarPolygon(ring)"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
              />
              <polygon :points="radarPolygon(0.55)" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" />
              <polygon :points="radarPolygon(0.7)" fill="none" stroke="#f26a2e" stroke-dasharray="4 3" />
              <text v-for="(label, i) in radarLabels" :key="label" v-bind="radarLabelPos(i)" class="radar-label">
                {{ label }}
              </text>
            </svg>
            <div class="radar-legend">
              <span><i /> OpenAI</span>
              <span><i /> Claude</span>
              <span><i /> Gemini</span>
              <span class="accent"><i /> {{ siteName }} {{ t('home.gateway.bestRoute') }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <p class="idx">02</p>
          <h3>{{ t('home.gateway.sovereignAccess') }}</h3>
          <ul class="checks">
            <li v-for="item in sovereignItems" :key="item.title">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
              <Icon name="check" size="sm" class="check-icon" />
            </li>
          </ul>
          <p class="footnote">{{ t('home.gateway.oneAccount', { providers: 'OpenAI · Anthropic · Google · ByteDance' }) }}</p>
        </article>

        <article class="panel">
          <p class="idx">03</p>
          <h3>{{ t('home.gateway.lifecycleTitle') }}</h3>
          <div class="orbit">
            <div class="orbit-core">{{ t('home.gateway.sharedControl') }}</div>
            <div
              v-for="(node, i) in orbitNodes"
              :key="node"
              class="orbit-node"
              :style="orbitStyle(i)"
            >
              {{ node }}
            </div>
          </div>
          <p class="footnote">{{ t('home.gateway.lifecycleNote') }}</p>
        </article>
      </div>
    </section>

    <section class="section llms">
      <div>
        <p class="kicker">{{ t('home.llms.kicker') }}</p>
        <h2>{{ t('home.llms.title', { site: siteName }) }}</h2>
        <p class="lede">{{ t('home.llms.desc', { site: siteName }) }}</p>
      </div>
      <div class="code-frame">
        <div class="code-bar">
          <span class="dots" aria-hidden="true"><i /><i /><i /></span>
          <span>{{ siteName.toLowerCase() }} — llms.txt {{ t('home.docs') }}</span>
          <button type="button" class="copy-btn" @click="copyText(llmsPrompt)">
            <Icon name="copy" size="xs" />
            {{ copied === llmsPrompt ? t('home.copied') : t('home.llms.copy') }}
          </button>
        </div>
        <pre>{{ llmsPrompt }}</pre>
      </div>
    </section>

    <section class="models-section">
      <div class="models-head">
        <div class="models-copy">
          <p class="kicker">{{ t('home.models.kicker') }}</p>
          <h2>{{ t('home.models.title') }}</h2>
          <p class="lede">{{ t('home.models.subtitle') }}</p>
        </div>
        <div class="models-tools">
          <div class="tabs" :style="{ '--tab-index': modelTabIndex }">
            <button
              v-for="tab in modelTabs"
              :key="tab.id"
              type="button"
              :class="{ active: modelTab === tab.id }"
              @click="modelTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <router-link :to="showModelPlaza ? '/model-plaza' : primaryCtaPath" class="view-all">
            {{ t('home.models.viewAll') }}
            <Icon name="arrowRight" size="sm" />
          </router-link>
        </div>
      </div>
      <div class="model-scroller">
        <div class="model-fade model-fade-left"></div>
        <div class="model-fade model-fade-right"></div>
        <div :key="modelTab" class="model-track">
          <div v-for="copy in 2" :key="copy" class="model-row" :aria-hidden="copy === 2">
            <router-link
              v-for="model in visibleModels"
              :key="`${copy}-${model.id}`"
              :to="showModelPlaza ? '/model-plaza' : primaryCtaPath"
              class="model-card"
            >
              <div class="model-card-top">
                <div class="model-vendor">
                  <span class="model-icon-wrap">
                    <ModelIcon :model="model.vendor" size="18px" />
                  </span>
                  <div>
                    <p>{{ model.vendor }}</p>
                    <small>{{ t(`home.models.${model.category}`) }}</small>
                  </div>
                </div>
                <Icon name="arrowRight" size="sm" />
              </div>
              <p class="model-desc">{{ model.description }}</p>
              <div class="model-card-bottom">
                <div class="model-name">
                  <strong>{{ model.name }}</strong>
                  <span>{{ model.price }}</span>
                </div>
                <em v-if="model.savePct">{{ t('home.models.savePct', { pct: model.savePct }) }}</em>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="section integrate">
      <h2>{{ t('home.integrate.title') }}</h2>
      <p class="lede">{{ t('home.integrate.subtitle') }}</p>
      <div class="integrate-grid">
        <ol class="steps">
          <li>
            <span>1</span>
            <div>
              <h3>{{ t('home.integrate.step1Title') }}</h3>
              <p>{{ t('home.integrate.step1Desc') }}</p>
              <div class="step-actions">
                <router-link :to="primaryCtaPath" class="ln-btn btn-solid sm">{{ t('home.integrate.getKey') }}</router-link>
                <router-link :to="primaryCtaPath" class="ln-btn btn-ghost sm">{{ t('home.integrate.tryPlayground') }}</router-link>
              </div>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <h3>{{ t('home.integrate.step2Title') }}</h3>
              <p>{{ t('home.integrate.step2Desc') }}</p>
              <div class="step-actions">
                <a
                  v-if="docUrl"
                  :href="docUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ln-btn btn-solid sm"
                >{{ t('home.integrate.viewDocs') }}</a>
                <router-link :to="primaryCtaPath" class="ln-btn btn-ghost sm">{{ t('home.integrate.tryPlayground') }}</router-link>
              </div>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <h3>{{ t('home.integrate.step3Title') }}</h3>
              <p>{{ t('home.integrate.step3Desc') }}</p>
            </div>
          </li>
        </ol>
        <div class="code-frame">
          <div class="code-bar">
            <span class="dots" aria-hidden="true"><i /><i /><i /></span>
            <span>{{ siteName.toLowerCase() }} — demo.request</span>
          </div>
          <div class="code-tabs">
            <button
              v-for="lang in codeLangs"
              :key="lang.id"
              type="button"
              :class="{ active: codeLang === lang.id }"
              @click="codeLang = lang.id"
            >
              {{ lang.label }}
            </button>
          </div>
          <pre>{{ currentCode }}</pre>
        </div>
      </div>
    </section>

    <section class="section">
      <p class="kicker">{{ t('home.why.kicker', { site: siteName }) }}</p>
      <h2>{{ t('home.why.title', { site: siteName }) }}</h2>
      <p class="lede">{{ t('home.why.subtitle') }}</p>
      <div class="why-grid">
        <article v-for="(item, i) in whyItems" :key="item.title">
          <div class="why-top">
            <p class="idx">{{ String(i + 1).padStart(2, '0') }}</p>
            <Icon :name="item.icon" size="md" class="why-icon" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <p class="kicker">{{ t('home.faq.kicker') }}</p>
      <h2>{{ t('home.faq.title') }}</h2>
      <div class="faq-grid">
        <button
          v-for="item in faqItems"
          :key="item.q"
          type="button"
          class="faq-card"
          :class="{ open: openFaq === item.q }"
          @click="openFaq = openFaq === item.q ? '' : item.q"
        >
          <Icon :name="item.icon" size="md" />
          <h3>{{ item.q }}</h3>
          <p v-if="openFaq === item.q">{{ item.a }}</p>
        </button>
      </div>
    </section>

    <section class="cta">
      <div class="cta-inner">
        <div>
          <p class="kicker">{{ t('home.cta.kicker') }}</p>
          <h2>{{ t('home.cta.title') }}</h2>
          <p>{{ t('home.cta.description') }}</p>
        </div>
        <div class="hero-actions">
          <router-link :to="primaryCtaPath" class="ln-btn btn-orange">
            {{ isAuthenticated ? t('home.goToDashboard') : t('home.cta.button') }}
            <Icon name="arrowRight" size="sm" />
          </router-link>
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="ln-btn btn-ghost"
          >
            {{ t('home.viewDocsCta') }}
          </a>
        </div>
      </div>
    </section>

    <footer class="foot">
      <div class="foot-grid">
        <div v-for="col in footerCols" :key="col.title" class="foot-col">
          <h4>{{ col.title }}</h4>
          <router-link v-for="link in col.links" :key="link.label" :to="link.to">{{ link.label }}</router-link>
        </div>
      </div>
      <div class="foot-bottom">
        <div class="brand">
          <img :src="siteLogo || '/logo.svg'" alt="" class="brand-logo lg" />
          <span>{{ siteName }}</span>
        </div>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="soc" title="GitHub">
          GitHub
        </a>
        <p>© {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}</p>
      </div>
    </footer>

    <div class="fab">
      <button type="button" :title="t('home.backToTop')" @click="scrollTop">
        <Icon name="arrowUp" size="sm" />
      </button>
      <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" :title="t('home.contact')">
        <Icon name="mail" size="sm" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'
import HomeDashboardPreview from './HomeDashboardPreview.vue'
import { featuredModels, type FeaturedModelCategory } from './featuredModels'
import { sanitizeUrl } from '@/utils/url'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'
import type { GroupPlatform } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() =>
  sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', {
    allowRelative: true,
    allowDataUrl: true
  })
)
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))
const primaryCtaPath = computed(() => (isAuthenticated.value ? dashboardPath.value : '/register'))
const modelPlazaEnabled = computed(() => isFeatureFlagEnabled(FeatureFlags.modelPlaza))
const showModelPlaza = computed(
  () =>
    modelPlazaEnabled.value &&
    (isAuthenticated.value || appStore.cachedPublicSettings?.model_plaza_require_auth !== true)
)
const formattedBalance = computed(() => {
  const value = Number(authStore.user?.balance ?? 0)
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'
})
const currentYear = computed(() => new Date().getFullYear())
const apiBase = computed(() => {
  const configured = appStore.apiBaseUrl?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return `${window.location.origin}/v1`
  return '/v1'
})

const promoVisible = ref(true)
const mobileOpen = ref(false)
const resourcesOpen = ref(false)
const supportOpen = ref(false)
const copied = ref('')
const modelTab = ref<FeaturedModelCategory>('image')
const codeLang = ref('curl')
const openFaq = ref('')

const providers = ['OpenAI', 'Anthropic', 'Google', 'ByteDance', 'Qwen', 'Kimi', 'MiniMax']
const modelTabs = computed(() => [
  { id: 'image' as const, label: t('home.models.image') },
  { id: 'video' as const, label: t('home.models.video') },
  { id: 'chat' as const, label: t('home.models.chat') }
])
const visibleModels = computed(() => featuredModels.filter((item) => item.category === modelTab.value))
const modelTabIndex = computed(() => Math.max(0, modelTabs.value.findIndex((tab) => tab.id === modelTab.value)))
const radarLabels = computed(() => [
  t('home.gateway.axisCoding'),
  t('home.gateway.axisReasoning'),
  t('home.gateway.axisSpeed'),
  t('home.gateway.axisCost'),
  t('home.gateway.axisContext'),
  t('home.gateway.axisTools')
])
const radarRings = [0.28, 0.5, 0.72, 0.94]
const sovereignItems = computed(() => [
  { title: t('home.gateway.openaiCompatible'), desc: t('home.gateway.openaiCompatibleDesc') },
  { title: t('home.gateway.unifiedBilling'), desc: t('home.gateway.unifiedBillingDesc') },
  { title: t('home.gateway.vendorRouting'), desc: t('home.gateway.vendorRoutingDesc') },
  { title: t('home.gateway.dedicatedSupport'), desc: t('home.gateway.dedicatedSupportDesc') }
])
const orbitNodes = computed(() => [
  t('home.gateway.nodeKey'),
  t('home.gateway.nodePrice'),
  t('home.gateway.nodeLog'),
  t('home.gateway.nodeRoute'),
  t('home.gateway.nodeCall'),
  t('home.gateway.nodeTask'),
  t('home.gateway.nodeBill'),
  t('home.gateway.nodeSupport')
])
const whyItems = computed(() => [
  { icon: 'shield' as const, title: t('home.why.official.title'), desc: t('home.why.official.desc') },
  { icon: 'clock' as const, title: t('home.why.pricing.title'), desc: t('home.why.pricing.desc') },
  { icon: 'grid' as const, title: t('home.why.console.title'), desc: t('home.why.console.desc') },
  { icon: 'bolt' as const, title: t('home.why.integrate.title'), desc: t('home.why.integrate.desc') },
  { icon: 'trendingUp' as const, title: t('home.why.discount.title'), desc: t('home.why.discount.desc') },
  { icon: 'chat' as const, title: t('home.why.support.title'), desc: t('home.why.support.desc') }
])
const faqItems = computed(() => [
  { icon: 'cube' as const, q: t('home.faq.q1'), a: t('home.faq.a1') },
  { icon: 'dollar' as const, q: t('home.faq.q2'), a: t('home.faq.a2') },
  { icon: 'cpu' as const, q: t('home.faq.q3'), a: t('home.faq.a3') },
  { icon: 'terminal' as const, q: t('home.faq.q4'), a: t('home.faq.a4') },
  { icon: 'key' as const, q: t('home.faq.q5'), a: t('home.faq.a5') },
  { icon: 'creditCard' as const, q: t('home.faq.q6'), a: t('home.faq.a6') }
])
const footerCols = computed(() => [
  {
    title: t('home.models.title'),
    links: [
      { label: 'GPT', to: showModelPlaza.value ? '/model-plaza' : primaryCtaPath.value },
      { label: 'Claude', to: showModelPlaza.value ? '/model-plaza' : primaryCtaPath.value },
      { label: 'Gemini', to: showModelPlaza.value ? '/model-plaza' : primaryCtaPath.value },
      { label: 'Qwen', to: showModelPlaza.value ? '/model-plaza' : primaryCtaPath.value }
    ]
  },
  {
    title: t('home.navLanding.resources'),
    links: [
      { label: t('home.docs'), to: '/home' },
      { label: t('nav.modelPlaza'), to: '/model-plaza' },
      { label: t('home.login'), to: '/login' },
      { label: t('home.register'), to: '/register' }
    ]
  }
])

const llmsPrompt = computed(() =>
  t('home.llms.prompt', {
    site: siteName.value,
    docs: docUrl.value || `${typeof window !== 'undefined' ? window.location.origin : ''}/home`
  })
)

const codeLangs = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'go', label: 'Go' },
  { id: 'java', label: 'Java' },
  { id: 'php', label: 'PHP' }
]

const currentCode = computed(() => {
  const url = `${apiBase.value}/chat/completions`
  const samples: Record<string, string> = {
    curl: `curl --request POST \\
  --url ${url} \\
  --header 'Authorization: Bearer <token>' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a professional AI assistant." },
      { "role": "user", "content": "Tell me about the history of artificial intelligence." }
    ]
  }'`,
    python: `from openai import OpenAI

client = OpenAI(api_key="<token>", base_url="${apiBase.value}")
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
print(resp.choices[0].message.content)`,
    javascript: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "<token>",
  baseURL: "${apiBase.value}"
});
const resp = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }]
});`,
    go: `req, _ := http.NewRequest("POST", "${url}", strings.NewReader(body))
req.Header.Set("Authorization", "Bearer <token>")
req.Header.Set("Content-Type", "application/json")`,
    java: `HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${url}"))
    .header("Authorization", "Bearer <token>")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();`,
    php: `curl_setopt_array($ch, [
  CURLOPT_URL => '${url}',
  CURLOPT_HTTPHEADER => ['Authorization: Bearer <token>'],
]);`
  }
  return samples[codeLang.value]
})

function providerPlatform(name: string): GroupPlatform | undefined {
  const map: Record<string, GroupPlatform> = {
    OpenAI: 'openai',
    Anthropic: 'anthropic',
    Google: 'gemini',
    Kimi: 'kimi',
    MiniMax: 'minimax'
  }
  return map[name]
}

function radarPolygon(scale: number) {
  const cx = 160
  const cy = 150
  const r = 96 * scale
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
  }).join(' ')
}

function radarLabelPos(i: number) {
  const cx = 160
  const cy = 150
  const r = 118
  const angle = (Math.PI / 3) * i - Math.PI / 2
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    'text-anchor': 'middle'
  }
}

function orbitStyle(i: number) {
  const total = 8
  const angle = (Math.PI * 2 * i) / total - Math.PI / 2
  const r = 108
  return {
    left: `calc(50% + ${Math.cos(angle) * r}px)`,
    top: `calc(50% + ${Math.sin(angle) * r}px)`
  }
}

function toggleMenu(name: 'resources' | 'support') {
  if (name === 'resources') {
    resourcesOpen.value = !resourcesOpen.value
    supportOpen.value = false
  } else {
    supportOpen.value = !supportOpen.value
    resourcesOpen.value = false
  }
}

function dismissPromo() {
  promoVisible.value = false
  localStorage.setItem('landing-promo-dismissed', '1')
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = value
    window.setTimeout(() => {
      if (copied.value === value) copied.value = ''
    }, 1600)
  } catch {
    copied.value = ''
  }
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onDocClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.nav-dd')) {
    resourcesOpen.value = false
    supportOpen.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('landing-promo-dismissed') === '1') promoVisible.value = false
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.landing {
  --ln-bg: #0a0a0a;
  --ln-fg: #f5f5f4;
  --ln-muted: #8a8682;
  --ln-border: rgba(255, 255, 255, 0.08);
  --ln-card: #111;
  --ln-orange: #f26a2e;
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.055) 1px, transparent 0) 0 0 / 18px 18px,
    var(--ln-bg);
  color: var(--ln-fg);
  font-feature-settings: 'ss01';
}

.landing :deep(.relative button) {
  color: var(--ln-muted);
}

.landing :deep(.relative button:hover) {
  background: rgba(255, 255, 255, 0.06);
  color: var(--ln-fg);
}

.promo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 38px;
  border-bottom: 1px solid var(--ln-border);
  background: #0e0e0e;
  padding: 0 16px;
  font-size: 13px;
  color: #d4d0cc;
}

.promo-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.promo-cta {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #1a1a1a;
  padding: 2px 8px;
  font-size: 12px;
}

.promo-close {
  position: absolute;
  right: 16px;
  color: var(--ln-muted);
}

.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px);
  background: rgba(10, 10, 10, 0.86);
}

.nav-inner,
.section,
.cta-inner,
.foot,
.llms,
.integrate-grid,
.models-head {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

.nav-inner {
  display: flex;
  align-items: center;
  height: 72px;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ln-fg);
}

.brand-logo {
  height: 22px;
  width: 22px;
  object-fit: contain;
}

.brand-logo.lg {
  height: 28px;
  width: 28px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-left: auto;
  font-size: 14px;
  color: #d4d0cc;
}

.nav-links a:hover,
.nav-text:hover {
  color: var(--ln-fg);
}

.nav-dd {
  position: relative;
}

.nav-dd button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #d4d0cc;
}

.nav-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 140px;
  display: grid;
  border: 1px solid var(--ln-border);
  background: #141414;
  padding: 8px;
  z-index: 20;
}

.nav-menu a {
  padding: 8px;
  color: #d4d0cc;
}

.nav-end {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-text {
  font-size: 14px;
  color: #d4d0cc;
}

.credits {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--ln-border);
  padding: 6px 10px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.credits-mark {
  display: inline-flex;
  height: 16px;
  width: 16px;
  align-items: center;
  justify-content: center;
  background: var(--ln-orange);
  color: #fff;
  font-size: 11px;
}

.nav-toggle {
  display: none;
  color: var(--ln-fg);
}

.ln-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  padding: 0 15px;
  border-radius: 4px !important;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

.ln-btn.sm {
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
}

.ln-btn.btn-solid {
  background: #fafafa;
  color: #111;
}

.ln-btn.btn-ghost {
  border: 1px solid #8f8b88;
  background: transparent;
  color: var(--ln-fg);
}

.ln-btn.btn-orange {
  background: var(--ln-orange);
  border: 1px solid #d9551a;
  color: #fafafa;
  height: 40px;
  padding: 0 20px;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1920px;
  min-height: 720px;
  margin: 0 auto;
  padding: 96px 16px 56px;
  overflow: visible;
}

.hero-copy {
  z-index: 2;
  display: flex;
  max-width: 572px;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.hero h1 {
  display: flex;
  flex-direction: column;
  font-size: clamp(38px, 5vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.98;
}

.hero-copy p {
  max-width: 442px;
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  color: var(--ln-muted);
}

.lede {
  margin-top: 20px;
  max-width: 42rem;
  font-size: 15px;
  line-height: 1.7;
  color: var(--ln-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
}

.hero-preview {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  justify-content: center;
}

@media (min-width: 640px) {
  .hero {
    min-height: 760px;
    padding: 112px 36px 80px;
  }
}

@media (min-width: 1024px) {
  .hero {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: 699px;
    min-height: 1011px;
    align-items: stretch;
    gap: 16px;
    padding-top: 120px;
  }

  .hero-copy {
    grid-column: 1 / span 5;
    max-width: 520px;
  }

  .hero-preview {
    grid-column: 6 / span 7;
    min-width: 0;
    justify-content: flex-start;
    overflow: visible;
    transform: translate(12px, 48px);
  }
}

@media (min-width: 1280px) {
  .hero-copy {
    max-width: 520px;
  }

  .hero-preview {
    transform: translate(88px, 64px);
  }
}

@media (min-width: 1536px) {
  .hero-copy {
    max-width: 572px;
  }

  .hero-preview {
    transform: translate(152px, 80px);
  }
}

.marquee {
  overflow: hidden;
  border-top: 1px solid var(--ln-border);
  border-bottom: 1px solid var(--ln-border);
  padding: 28px 0;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 28s linear infinite;
}

.marquee-group,
.marquee-item {
  display: flex;
  align-items: center;
}

.marquee-group {
  gap: 64px;
  padding-right: 64px;
}

.marquee-item {
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6f6c69;
}

.section {
  padding: 88px 0;
}

.section h2,
.cta h2,
.models-copy h2 {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.kicker {
  margin-bottom: 10px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ln-muted);
}

.idx {
  color: var(--ln-orange);
  font-size: 13px;
}

.gateway-grid,
.why-grid,
.faq-grid {
  display: grid;
  gap: 1px;
  margin-top: 36px;
  border: 1px solid var(--ln-border);
  background: var(--ln-border);
}

.gateway-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.panel,
.why-grid article,
.faq-card {
  background: var(--ln-card);
  padding: 24px;
  text-align: left;
}

.panel h3,
.why-grid h3,
.faq-card h3 {
  margin-top: 10px;
  font-size: 20px;
}

.radar-svg {
  width: 100%;
  height: 240px;
  margin-top: 18px;
}

.radar-label {
  fill: #8a8682;
  font-size: 11px;
}

.radar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--ln-muted);
}

.radar-legend i {
  display: inline-block;
  width: 12px;
  height: 2px;
  margin-right: 6px;
  background: #8a8682;
  vertical-align: middle;
}

.radar-legend .accent {
  color: var(--ln-orange);
}

.radar-legend .accent i {
  background: var(--ln-orange);
}

.checks {
  margin-top: 20px;
}

.checks li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--ln-border);
}

.checks strong {
  font-size: 14px;
}

.checks p {
  margin-top: 4px;
  font-size: 13px;
  color: var(--ln-muted);
}

.check-icon {
  color: var(--ln-orange);
  flex-shrink: 0;
}

.footnote {
  margin-top: 16px;
  font-size: 12px;
  color: var(--ln-muted);
}

.orbit {
  position: relative;
  height: 280px;
  margin: 12px 0 8px;
}

.orbit-core,
.orbit-node {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(242, 106, 46, 0.7);
  border-radius: 999px;
  transform: translate(-50%, -50%);
  background: #0f0f0f;
  font-size: 12px;
}

.orbit-core {
  left: 50%;
  top: 50%;
  width: 92px;
  height: 92px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.16);
}

.orbit-node {
  width: 72px;
  height: 72px;
}

.llms {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 48px;
  align-items: center;
}

.code-frame {
  border: 1px solid var(--ln-border);
  background: #121212;
  overflow: hidden;
}

.code-bar,
.code-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--ln-border);
  padding: 10px 12px;
  font-size: 12px;
  color: var(--ln-muted);
}

.code-tabs {
  gap: 0;
  padding: 0;
}

.code-tabs button {
  padding: 8px 12px;
  color: var(--ln-muted);
}

.code-tabs button.active {
  background: #fafafa;
  color: #111;
}

.dots {
  display: flex;
  gap: 5px;
}

.dots i {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: #ff5f57;
}

.dots i:nth-child(2) {
  background: #febc2e;
}

.dots i:nth-child(3) {
  background: #28c840;
}

.copy-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ln-muted);
}

.code-frame pre {
  padding: 16px;
  font-size: 13px;
  line-height: 1.65;
  color: #d8d4d0;
  white-space: pre-wrap;
}

.models-section {
  padding: 88px 0 48px;
  overflow: hidden;
}

.models-head {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--ln-border);
  background: #101010;
}

@media (min-width: 1024px) {
  .models-head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .models-tools {
    align-items: flex-end;
  }

  .tabs {
    width: auto;
    min-width: 228px;
  }
}

.models-copy h2 {
  margin-top: 10px;
}

.models-copy .lede {
  margin-top: 12px;
}

.models-tools {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  height: 30px;
  width: 100%;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--ln-border);
  border-radius: 0;
  background: #141414;
}

.tabs::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  width: calc(100% / 3);
  background: #fafafa;
  transform: translateX(calc(var(--tab-index, 0) * 100%));
  transition: transform 0.2s ease;
}

.tabs button,
.code-tabs button {
  border-radius: 0;
}

.tabs button {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 0 13px;
  font-size: 13px;
  color: var(--ln-fg);
}

.tabs button + button {
  border-left: 1px solid var(--ln-border);
}

.tabs button.active {
  background: transparent;
  color: #111;
}

.view-all {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ln-fg);
}

.model-scroller {
  position: relative;
  margin-top: 20px;
  overflow: hidden;
}

.model-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 72px;
  pointer-events: none;
}

.model-fade-left {
  left: 0;
  background: linear-gradient(90deg, var(--ln-bg), transparent);
}

.model-fade-right {
  right: 0;
  background: linear-gradient(270deg, var(--ln-bg), transparent);
}

.model-track {
  display: flex;
  width: max-content;
  animation: model-marquee 46s linear infinite;
  will-change: transform;
}

.model-track:hover {
  animation-play-state: paused;
}

.model-row {
  display: flex;
  gap: 12px;
  padding-right: 12px;
}

.model-card {
  display: flex;
  width: min(78vw, 320px);
  flex-shrink: 0;
  aspect-ratio: 3 / 4;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid var(--ln-border);
  border-radius: 6px;
  background: #111;
  padding: 20px;
  color: inherit;
}

.model-card-top,
.model-vendor,
.model-card-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.model-vendor {
  min-width: 0;
  align-items: center;
}

.model-icon-wrap {
  display: inline-flex;
  height: 36px;
  width: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ln-border);
  background: #0a0a0a;
}

.model-vendor p {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ln-muted);
}

.model-vendor small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ln-muted);
}

.model-desc {
  display: -webkit-box;
  flex: 1;
  margin: 28px 0;
  overflow: hidden;
  font-size: 15px;
  line-height: 24px;
  color: var(--ln-muted);
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
}

.model-card-bottom {
  align-items: flex-end;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--ln-border);
}

.model-name {
  min-width: 0;
}

.model-name strong {
  display: block;
  overflow: hidden;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 26px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-name span {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ln-muted);
}

.model-card-bottom em {
  flex-shrink: 0;
  border: 1px solid rgba(242, 106, 46, 0.45);
  background: rgba(242, 106, 46, 0.1);
  color: var(--ln-orange);
  font-style: normal;
  padding: 4px 8px;
  font-size: 11px;
  letter-spacing: 0.04em;
}

@keyframes model-marquee {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .model-track {
    animation: none;
  }
}

.integrate-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 20px;
  margin-top: 36px;
  align-items: start;
}

.steps {
  display: grid;
  gap: 12px;
}

.steps li {
  display: flex;
  gap: 14px;
  border: 1px solid var(--ln-border);
  background: #111;
  padding: 18px;
}

.steps li span {
  display: inline-flex;
  height: 28px;
  width: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ln-border);
  font-size: 13px;
}

.steps h3 {
  font-size: 15px;
}

.steps p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--ln-muted);
}

.step-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.why-grid,
.faq-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.why-top {
  display: flex;
  justify-content: space-between;
}

.why-icon {
  color: var(--ln-orange);
}

.why-grid p:last-child,
.faq-card p {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ln-muted);
}

.why-grid h3,
.faq-card h3 {
  margin-top: 48px;
}

.faq-card {
  min-height: 180px;
  color: inherit;
}

.cta {
  padding: 24px 0 48px;
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid var(--ln-border);
  border-top: 2px solid var(--ln-orange);
  background:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 / 48px 48px,
    #101010;
  padding: 36px 40px;
}

.cta-inner p:last-child {
  margin-top: 8px;
  color: var(--ln-muted);
}

.foot {
  padding: 24px 0 48px;
}

.foot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  border: 1px solid var(--ln-border);
  background: #101010;
  padding: 36px;
}

.foot-col {
  display: grid;
  gap: 8px;
  font-size: 13px;
}

.foot-col h4 {
  margin-bottom: 6px;
  color: var(--ln-fg);
}

.foot-col a {
  color: var(--ln-muted);
}

.foot-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  color: var(--ln-muted);
  font-size: 13px;
}

.soc {
  border: 1px solid var(--ln-border);
  padding: 8px 12px;
}

.fab {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 30;
  display: grid;
  gap: 8px;
}

.fab button,
.fab a {
  display: inline-flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1a1a1a;
  color: var(--ln-fg);
  border: 1px solid var(--ln-border);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 1024px) {
  .hero,
  .llms,
  .integrate-grid,
  .gateway-grid,
  .why-grid,
  .faq-grid,
  .cta-inner,
  .foot-bottom {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .hero {
    min-height: auto;
    grid-template-rows: none;
    padding-top: 32px;
  }

  .hero-preview {
    transform: none;
    margin-top: 28px;
    overflow: hidden;
  }

  .nav-links {
    display: none;
  }

  .nav-links.open {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: #0f0f0f;
    border-bottom: 1px solid var(--ln-border);
    padding: 16px 24px 20px;
  }

  .nav-toggle {
    display: inline-flex;
  }

  .why-grid h3,
  .faq-card h3 {
    margin-top: 20px;
  }
}
</style>
