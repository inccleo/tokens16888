<template>
  <div class="terminal-container dash">
    <aside class="dash-side">
      <div class="dash-brand">
        <img :src="logo" alt="" class="dash-logo" />
        <span class="dash-brand-name">{{ siteName }}</span>
      </div>
      <div class="dash-tabs">
        <span class="dash-tab is-active">{{ t('home.preview.board') }}</span>
        <span class="dash-tab">{{ t('home.preview.agent') }}</span>
      </div>
      <nav class="dash-nav">
        <span class="is-active"><Icon name="grid" size="xs" />{{ t('home.preview.console') }}</span>
        <span><Icon name="key" size="xs" />{{ t('home.preview.apiKeys') }}</span>
        <span><Icon name="beaker" size="xs" />{{ t('home.preview.tasks') }}</span>
        <span><Icon name="chartBar" size="xs" />{{ t('home.preview.usage') }}</span>
        <span><Icon name="creditCard" size="xs" />{{ t('home.preview.billing') }}</span>
        <span><Icon name="bolt" size="xs" />{{ t('home.preview.activity') }}</span>
      </nav>
      <div class="dash-user">
        <p>{{ t('home.preview.demoUser') }}</p>
        <p class="dash-user-credits">36155.97 {{ t('home.preview.credits') }}</p>
      </div>
    </aside>

    <div class="dash-main">
      <div class="dash-banner">
        <div>
          <p class="dash-banner-title">{{ t('home.preview.supportTitle') }}</p>
          <p class="dash-banner-desc">{{ t('home.preview.supportDesc') }}</p>
        </div>
        <span class="dash-banner-link">{{ t('home.navLanding.apiDocs') }}</span>
      </div>

      <div class="dash-range">
        <span class="is-active">{{ t('home.preview.today') }}</span>
        <span>{{ t('home.preview.yesterday') }}</span>
        <span>{{ t('home.preview.days7') }}</span>
        <span>{{ t('home.preview.days30') }}</span>
      </div>

      <div class="dash-metrics">
        <article v-for="card in metricCards" :key="card.label">
          <p>{{ card.label }}</p>
          <div class="dash-metric-row">
            <strong>{{ card.value }}</strong>
            <svg viewBox="0 0 120 36" class="dash-spark" aria-hidden="true">
              <polyline
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                points="0,30 12,28 24,26 36,22 48,24 60,16 72,18 84,10 96,12 108,6 120,4"
              />
            </svg>
          </div>
          <small v-if="card.delta">{{ card.delta }} {{ t('home.preview.vsLast') }}</small>
        </article>
      </div>

      <div class="dash-charts">
        <section>
          <header>
            <h4>{{ t('home.preview.spendTrend') }}</h4>
            <p>{{ t('home.preview.total') }}：18.44 {{ t('home.preview.credits') }}</p>
          </header>
          <div class="dash-bars">
            <span v-for="(h, i) in barHeights" :key="i" :style="{ height: h + '%' }" />
          </div>
        </section>
        <section>
          <header>
            <h4>{{ t('home.preview.callDist') }}</h4>
            <p>{{ t('home.preview.total') }}：95</p>
          </header>
          <div class="dash-donut-wrap">
            <svg viewBox="0 0 36 36" class="dash-donut" aria-hidden="true">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#2a2a2a" stroke-width="5" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#f26a2e"
                stroke-width="5"
                stroke-dasharray="41 87"
                stroke-dashoffset="25"
                stroke-linecap="butt"
              />
            </svg>
            <div class="dash-donut-label">
              <strong>39</strong>
            </div>
            <ul>
              <li>gpt-image-2-official <b>39</b></li>
              <li>claude-sonnet-4.5 <b>28</b></li>
              <li>sora-2-pro <b>16</b></li>
            </ul>
          </div>
        </section>
      </div>

      <section class="dash-rank">
        <header>
          <h4>{{ t('home.preview.callRank') }}</h4>
          <p>{{ t('home.preview.total') }}：95</p>
        </header>
        <div v-for="row in ranks" :key="row.name" class="dash-rank-row">
          <span>{{ row.name }}</span>
          <div><i :style="{ width: row.width }" /></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'

defineProps<{
  siteName: string
  logo: string
}>()

const { t } = useI18n()

const barHeights = [28, 36, 32, 48, 70, 52, 86, 64, 40]
const ranks = [
  { name: 'gpt-image-2-official', width: '100%' },
  { name: 'claude-sonnet-4.5', width: '72%' },
  { name: 'sora-2-pro', width: '41%' },
  { name: 'seedream-4.5', width: '31%' }
]

const metricCards = computed(() => [
  { label: t('home.preview.currentBalance'), value: '36155.97' },
  { label: t('home.preview.historicalSpend'), value: '64.02' },
  { label: t('home.preview.requests'), value: '165' },
  { label: t('home.preview.statCount'), value: '42', delta: '180%' },
  { label: t('home.preview.statCredits'), value: '18.44', delta: '256.2%' },
  { label: t('home.preview.tokens'), value: '209,010', delta: '789.7%' }
])
</script>

<style scoped>
.dash {
  display: grid;
  grid-template-columns: 1fr;
  width: calc(100vw - 2rem);
  height: 360px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #101010;
  color: #cfcbc8;
  pointer-events: none;
  user-select: none;
}

.dash-side {
  display: none;
  min-width: 0;
  flex-direction: column;
  background: #0d0d0d;
  padding: 12px;
}

.dash-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.dash-logo {
  height: 18px;
  width: 18px;
  object-fit: contain;
}

.dash-brand-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #f5f5f4;
  text-transform: uppercase;
}

.dash-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 14px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #161616;
}

.dash-tab {
  padding: 5px 0;
  text-align: center;
  font-size: 11px;
}

.dash-tab.is-active {
  background: #f5f5f4;
  color: #111;
}

.dash-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.dash-nav span {
  display: flex;
  height: 36px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
}

.dash-nav span.is-active {
  background: rgba(255, 255, 255, 0.06);
  color: #f5f5f4;
}

.dash-user {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 10px;
  font-size: 11px;
  color: #8a8682;
}

.dash-user-credits {
  margin-top: 4px;
  color: #f26a2e;
}

.dash-main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0) 0 0 / 14px 14px,
    #0f0f0f;
}

.dash-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #161616;
  padding: 10px 12px;
}

.dash-banner-title {
  font-size: 13px;
  color: #f5f5f4;
}

.dash-banner-desc {
  margin-top: 2px;
  font-size: 11px;
  color: #8a8682;
}

.dash-banner-link {
  flex-shrink: 0;
  font-size: 11px;
  color: #8a8682;
}

.dash-range {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.dash-range span {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #161616;
  padding: 4px 10px;
}

.dash-range span.is-active {
  background: #f5f5f4;
  color: #111;
}

.dash-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.dash-metrics article {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141414;
  padding: 8px 10px 6px;
}

.dash-metrics p {
  font-size: 10px;
  color: #8a8682;
}

.dash-metric-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.dash-metrics strong {
  font-size: 18px;
  line-height: 1.1;
  color: #f5f5f4;
  font-variant-numeric: tabular-nums;
}

.dash-spark {
  width: 72px;
  height: 22px;
  color: #d4d0cc;
}

.dash-metrics small {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: #f26a2e;
}

.dash-charts {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 6px;
  min-height: 150px;
}

.dash-charts section,
.dash-rank {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141414;
  padding: 10px;
}

.dash-charts header h4,
.dash-rank header h4 {
  font-size: 13px;
  color: #f5f5f4;
}

.dash-charts header p,
.dash-rank header p {
  margin-top: 2px;
  font-size: 11px;
  color: #8a8682;
}

.dash-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 92px;
  margin-top: 16px;
}

.dash-bars span {
  flex: 1;
  background: #f5f5f4;
}

.dash-donut-wrap {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  position: relative;
}

.dash-donut {
  width: 72px;
  height: 72px;
  transform: rotate(-90deg);
}

.dash-donut-label {
  position: absolute;
  left: 0;
  width: 72px;
  text-align: center;
  font-size: 16px;
  color: #f5f5f4;
}

.dash-donut-wrap ul {
  font-size: 10px;
  color: #8a8682;
}

.dash-donut-wrap li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.dash-donut-wrap b {
  color: #d4d0cc;
  font-weight: 500;
}

.dash-rank-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
}

.dash-rank-row div {
  height: 10px;
  background: #2a2a2a;
}

.dash-rank-row i {
  display: block;
  height: 100%;
  background: #f5f5f4;
}

.dash-rank {
  flex: 1;
  min-height: 0;
}

@media (min-width: 640px) {
  .dash {
    grid-template-columns: 172px minmax(0, 1fr);
    width: min(980px, calc(100vw - 3rem));
    height: 520px;
  }

  .dash-side {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .dash {
    width: 980px;
    height: 699px;
  }
}
</style>
