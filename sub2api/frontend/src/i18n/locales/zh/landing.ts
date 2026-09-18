export default {
  batchImageGuide: {
    title: '图片批量生成',
    description: '一次提交多条提示词，任务完成后可统一下载图片结果'
  },
  // Home Page
  home: {
    viewOnGithub: '在 GitHub 上查看',
    viewDocs: '查看文档',
    docs: '文档',
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
    dashboard: '控制台',
    login: '登录',
    register: '注册',
    getStarted: '开始使用',
    viewDocsCta: '查看文档',
    goToDashboard: '进入控制台',
    heroEyebrow: 'OpenAI 兼容网关',
    heroTitle: '一个接口以折扣价接通全球顶级模型',
    heroTitleLine1: '一个接口',
    heroTitleLine2: '以折扣价接通全球顶级模型',
    heroSubtitle: '一个密钥，畅用多个 AI 模型',
    heroDescription:
      '通过 {site} 用一套兼容 OpenAI 的接口接入全球主流大模型，覆盖文本、图像、视频与多模态能力；统一密钥、统一计费、统一监控，让团队以更低成本快速把生产级 AI 能力接入自己的产品。',
    promo: {
      text: '{site} 聚合全球顶级模型，一套接口即可接入',
      cta: '立即开始'
    },
    navLanding: {
      modelMarket: '模型市场',
      apiDocs: 'API 文档',
      pricing: '定价',
      resources: '资源',
      support: '支持',
      playground: '在线试用'
    },
    backToTop: '回到顶部',
    contact: '联系我们',
    copied: '已复制',
    tags: {
      subscriptionToApi: '订阅转 API',
      stickySession: '会话保持',
      realtimeBilling: '按量计费'
    },
    // 用户痛点区块
    painPoints: {
      title: '你是否也遇到这些问题？',
      items: {
        expensive: {
          title: '订阅费用高',
          desc: '每个 AI 服务都要单独订阅，每月支出越来越多'
        },
        complex: {
          title: '多账号难管理',
          desc: '不同平台的账号、密钥分散各处，管理起来很麻烦'
        },
        unstable: {
          title: '服务不稳定',
          desc: '单一账号容易触发限制，影响正常使用'
        },
        noControl: {
          title: '用量无法控制',
          desc: '不知道钱花在哪了，也无法限制团队成员的使用'
        }
      }
    },
    // 解决方案区块
    solutions: {
      title: '我们帮你解决',
      subtitle: '简单三步，开始省心使用 AI'
    },
    features: {
      unifiedGateway: '一键接入',
      unifiedGatewayDesc: '获取一个 API 密钥，即可调用所有已接入的 AI 模型，无需分别申请。',
      multiAccount: '稳定可靠',
      multiAccountDesc: '智能调度多个上游账号，自动切换和负载均衡，告别频繁报错。',
      balanceQuota: '用多少付多少',
      balanceQuotaDesc: '按实际使用量计费，支持设置配额上限，团队用量一目了然。'
    },
    // 优势对比
    comparison: {
      title: '为什么选择我们？',
      headers: {
        feature: '对比项',
        official: '官方订阅',
        us: '本平台'
      },
      items: {
        pricing: {
          feature: '付费方式',
          official: '固定月费，用不完也付',
          us: '按量付费，用多少付多少'
        },
        models: {
          feature: '模型选择',
          official: '单一服务商',
          us: '多模型随意切换'
        },
        management: {
          feature: '账号管理',
          official: '每个服务单独管理',
          us: '统一密钥，一站管理'
        },
        stability: {
          feature: '服务稳定性',
          official: '单账号易触发限制',
          us: '多账号池，自动切换'
        },
        control: {
          feature: '用量控制',
          official: '无法限制',
          us: '可设配额、查明细'
        }
      }
    },
    providers: {
      title: '已支持的 AI 模型',
      description: '一个 API，多种选择',
      supported: '已支持',
      soon: '即将推出',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: '更多'
    },
    preview: {
      console: '控制台',
      apiKeys: 'API 密钥',
      usage: '用量',
      billing: '账单',
      demoUser: '演示用户',
      credits: '积分',
      balance: '当前余额',
      requests: '请求次数',
      tokens: '总 Token 数',
      board: '看板',
      agent: '智能体',
      tasks: '任务',
      activity: '活动',
      supportTitle: '服务与支持',
      supportDesc: '模型、账单、API 文档与客服支持集中在同一个控制台。',
      today: '今天',
      yesterday: '昨天',
      days7: '近 7 天',
      days30: '近 30 天',
      currentBalance: '当前余额（积分）',
      historicalSpend: '历史消费（积分）',
      statCount: '统计次数',
      statCredits: '统计额度（积分）',
      vsLast: '较上一周期',
      spendTrend: '消费趋势',
      callDist: '调用分布',
      callRank: '调用排行',
      total: '合计'
    },
    gateway: {
      title: '定义你的 AI API 聚合层',
      subtitle: '把模型能力、成本、密钥、监控与故障切换收敛到统一网关，让团队用一套 OpenAI 兼容接口管理全部 AI 调用。',
      modelIndependence: '模型独立性',
      modelIndependenceDesc: '按编码、推理、速度、成本和上下文选择最优路由，不绑定单一供应商。',
      sovereignAccess: '主权接入',
      openaiCompatible: 'OpenAI 兼容',
      openaiCompatibleDesc: '现有 SDK 一行迁移',
      unifiedBilling: '统一计费',
      unifiedBillingDesc: '所有模型族共享积分余额',
      vendorRouting: '供应商路由',
      vendorRoutingDesc: '按健康状态跨供应商调度',
      dedicatedSupport: '专属支持',
      dedicatedSupportDesc: '文档、充值与客服在同一流程',
      axisCoding: '编码',
      axisReasoning: '推理',
      axisSpeed: '速度',
      axisCost: '成本',
      axisContext: '上下文',
      axisTools: '工具',
      bestRoute: '最优路由',
      lifecycleTitle: '覆盖 API 调用全生命周期',
      sharedControl: '共享控制',
      nodeKey: '密钥',
      nodePrice: '价格',
      nodeRoute: '路由',
      nodeCall: '调用',
      nodeTask: '任务',
      nodeBill: '账单',
      nodeLog: '日志',
      nodeSupport: '支持',
      lifecycleNote: '不只是接入。每次请求都会强化成本、路由与可见性。',
      oneAccount: '{providers} — 一个账户，一张账单'
    },
    llms: {
      kicker: 'llms.txt',
      title: '仅需一行指令，即可在任意 Agent 使用 {site}',
      desc: '复制一段提示词到 CodeX、Claude、Cursor 等任意 Agent，让它立刻读懂 {site} 全部模型和接口，并向其提问。',
      copy: '复制提示词给 AI',
      prompt:
        '请阅读以下 {site} 的文档索引，并基于此回答我的问题：\n\n{docs}\n\n关于 {site}：统一的 AI API 网关，通过 OpenAI 兼容协议提供主流模型 —— 聊天（GPT、Claude、Gemini）、图像、视频、音频，按成功请求计费。\n\n我的问题：如何用 Python 调用聊天接口？'
    },
    models: {
      kicker: '模型',
      title: '热门模型',
      subtitle: '精选各类目顶级模型，几分钟即可开始接入。',
      image: '图像',
      video: '视频',
      chat: '对话',
      viewAll: '查看全部模型',
      savePct: '省 {pct}%'
    },
    integrate: {
      title: '3 分钟快速集成',
      subtitle: '几分钟内即可开始使用数百种 AI 模型',
      step1Title: '注册，创建密钥',
      step1Desc: '注册账户并在仪表板中生成您的专属 API 密钥，无需信用卡即可开始',
      step2Title: '修改配置',
      step2Desc: '将 API 端点更改为本站地址，OpenAI SDK 用户只需修改一行代码',
      step3Title: '开始调用模型',
      step3Desc: '通过统一接口访问 GPT、Claude、Sora 等数百种 AI 模型，即刻开启 AI 之旅',
      getKey: '获取 API 密钥',
      viewDocs: '查看文档',
      tryPlayground: '在线试用'
    },
    why: {
      kicker: '为什么选择 {site}',
      title: '为什么选择 {site}',
      subtitle: '统一平台、透明计价、真人支持，让你专注于产品本身。',
      official: {
        title: '官方直连',
        desc: '聚合官方与认证渠道，链路清晰，告别层层转手。'
      },
      pricing: {
        title: '透明计价',
        desc: '按 token / 按次计费一目了然，方便做成本预测。'
      },
      console: {
        title: '统一控制台',
        desc: '密钥、配额、用量在多模型间统一查看与管理。'
      },
      integrate: {
        title: '快速接入',
        desc: '兼容常见调用格式，示例代码改配置即可跑通。'
      },
      discount: {
        title: '组合折扣',
        desc: '多模型组合与用量阶梯，让规模使用更划算。'
      },
      support: {
        title: '真人支持',
        desc: '集成与账单问题有人跟进，不靠纯机器人。'
      }
    },
    faq: {
      kicker: '常见问题',
      title: '常见问题',
      q1: '这是什么，能提供什么？',
      a1: '这是一个统一的 AI API 网关。通过一套 OpenAI 兼容接口接入多个上游模型，统一密钥、计费和监控，覆盖聊天、图像、视频等多模态能力。',
      q2: '与其他 API 提供商相比，定价如何？',
      a2: '按量付费，无最低月费或隐藏费用。token / 按次计费一目了然，用量上来后可享受阶梯折扣。',
      q3: '如何集成到我的应用？',
      a3: '注册并创建 API 密钥，把 base_url 改成本站地址，即可用现有 OpenAI SDK 开始调用。',
      q4: '为什么不直接用官方供应商？',
      a4: '一个账户、一张账单即可访问多个模型，不用再为 Claude、OpenAI、Google 分别维护密钥和发票。',
      q5: 'API Key 安全吗？',
      a5: '密钥加密存储。你可以随时在控制台生成新密钥或撤销旧密钥。',
      q6: '支持哪些支付方式？能开发票吗？',
      a6: '支持常见在线支付与余额充值。如需发票，请登录后在订单或工单中提交开票信息。'
    },
    // CTA 区块
    cta: {
      kicker: '开始使用',
      title: '准备好开始了吗？',
      description: '开发者信赖 · 聚合全球领先 AI 供应商',
      button: '立即开始'
    },
    footer: {
      allRightsReserved: '保留所有权利。'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key 用量查询',
    subtitle: '输入您的 API Key 以查看实时消费金额与使用状态',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: '查询',
    querying: '查询中...',
    privacyNote: '您的 Key 仅在浏览器本地处理，不会被存储',
    dateRange: '统计范围:',
    dateRangeToday: '今日',
    dateRange7d: '7 天',
    dateRange30d: '30 天',
    dateRange90d: '90 天',
    dateRangeCustom: '自定义',
    apply: '应用',
    used: '已使用',
    detailInfo: '详细信息',
    tokenStats: 'Token 统计',
    dailyDetail: '按日明细',
    modelStats: '模型用量统计',
    // Table headers
    date: '日期',
    model: '模型',
    requests: '请求数',
    inputTokens: '输入 Tokens',
    outputTokens: '输出 Tokens',
    cacheCreationTokens: '缓存创建',
    cacheReadTokens: '缓存读取',
    cacheWriteTokens: '缓存写入',
    totalTokens: '总 Tokens',
    cost: '费用',
    // Status
    quotaMode: 'Key 限额模式',
    walletBalance: '钱包余额',
    // Ring card titles
    totalQuota: '总额度',
    limit5h: '5 小时限额',
    limitDaily: '日限额',
    limit7d: '7 天限额',
    limitWeekly: '周限额',
    limitMonthly: '月限额',
    // Detail rows
    remainingQuota: '剩余额度',
    expiresAt: '过期时间',
    todayExpires: '(今日到期)',
    daysLeft: '({days} 天)',
    usedQuota: '已用额度',
    resetNow: '即将重置',
    subscriptionType: '订阅类型',
    billingType: '计费方式',
    subscriptionExpires: '订阅到期',
    // Usage stat cells
    todayRequests: '今日请求',
    todayInputTokens: '今日输入',
    todayOutputTokens: '今日输出',
    todayTokens: '今日 Tokens',
    todayCacheCreation: '今日缓存创建',
    todayCacheRead: '今日缓存读取',
    todayCost: '今日费用',
    rpmTpm: 'RPM / TPM',
    totalRequests: '累计请求',
    totalInputTokens: '累计输入',
    totalOutputTokens: '累计输出',
    totalTokensLabel: '累计 Tokens',
    totalCacheCreation: '累计缓存创建',
    totalCacheRead: '累计缓存读取',
    totalCost: '累计费用',
    avgDuration: '平均耗时',
    // Messages
    enterApiKey: '请输入 API Key',
    querySuccess: '查询成功',
    queryFailed: '查询失败',
    queryFailedRetry: '查询失败，请稍后重试',
    noDailyUsage: '暂无按日用量数据',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API 安装向导',
    description: '配置您的 Sub2API 实例',
    database: {
      title: '数据库配置',
      description: '连接到您的 PostgreSQL 数据库',
      host: '主机',
      port: '端口',
      username: '用户名',
      password: '密码',
      databaseName: '数据库名称',
      sslMode: 'SSL 模式',
      passwordPlaceholder: '密码',
      ssl: {
        disable: '禁用',
        require: '要求',
        verifyCa: '验证 CA',
        verifyFull: '完全验证'
      }
    },
    redis: {
      title: 'Redis 配置',
      description: '连接到您的 Redis 服务器',
      host: '主机',
      port: '端口',
      username: '用户名（可选）',
      password: '密码（可选）',
      database: '数据库',
      usernamePlaceholder: '默认用户留空',
      passwordPlaceholder: '密码',
      enableTls: '启用 TLS',
      enableTlsHint: '连接 Redis 时使用 TLS（公共 CA 证书）'
    },
    admin: {
      title: '管理员账户',
      description: '创建您的管理员账户',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      passwordPlaceholder: '至少 8 个字符',
      confirmPasswordPlaceholder: '确认密码',
      passwordMismatch: '密码不匹配'
    },
    ready: {
      title: '准备安装',
      description: '检查您的配置并完成安装',
      database: '数据库',
      redis: 'Redis',
      adminEmail: '管理员邮箱'
    },
    status: {
      testing: '测试中...',
      success: '连接成功',
      testConnection: '测试连接',
      installing: '安装中...',
      completeInstallation: '完成安装',
      completed: '安装完成！',
      redirecting: '正在跳转到登录页面...',
      restarting: '服务正在重启，请稍候...',
      timeout: '服务重启时间超出预期，请手动刷新页面。'
    }
  },

  // Common
}
