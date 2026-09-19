# 阶段 0：现状审计与基础整理

> 配套文档：`docs/user-frontend-redesign-prd.md`
> 审计范围：`sub2api/frontend/`
> 方式：静态代码盘点（不修改任何业务逻辑）
> 状态：路由 / 页面 / API / 权限 / 组件依赖 / 视觉 Token / 旧路径已完成；关键页面截图与移动端问题清单待运行应用后补充。

---

## 0. 核心结论（先读这一段）

1. **布局是"页面内自带"而非"路由级"**：`App.vue` 模板只有 `<RouterView />`，**74 个页面各自 `import AppLayout`**。用户端与管理员端共用同一个 `AppLayout` / `AppHeader` / `AppSidebar`。这正是 PRD 要拆的地方，也决定了阶段 1 的最优做法（见 §6）。
2. **`AppSidebar.vue` 单文件 1105 行**，用 `v-if="isAdmin"` 在 `adminNavItems` 与 `userNavItems` 之间切换——用户导航和管理员导航挤在一个组件里。
3. **权限远比 PRD 假设复杂**：不止 `requiresAdmin`，还有 3 个功能开关（`requiresPayment` / `requiresRiskControl` / `requiresSubscription`）+ **简易模式(simple)** + **后端模式(backend)** 两个全局运行模式。PRD 第 6 节需要补齐这套真实权限模型（见 §4）。
4. **设计 Token 全在 `tailwind.config.js`，`style.css` 里 0 个 CSS 变量**。PRD 规划的 `styles/tokens.css`（CSS 变量层）目前不存在，阶段 6"统一 Token"是净新增工作（见 §5）。
5. **角色只有 `admin` / 非 admin 二元**（`user.role === 'admin'`），没有运营/客服分级——印证 PRD §8.9 的分级建议是净新增需求。
6. **实际路由约 50 条，远多于 PRD IA 表**。多出的部分（OAuth 回调、找回密码、key-usage、custom page、ops、prompt-audit、promo-codes 等）都需要在新 IA 里明确归属，否则重构会迁丢。

---

## 1. 路由 → 页面 全量清单

单文件 `src/router/index.ts`（1028 行，未按 PRD 拆分为 public/user/admin/guards）。

### 1.1 公共 / 免登录（`requiresAuth: false`）

| 路径 | 页面组件 | 备注 |
|---|---|---|
| `/setup` | `setup/SetupWizardView.vue` | 首次部署初始化向导 |
| `/home` | `HomeView.vue` | 落地页 |
| `/login` | `auth/LoginView.vue` | 用户登录 |
| `/register` | `auth/RegisterView.vue` | 注册 |
| `/email-verify` | `auth/EmailVerifyView.vue` | 邮箱验证 |
| `/forgot-password` | `auth/ForgotPasswordView.vue` | 找回密码 |
| `/reset-password` | `auth/ResetPasswordView.vue` | 重置密码 |
| `/auth/callback`（别名 `/auth/oauth/callback`） | `auth/OAuthCallbackView.vue` | 通用 OAuth 回调 |
| `/auth/linuxdo/callback` | `auth/LinuxDoCallbackView.vue` | LinuxDo 登录 |
| `/auth/wechat/callback` | `auth/WechatCallbackView.vue` | 微信登录 |
| `/auth/wechat/payment/callback` | `auth/WechatPaymentCallbackView.vue` | 微信支付回调 |
| `/auth/dingtalk/callback` | `auth/DingTalkCallbackView.vue` | 钉钉登录 |
| `/auth/dingtalk/email-completion` | `auth/DingTalkEmailCompletionView.vue` | 钉钉补邮箱 |
| `/auth/oidc/callback` | `auth/OidcCallbackView.vue` | OIDC 登录 |
| `/key-usage` | `KeyUsageView.vue` | **匿名**按 Key 查用量 |
| `/legal/:documentId` | `public/LegalDocumentView.vue` | 法律条款 |
| `/model-plaza` | `ModelPlazaView.vue` | 模型广场，受开关+可选强制登录+后端模式三重控制 |
| `/payment/result` | `user/PaymentResultView.vue` | 支付结果（免登录，供回调落地） |
| `/payment/stripe` | `user/StripePaymentView.vue` | Stripe 收银台 |
| `/payment/airwallex` | `user/AirwallexPaymentView.vue` | Airwallex 收银台 |
| `/payment/stripe-popup` | `user/StripePopupView.vue` | Stripe 弹窗 |

> 支付类页面 `requiresAuth: false` 是**刻意为之**（第三方回调可能丢失登录态），重构时不可简单改成需登录。

### 1.2 用户端（`requiresAuth: true, requiresAdmin: false`）

| 路径 | 页面组件 | 附加条件 |
|---|---|---|
| `/`（重定向 → `/home`） | — | — |
| `/dashboard` | `user/DashboardView.vue` | |
| `/keys` | `user/KeysView.vue` | |
| `/usage` | `user/UsageView.vue` | |
| `/batch-image`（别名 `/docs/batch-image`） | `user/BatchImageGuideView.vue` | |
| `/redeem` | `user/RedeemView.vue` | 简易模式隐藏 |
| `/affiliate` | `user/AffiliateView.vue` | 分销/邀请返利 |
| `/available-channels` | `user/AvailableChannelsView.vue` | 可用渠道 |
| `/monitor` | `user/ChannelStatusView.vue` | 渠道状态 |
| `/subscriptions` | `user/SubscriptionsView.vue` | `requiresSubscription` + 简易模式隐藏 |
| `/purchase` | `user/PaymentView.vue` | `requiresPayment` |
| `/orders` | `user/UserOrdersView.vue` | `requiresPayment` |
| `/payment/qrcode` | `user/PaymentQRCodeView.vue` | `requiresPayment`（微信二维码） |
| `/profile` | `user/ProfileView.vue` | |
| `/custom/:id` | `user/CustomPageView.vue` | 后台可配置的自定义页面 |

### 1.3 管理员端（`requiresAuth: true, requiresAdmin: true`）

| 路径 | 页面组件 | 附加条件 |
|---|---|---|
| `/admin`（重定向 → `/admin/dashboard`） | — | |
| `/admin/dashboard` | `admin/DashboardView.vue` | |
| `/admin/ops` | `admin/ops/OpsDashboard.vue` | 运营大盘 |
| `/admin/usage` | `admin/UsageView.vue` | |
| `/admin/users` | `admin/UsersView.vue` | |
| `/admin/groups` | `admin/GroupsView.vue` | |
| `/admin/accounts` | `admin/AccountsView.vue` | 上游账号池 |
| `/admin/channels`（→ pricing） | — | |
| `/admin/channels/pricing` | `admin/ChannelsView.vue` | 渠道/定价 |
| `/admin/channels/monitor` | `admin/ChannelMonitorView.vue` | 渠道监控 |
| `/admin/proxies` | `admin/ProxiesView.vue` | 代理池 |
| `/admin/subscriptions` | `admin/SubscriptionsView.vue` | 简易模式隐藏 |
| `/admin/redeem` | `admin/RedeemView.vue` | 简易模式隐藏 |
| `/admin/promo-codes` | `admin/PromoCodesView.vue` | 促销码 |
| `/admin/announcements` | `admin/AnnouncementsView.vue` | 公告 |
| `/admin/plugins` | `admin/PluginsView.vue` | 插件 |
| `/admin/settings` | `admin/SettingsView.vue` | 系统设置 |
| `/admin/audit-logs` | `admin/AuditLogView.vue` | 审计日志 |
| `/admin/risk-control` | `admin/RiskControlView.vue` | `requiresRiskControl` |
| `/admin/prompt-audit` | `features/prompt-audit/PromptAuditView.vue` | `requiresRiskControl` |
| `/admin/affiliates`（→ invites） | — | |
| `/admin/affiliates/invites` | `admin/affiliates/AdminAffiliateInvitesView.vue` | |
| `/admin/affiliates/rebates` | `admin/affiliates/AdminAffiliateRebatesView.vue` | |
| `/admin/affiliates/transfers` | `admin/affiliates/AdminAffiliateTransfersView.vue` | |
| `/admin/orders` | `admin/orders/AdminOrdersView.vue` | `requiresPayment` |
| `/admin/orders/dashboard` | `admin/orders/AdminPaymentDashboardView.vue` | `requiresPayment` |
| `/admin/orders/plans` | `admin/orders/AdminPaymentPlansView.vue` | `requiresPayment` |
| `/:pathMatch(.*)*` | `NotFoundView.vue` | 404 |

### 1.4 存在但无独立路由的 view（迁移需确认归属）

`views/` 下共 85 个 `.vue`，多于路由数。以下为内嵌组件 / Tab / 变体，**不能当成"无用页面"删除**：

- `user/ChannelStatusV1View.vue`、`user/ChannelStatusV2View.vue`（`/monitor` 之外的变体，疑似按配置切换）
- `admin/BackupView.vue`（无 `/admin/backup` 路由，疑似嵌在设置页）
- `admin/settings/*`、`admin/ops/components/*`、`admin/orders/PlanEditDialog.vue` 等子组件
- **待办**：阶段 1 前跑一次"每个 view 是否被 import"的引用检查，确认无孤儿页面被迁丢。

---

## 2. API 模块清单

### 2.1 用户/公共 API（`src/api/*.ts`）
`auth`、`user`、`keys`、`usage`、`modelPlaza`、`payment`、`subscriptions`、`redeem`、`announcements`、`batchImage`、`channelMonitor` / `channelMonitorV2`、`codex`、`passkey`、`totp`、`tokenRefresh`、`setup`、`url`、`client`（axios 基座）、`adminUIRequest`、`index`

### 2.2 管理员 API（`src/api/admin/*.ts`，34 个）
`dashboard`、`ops`、`users`、`userAttributes`、`groups`、`accounts`、`channels`、`channelMonitor`、`channelMonitorTemplate`、`proxies`、`payment`、`promo`、`redeem`、`subscriptions`、`affiliates`、`announcements`、`plugins`、`settings`、`system`、`audit`、`compliance`、`riskControl`、`backup`、`dataManagement`、`scheduledTests`、`errorPassthrough`、`apiKeys`、`cnProviders`、`antigravity`、`gemini`、`grok`、`tlsFingerprintProfile`、`index`

> **结论**：后端能力完备，PRD"保留后端 API、优先前端重构"的前提成立。管理员 API 面（34 个模块）远大于 PRD 原 5.3 的描述，已在 PRD 新第 8 节补齐。

### 2.3 Pinia Stores（`src/stores/*.ts`）
`auth`、`app`、`payment`、`subscriptions`、`announcements`、`onboarding`、`adminSettings`、`adminCompliance`、`index`

- `onboarding` store + `useOnboardingTour` 已存在 → PRD"30 秒建 Key"应复用，不重造。
- `adminCompliance` → 管理员合规确认弹窗（登录后强制 ack），是一个 PRD 未提及的现有机制。

---

## 3. 权限矩阵（真实模型）

### 3.1 路由级 meta 标记

| meta | 含义 | 拦截依据 |
|---|---|---|
| `requiresAuth`（默认 true） | 需登录 | `authStore.isAuthenticated` |
| `requiresAdmin` | 需管理员 | `user.role === 'admin'` |
| `requiresPayment` | 支付功能开启 | `cachedPublicSettings.payment_enabled !== false` |
| `requiresRiskControl` | 风控功能开启 | `risk_control_enabled !== false` |
| `requiresSubscription` | 订阅功能开启 | `subscription_enabled !== false` |

功能开关采用 **fail-closed / opt-out**：仅当设置**成功加载且显式为 false** 才拦截，加载失败视为未知放行（由后端兜底）。

### 3.2 两个全局运行模式（PRD 未覆盖，必须补）

- **简易模式 `runMode === 'simple'`**：额外屏蔽 `/subscriptions`、`/redeem`、`/admin/subscriptions`、`/admin/redeem`，并在导航中 `hideInSimpleMode`。
- **后端模式 `backendModeEnabled`**：非管理员被拦截到 `/login`，仅白名单可访问：`/login`、`/key-usage`、`/setup`、`/payment/result`、`/payment/airwallex`、`/legal`、各 OAuth 回调；`pending-auth` 会话额外放行 `/register`、`/email-verify`。管理员在后端模式下拥有完整访问权。

### 3.3 角色

- 仅 `admin` 与非 admin 二元，无运营/客服分级 → PRD §8.9 分级为净新增。
- 管理员登录后：`/login`、`/register` 已登录会被重定向到 `/admin/dashboard`（普通用户 → `/dashboard`）。PRD 期望的"管理员从用户入口登录进用户端"目前**未实现**，是阶段 1 要改的行为。

### 3.4 安全边界

- 前端守卫 `beforeEach` 仅做体验拦截；`onError` 处理 chunk 加载失败自动 reload。
- PRD"前端守卫不是安全边界、后端独立鉴权"与现状一致。

---

## 4. 用户端 ↔ 管理员端 组件耦合清单

| 共享组件 | 位置 | 耦合情况 | 重构动作 |
|---|---|---|---|
| `AppLayout.vue` | `components/layout/` | 用户端 + 管理员端**共用**；含 `bg-mesh-gradient` 背景、按 `isAdmin` 选 onboarding storageKey | 拆为 `UserLayout` / `AdminLayout`（+ 公共站点 `PublicLayout`） |
| `AppSidebar.vue`（1105 行） | 同上 | `v-if="isAdmin"` 切 `adminNavItems` / `userNavItems`，导航数据、图标、feature-flag 全塞一处 | 按端拆分导航组件与导航数据 |
| `AppHeader.vue` | 同上 | 共用顶部栏 | 拆分或参数化 |
| `AuthLayout.vue` | 同上 | 登录/注册/回调/找回密码等 auth 页共用 | 归入 `PublicLayout` 体系或保留 |
| `TablePageLayout.vue` | 同上 | 管理员表格页通用 | 保留，用于管理员端 |

导航可见性由 feature flag 驱动：`opsMonitoringEnabled`、`paymentEnabled`、`channelMonitorEnabled`、`subscriptionEnabled`、`pluginManagementEnabled`、`riskControlEnabled` 等（`adminSettings` store）+ `hideInSimpleMode`。**拆分导航时必须完整搬迁这些开关逻辑**，否则会出现"功能开着但入口消失"。

---

## 5. 视觉 Token 清单

**Token 现状：全部在 `tailwind.config.js`；`src/style.css`(778 行) 无任何 CSS 变量(`--`)。**

| 类别 | 现值 | 与 PRD 目标 |
|---|---|---|
| `primary`（主强调） | teal 色阶，`500 = #14b8a6` | ✅ 即 16888 青绿，符合 PRD 8.1 |
| `accent` | slate 色阶 50–950 | ⚠️ 与 `dark` **完全重复**，建议合并 |
| `dark` | slate 色阶 50–950（`950 = #020617`） | 深色基底 |
| 渐变 | `gradient-primary`(teal)、`gradient-dark`(slate)、`mesh-gradient`(AppLayout 背景) | ⚠️ PRD 要"减少渐变"，这三个是收敛目标 |
| 阴影 | `glow`/`glow-lg`/`inner-glow`（青绿辉光 `rgba(20,184,166,…)`） | ⚠️ PRD 要"减少玻璃/辉光"，为收敛目标 |
| 动画 | `glow`(呼吸辉光) 等 | 按需保留 |
| 字体 | `sans`(系统栈)、`mono`(ui-monospace…) | ✅ 满足"金额/Token 等宽数字"前提 |
| 圆角 | `borderRadius` 扩展 | 保留 |

**阶段 6 建议**：新建 `styles/tokens.css` 以 CSS 变量沉淀语义 Token（背景/前景/边框/主强调/状态色），Tailwind 主题引用变量，从而支持 PRD 要求的深/浅主题切换；同时合并 `accent`/`dark` 重复项、收敛 `mesh-gradient` 与 `glow` 系。

---

## 6. 旧路径兼容表（现状 → PRD 新 IA）

现有**已生效**的重定向/别名：`/`→`/home`；`/admin`→`/admin/dashboard`；`/admin/channels`→`/pricing`；`/admin/affiliates`→`/invites`；`/auth/callback` 别名 `/auth/oauth/callback`；`/batch-image` 别名 `/docs/batch-image`。

PRD 规划的 `/console/*` 前缀**目前一个都不存在**，阶段 1 需以别名或重定向新增，指向现有路径：

| PRD 新路径 | 现状路径（保留） | 建议迁移方式 |
|---|---|---|
| `/console` | `/dashboard` | 新增 `/console`，`/dashboard` 保留为别名 |
| `/console/models` | `/model-plaza` | 别名（注意登录态与公开态的开关差异） |
| `/console/keys` | `/keys` | 别名 |
| `/console/usage` | `/usage` | 别名 |
| `/console/billing` | `/purchase` | 别名（含 `/payment/*` 子流程保留） |
| `/console/orders` | `/orders` | 别名 |
| `/console/redeem` | `/redeem` | 别名（受简易模式限制） |
| `/console/subscriptions` | `/subscriptions` | 别名（受订阅开关+简易模式限制） |
| `/console/affiliate` | `/affiliate` | 别名 |
| `/console/docs` | `/batch-image`、`/docs/batch-image` | 别名/聚合 |
| `/console/support` | `/available-channels`、`/monitor`、公告 | 聚合入口，需产品确认 |
| `/console/profile` | `/profile` | 别名 |

> 迁移原则：**先加新别名、旧路径不动**，全部外链/书签保持可用；待新 IA 稳定后再决定是否 301。`/key-usage`、`/custom/:id`、`/legal/:documentId`、`/setup`、各 OAuth 回调**保持原路径不进 `/console`**。

---

## 7. 关键页面截图与移动端问题清单（不采集）

**决策（2026-09-19）**：本次为大规模重构，不再对旧前端做视觉/移动端基线验证——旧界面即将被替换，回归基准以新设计为准。移动端质量在新页面按 PRD §9.4 的四断点标准直接达成，不与旧版对比。

静态已识别、需在**新实现**中直接规避的移动端风险（作为设计约束带入，而非验证旧版）：

- 侧边栏在 `<768px` 必须是抽屉/底部导航，不沿用旧 `lg:ml-64` 固定侧栏。
- 管理员表格页（`AccountsView`/`UsersView`/`ChannelMonitorView` 等）窄屏须卡片化或抽屉详情，不以横向滚动为唯一方案。
- 新设计收敛 `mesh-gradient` 与多处 `glow`，同时降低低端机渲染成本。

---

## 8. 阶段 0 验收对照

| PRD 验收项 | 结论 |
|---|---|
| 不修改业务逻辑即可完成全量页面盘点 | ✅ 本审计未改任何逻辑 |
| 确认所有现有用户功能都有新页面归属 | ✅ §6 已给出映射；`support` 聚合项需产品确认；孤儿 view 引用检查列为阶段 1 前置待办 |
| 路由/页面/API/权限矩阵 | ✅ §1–§3 |
| 用户端/管理员端组件依赖清单 | ✅ §4 |
| 视觉 Token 清单 | ✅ §5 |
| 旧路径兼容表 | ✅ §6 |
| 关键页面截图与移动端问题清单 | ➖ 按决策不采集（大重构，旧版不做基线），§7 已转为新实现的移动端设计约束 |

---

## 9. 给阶段 1 的关键约束（审计导出）

1. **优先改为路由级布局**：新增 `meta.layout`（public/user/admin）+ `App.vue` 按 meta 选择 `PublicLayout`/`UserLayout`/`AdminLayout`，避免逐个修改 74 个内嵌 `AppLayout` 的页面。
2. **完整搬迁权限模型**：拆分不能丢 `requiresPayment/RiskControl/Subscription` 三开关、简易模式、后端模式与 feature-flag 导航可见性。
3. **修正登录跳转**：实现"管理员从 `/login` 进用户端、从 `/admin/login` 进管理员端"，同时保留后端模式下的既有拦截。
4. **保留支付回调页的免登录属性**与微信支付中断恢复逻辑。
5. **先加 `/console/*` 别名、旧路径不动**，保证外链不失效。
