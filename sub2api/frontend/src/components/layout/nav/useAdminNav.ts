/**
 * useAdminNav —— 管理员导航数据。
 *
 * 阶段 1 导航拆分：从原 AppSidebar.vue 抽出。包含可折叠分组（渠道 / 安全审计 /
 * 分销 / 订单）、feature-flag 过滤、简易模式下的精简菜单与自定义菜单项。
 * 同时暴露 fetchAdminSettings，供 AdminSidebar 挂载时拉取 feature-gated 开关。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminSettingsStore, useAuthStore } from '@/stores'
import { FeatureFlags, makeSidebarFlag } from '@/utils/featureFlags'
import type { NavItem } from './types'
import { applyFeatureFlags } from './types'
import {
  DashboardIcon,
  ChartIcon,
  UsersIcon,
  FolderIcon,
  ChannelIcon,
  PriceTagIcon,
  SignalIcon,
  CreditCardIcon,
  GlobeIcon,
  PluginIcon,
  BellIcon,
  ServerIcon,
  ShieldIcon,
  TicketIcon,
  GiftIcon,
  OrderIcon,
  KeyIcon,
  CogIcon,
} from './icons'

export function useAdminNav() {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const adminSettingsStore = useAdminSettingsStore()

  const flagChannelMonitor = makeSidebarFlag(FeatureFlags.channelMonitor)
  const flagSubscription = makeSidebarFlag(FeatureFlags.subscription)
  const flagAffiliate = makeSidebarFlag(FeatureFlags.affiliate)
  const flagRiskControl = makeSidebarFlag(FeatureFlags.riskControl)
  const flagPluginManagement = makeSidebarFlag(FeatureFlags.pluginManagement)
  const flagOpsMonitoring = () => adminSettingsStore.opsMonitoringEnabled
  const flagAdminPayment = () => adminSettingsStore.paymentEnabled

  // Custom menu items filtered by visibility=admin
  const customMenuItemsForAdmin = computed(() => {
    return adminSettingsStore.customMenuItems
      .filter((item) => item.visibility === 'admin')
      .sort((a, b) => a.sort_order - b.sort_order)
  })

  const adminNavItems = computed((): NavItem[] => {
    const baseItems: NavItem[] = [
      { path: '/admin/dashboard', label: t('nav.dashboard'), icon: DashboardIcon },
      { path: '/admin/ops', label: t('nav.ops'), icon: ChartIcon, featureFlag: flagOpsMonitoring },
      { path: '/admin/users', label: t('nav.users'), icon: UsersIcon, hideInSimpleMode: true },
      { path: '/admin/groups', label: t('nav.groups'), icon: FolderIcon },
      {
        path: '/admin/channels',
        label: t('nav.channelManagement'),
        icon: ChannelIcon,
        hideInSimpleMode: true,
        expandOnly: true,
        children: [
          { path: '/admin/channels/pricing', label: t('nav.channelPricing'), icon: PriceTagIcon },
          { path: '/admin/channels/monitor', label: t('nav.channelMonitor'), icon: SignalIcon, featureFlag: flagChannelMonitor },
        ],
      },
      // 「仅充值」站点连管理端的「订阅管理」入口也一并收起（路由本身不拦截）。
      { path: '/admin/subscriptions', label: t('nav.subscriptions'), icon: CreditCardIcon, hideInSimpleMode: true, featureFlag: flagSubscription },
      { path: '/admin/accounts', label: t('nav.accounts'), icon: GlobeIcon },
      { path: '/admin/plugins', label: t('nav.plugins'), icon: PluginIcon, featureFlag: flagPluginManagement },
      { path: '/admin/announcements', label: t('nav.announcements'), icon: BellIcon },
      { path: '/admin/proxies', label: t('nav.proxies'), icon: ServerIcon },
      {
        path: '/admin/security-audit',
        label: t('nav.securityAudit'),
        icon: ShieldIcon,
        expandOnly: true,
        featureFlag: flagRiskControl,
        children: [
          { path: '/admin/risk-control', label: t('nav.contentModeration'), icon: ShieldIcon },
          { path: '/admin/prompt-audit', label: t('nav.promptAudit'), icon: ShieldIcon },
        ],
      },
      { path: '/admin/redeem', label: t('nav.redeemCodes'), icon: TicketIcon, hideInSimpleMode: true },
      { path: '/admin/promo-codes', label: t('nav.promoCodes'), icon: GiftIcon, hideInSimpleMode: true },
      {
        path: '/admin/affiliates',
        label: t('nav.affiliateManagement'),
        icon: UsersIcon,
        hideInSimpleMode: true,
        expandOnly: true,
        featureFlag: flagAffiliate,
        children: [
          { path: '/admin/affiliates/invites', label: t('nav.affiliateInviteRecords'), icon: UsersIcon },
          { path: '/admin/affiliates/rebates', label: t('nav.affiliateRebateRecords'), icon: OrderIcon },
          { path: '/admin/affiliates/transfers', label: t('nav.affiliateTransferRecords'), icon: CreditCardIcon },
        ],
      },
      {
        path: '/admin/orders',
        label: t('nav.orderManagement'),
        icon: OrderIcon,
        hideInSimpleMode: true,
        expandOnly: true,
        featureFlag: flagAdminPayment,
        children: [
          { path: '/admin/orders/dashboard', label: t('nav.paymentDashboard'), icon: ChartIcon },
          { path: '/admin/orders', label: t('nav.orderManagement'), icon: OrderIcon },
          { path: '/admin/orders/plans', label: t('nav.paymentPlans'), icon: CreditCardIcon },
        ],
      },
      { path: '/admin/usage', label: t('nav.usage'), icon: ChartIcon },
      { path: '/admin/audit-logs', label: t('nav.auditLogs'), icon: ShieldIcon, hideInSimpleMode: true },
    ]

    const visible = applyFeatureFlags(baseItems)

    // 简单模式下，在系统设置前插入 API 密钥
    if (authStore.isSimpleMode) {
      const filtered = visible.filter((item) => !item.hideInSimpleMode)
      filtered.push({ path: '/keys', label: t('nav.apiKeys'), icon: KeyIcon })
      filtered.push({ path: '/admin/settings', label: t('nav.settings'), icon: CogIcon })
      for (const cm of customMenuItemsForAdmin.value) {
        filtered.push({ path: `/custom/${cm.id}`, label: cm.label, icon: null, iconSvg: cm.icon_svg })
      }
      return filtered
    }

    visible.push({ path: '/admin/settings', label: t('nav.settings'), icon: CogIcon })
    for (const cm of customMenuItemsForAdmin.value) {
      visible.push({ path: `/custom/${cm.id}`, label: cm.label, icon: null, iconSvg: cm.icon_svg })
    }
    return visible
  })

  function fetchAdminSettings() {
    adminSettingsStore.fetch()
  }

  return { adminNavItems, fetchAdminSettings }
}
