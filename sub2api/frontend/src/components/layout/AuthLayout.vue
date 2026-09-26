<template>
  <main class="auth-frame min-h-[100dvh] bg-[#f5f4ef] text-[#18211f] dark:bg-dark-950 dark:text-gray-100">
    <div class="mx-auto grid min-h-[100dvh] w-full max-w-[1680px] lg:grid-cols-[1.08fr_.92fr]">
      <aside
        class="brand-panel relative hidden min-h-[100dvh] flex-col justify-between overflow-hidden px-10 py-10 text-white lg:flex xl:px-16 xl:py-12 2xl:px-20"
        :aria-label="t('auth.brandPanelLabel')"
      >
        <div class="brand-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
        <div class="brand-glow pointer-events-none absolute inset-0" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center gap-3.5">
          <img src="/brand/16888-mark.svg" alt="" class="h-12 w-12" aria-hidden="true" />
          <div>
            <p class="text-[1.35rem] font-semibold leading-none tracking-[-0.055em]">{{ siteName }}</p>
            <p class="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#b3cec5]">
              {{ t('auth.brandWordmark') }}
            </p>
          </div>
        </div>

        <div class="relative z-10 max-w-[38rem] pb-10 pt-20 xl:pb-14">
          <p class="mb-5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a3c9bd]">
            <span class="h-1.5 w-1.5 rounded-full bg-[#75d7b2] shadow-[0_0_14px_rgba(117,215,178,.7)]"></span>
            {{ t('auth.brandEyebrow') }}
          </p>
          <h1 class="max-w-[12ch] text-balance text-[clamp(2.65rem,4.4vw,4.7rem)] font-semibold leading-[1.06] tracking-[-0.065em]">
            {{ t('auth.brandHeadline') }}
          </h1>
          <p class="mt-6 max-w-[34rem] text-[0.98rem] leading-7 text-[#c1d2cc]">
            {{ t('auth.brandDescription') }}
          </p>

          <ul class="mt-10 grid max-w-[34rem] gap-4 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-5">
            <li v-for="(feature, index) in brandFeatures" :key="feature.title" class="min-w-0">
              <span class="font-mono text-[0.65rem] tabular-nums text-[#83cbb0]">0{{ index + 1 }}</span>
              <p class="mt-2 text-sm font-semibold text-white">{{ feature.title }}</p>
              <p class="mt-1.5 text-xs leading-5 text-[#aebfb9]">{{ feature.description }}</p>
            </li>
          </ul>
        </div>

        <div class="brand-route-art pointer-events-none absolute bottom-[7.6rem] right-[-4rem] hidden w-[30%] max-w-[18rem] opacity-40 xl:block" aria-hidden="true">
          <div class="mb-3 flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94b5aa]">
            <span>{{ t('auth.brandDiagramInput') }}</span>
            <span>{{ t('auth.brandDiagramOutput') }}</span>
          </div>
          <svg viewBox="0 0 360 180" fill="none" class="w-full overflow-visible">
            <path d="M4 34H90C111 34 112 70 134 70H182" stroke="#83CBB0" stroke-opacity=".48" stroke-width="1.5" />
            <path d="M4 90H182" stroke="#83CBB0" stroke-opacity=".76" stroke-width="1.5" />
            <path d="M4 146H90C111 146 112 110 134 110H182" stroke="#83CBB0" stroke-opacity=".48" stroke-width="1.5" />
            <path d="M182 70C204 70 204 90 226 90H354" stroke="#83CBB0" stroke-opacity=".72" stroke-width="1.5" />
            <path d="M182 110C204 110 204 90 226 90" stroke="#83CBB0" stroke-opacity=".72" stroke-width="1.5" />
            <circle cx="8" cy="34" r="3" fill="#83CBB0" />
            <circle cx="8" cy="90" r="3" fill="#83CBB0" />
            <circle cx="8" cy="146" r="3" fill="#83CBB0" />
            <rect x="147" y="55" width="70" height="70" rx="19" fill="#1A3C34" stroke="#83CBB0" stroke-opacity=".68" />
            <path d="M165 78H178C184 78 185 84 191 90H199M165 90H197M165 102H178C184 102 185 96 191 90" stroke="#9CE0C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="354" cy="90" r="3" fill="#83CBB0" />
            <circle cx="226" cy="90" r="2.5" fill="#D5A868" />
          </svg>
          <p class="mt-2 text-right font-mono text-[0.58rem] tracking-[0.14em] text-[#789d90]">16888 / ROUTING LAYER</p>
        </div>

        <div class="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-[0.67rem] text-[#9ab2a9]">
          <span>&copy; {{ currentYear }} {{ siteName }}</span>
          <span class="font-mono tracking-[0.14em]">{{ t('auth.brandFooter') }}</span>
        </div>
      </aside>

      <section class="login-panel relative flex min-h-[100dvh] flex-col justify-center bg-[#f5f4ef] px-6 py-8 sm:px-10 dark:!bg-[#101815] lg:px-12 xl:px-16 2xl:px-20">
        <div class="mx-auto w-full max-w-[27rem]">
          <div class="mb-10 flex items-center gap-3 lg:hidden">
            <img src="/brand/16888-mark.svg" alt="" class="h-11 w-11" aria-hidden="true" />
            <div>
              <p class="text-lg font-semibold tracking-[-0.05em]">{{ siteName }}</p>
              <p class="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-dark-400">
                {{ t('auth.brandWordmark') }}
              </p>
            </div>
          </div>

          <p class="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#497e6d] dark:text-primary-300">
            {{ isAdminEntry ? t('auth.adminPortalLabel') : t('auth.userPortalLabel') }}
          </p>
          <slot />

          <div class="mt-6 text-left text-sm">
            <slot name="footer" />
          </div>

          <div class="mt-10 text-left text-xs text-gray-400 dark:text-dark-500 lg:hidden">
            &copy; {{ currentYear }} {{ siteName }}
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'

const props = withDefaults(defineProps<{ adminEntry?: boolean }>(), { adminEntry: false })
const { t } = useI18n()
const appStore = useAppStore()

const siteName = computed(() => {
  const configuredName = appStore.siteName
  return configuredName && configuredName !== 'Sub2API' ? configuredName : '16888'
})
const currentYear = computed(() => new Date().getFullYear())
const isAdminEntry = computed(() => props.adminEntry)
const brandFeatures = computed(() => [
  { title: t('auth.brandFeatureApiTitle'), description: t('auth.brandFeatureApiDescription') },
  { title: t('auth.brandFeatureUsageTitle'), description: t('auth.brandFeatureUsageDescription') },
  { title: t('auth.brandFeatureControlTitle'), description: t('auth.brandFeatureControlDescription') }
])

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style>
.brand-panel {
  isolation: isolate;
  background: #102b25;
}

.brand-grid {
  background-image:
    linear-gradient(rgba(196, 226, 214, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(196, 226, 214, 0.045) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: linear-gradient(110deg, black 5%, transparent 92%);
}

.brand-glow {
  background:
    radial-gradient(ellipse at 82% 76%, rgba(46, 116, 91, 0.34), transparent 36%),
    radial-gradient(ellipse at 8% 8%, rgba(52, 102, 83, 0.22), transparent 34%);
}

.login-panel {
  background-color: #f5f4ef;
  background-image: radial-gradient(rgba(37, 74, 62, 0.075) 0.7px, transparent 0.7px);
  background-size: 18px 18px;
}

.dark .login-panel {
  background-color: #101815;
  background-image: radial-gradient(rgba(144, 186, 168, 0.075) 0.7px, transparent 0.7px);
}

@media (max-width: 1023px) {
  .login-panel {
    background-image: none;
  }
}
</style>
