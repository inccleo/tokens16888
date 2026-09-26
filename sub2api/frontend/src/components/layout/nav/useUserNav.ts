/**
 * useUserNav —— 用户导航数据。
 *
 * 阶段 1 导航拆分：从原 AppSidebar.vue 抽出。
 * - userNavItems：用户端主菜单（含仪表盘）。
 * - personalNavItems：管理员「我的账户」子菜单（不含仪表盘，管理员个人区已有独立仪表盘入口）。
 * 两者共享 buildSelfNavItems 声明，仅仪表盘项不同。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore } from '@/stores'
import { FeatureFlags, makeSidebarFlag } from '@/utils/featureFlags'
import { resolveSiteBillingMode } from '@/utils/siteBillingMode'
import { useBatchImageAccess } from '@/composables/useBatchImageAccess'
import type { NavItem } from './types'
import { applyFeatureFlags } from './types'
import {
  DashboardIcon,
  BookIcon,
  KeyIcon,
  BatchImageIcon,
  ChartIcon,
  ChannelIcon,
  SignalIcon,
  CreditCardIcon,
  RechargeSubscriptionIcon,
  OrderListIcon,
  GiftIcon,
  UsersIcon,
  UserIcon,
  GlobeIcon,
} from './icons'

export function useUserNav() {
  const { t } = useI18n()
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const { canUseBatchImage, refreshBatchImageAccess } = useBatchImageAccess()

  // Public-settings flags go through the registry in utils/featureFlags.ts,
  // which handles the opt-in vs opt-out fallback when settings haven't loaded yet.
  const flagChannelMonitor = makeSidebarFlag(FeatureFlags.channelMonitor)
  const flagPayment = makeSidebarFlag(FeatureFlags.payment)
  const flagAvailableChannels = makeSidebarFlag(FeatureFlags.availableChannels)
  const flagSubscription = makeSidebarFlag(FeatureFlags.subscription)
  const flagAffiliate = makeSidebarFlag(FeatureFlags.affiliate)
  const flagBatchImageAccess = () => canUseBatchImage.value
  const flagModelPlaza = makeSidebarFlag(FeatureFlags.modelPlaza)

  // 购买入口文案随站点计费模式切换：仅充值 → 「充值」，仅订阅 → 「订阅」，否则「充值/订阅」。
  const purchaseNavLabel = computed(() => {
    switch (resolveSiteBillingMode(appStore.cachedPublicSettings)) {
      case 'recharge_only':
        return t('nav.recharge')
      case 'subscription_only':
        return t('nav.subscribe')
      default:
        return t('nav.buySubscription')
    }
  })

  // Custom menu items filtered by visibility=user
  const customMenuItemsForUser = computed(() => {
    const items = appStore.cachedPublicSettings?.custom_menu_items ?? []
    return items
      .filter((item) => item.visibility === 'user')
      .sort((a, b) => a.sort_order - b.sort_order)
  })

  // buildSelfNavItems 构造用户自己的导航项（用户端主菜单和管理员的「我的账户」子菜单共享这组声明）。
  // withDashboard=true 时包含仪表盘（用户端），false 时不含（管理员的个人区已经有独立仪表盘入口）。
  //
  // 条目顺序：密钥 → 用量 → 可用渠道 → 渠道状态 → 订阅/支付 → 兑换/资料。
  // 可用渠道紧挨渠道状态之上，让用户「先看自己能用什么、再看对应状态」。
  function buildSelfNavItems(withDashboard: boolean): NavItem[] {
    const items: NavItem[] = []
    if (withDashboard) {
      items.push({ path: '/console', label: t('nav.dashboard'), icon: DashboardIcon })
    }
    items.push(
      { path: '/console/models', label: t('nav.modelPlaza'), icon: GlobeIcon, featureFlag: flagModelPlaza },
      { path: '/keys', label: t('nav.apiKeys'), icon: KeyIcon },
      { path: '/console/docs', label: t('nav.docs'), icon: BookIcon },
      { path: '/batch-image', label: t('nav.batchImage'), icon: BatchImageIcon, hideInSimpleMode: true, featureFlag: flagBatchImageAccess },
      { path: '/usage', label: t('nav.usage'), icon: ChartIcon, hideInSimpleMode: true },
      { path: '/available-channels', label: t('nav.availableChannels'), icon: ChannelIcon, hideInSimpleMode: true, featureFlag: flagAvailableChannels },
      { path: '/monitor', label: t('nav.channelStatus'), icon: SignalIcon, featureFlag: flagChannelMonitor },
      { path: '/subscriptions', label: t('nav.mySubscriptions'), icon: CreditCardIcon, hideInSimpleMode: true, featureFlag: flagSubscription },
      { path: '/purchase', label: purchaseNavLabel.value, icon: RechargeSubscriptionIcon, hideInSimpleMode: true, featureFlag: flagPayment },
      { path: '/orders', label: t('nav.myOrders'), icon: OrderListIcon, hideInSimpleMode: true, featureFlag: flagPayment },
      { path: '/redeem', label: t('nav.redeem'), icon: GiftIcon, hideInSimpleMode: true },
      { path: '/affiliate', label: t('nav.affiliate'), icon: UsersIcon, hideInSimpleMode: true, featureFlag: flagAffiliate },
      { path: '/profile', label: t('nav.profile'), icon: UserIcon },
      ...customMenuItemsForUser.value.map((item): NavItem => ({
        path: `/custom/${item.id}`,
        label: item.label,
        icon: null,
        iconSvg: item.icon_svg,
      })),
    )
    return items
  }

  // finalizeNav 合并 featureFlag 过滤 + simple 模式过滤。
  function finalizeNav(items: NavItem[]): NavItem[] {
    const visible = applyFeatureFlags(items)
    return authStore.isSimpleMode ? visible.filter((item) => !item.hideInSimpleMode) : visible
  }

  const userNavItems = computed((): NavItem[] => finalizeNav(buildSelfNavItems(true)))
  const personalNavItems = computed((): NavItem[] => finalizeNav(buildSelfNavItems(false)))

  return { userNavItems, personalNavItems, refreshBatchImageAccess }
}
