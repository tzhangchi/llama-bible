# Laper 与 AI 创作工具 SEO / 收入增长拆解

日期：2026-07-27  
目标：找出最值得 LlamaGen 研究的相似网站，重点解释 Laper 如何进入约 $1,000/天的近期收入区间，并转化为可执行的 SEO、站点结构和商业化方案。

## 1. 执行摘要

Laper 的增长不能归因于“SEO 页面数量多”。它只有约 101 个 sitemap URL，Ahrefs DR 快照只有 9，但通过下列组合进入了近期约 $1,000/天的收入区间：

1. 选择高价值用户：专业编剧、导演、制片人与 writers' room，而不是只服务低付费的 AI 图片尝鲜用户。
2. 销售完整工作流：剧本格式、结构、角色、协作、分镜、制片资产在一个产品中，付费理由比单点生成器更强。
3. 价格覆盖 $20–$400/月，用少量专业用户获得更高 ARPU。
4. SEO 集中在购买意图：`best software`、`alternative`、`vs`、迁移、定价、具体工作任务、产品文档，而不是主要依赖泛资讯和风格词。
5. 首页直接提供“导入剧本或从想法开始”的产品入口；对比页带 UTM，SEO 流量能直接归因到注册和收入。
6. SEO 不是唯一渠道。公开资料还列出 X、newsletter、广告、cold email、Hacker News 与合作；创始人 X 账号约 4 万 followers。因此不能把收入全部算给 SEO。

对 LlamaGen 最重要的结论是：目前 4,198 个 sitemap URL 已经远多于 Laper。下一阶段不应该继续用“页面数量”作为目标，而应该提高高商业意图页面的产品证据、转化能力、归因和客单价。

## 2. “每天 $1,000”是否成立

[TrustMRR 的 Laper 验证数据](https://trustmrr.com/startup/laper)来自 Stripe，最近同步时间为 2026-07-26：

| 指标 | 数值 | 解读 |
| --- | ---: | --- |
| 最近 24 小时收入 | $1,385 | 已经超过 $1,000 |
| 最近 7 天收入 | $7,062 | 平均约 $1,009/天 |
| 最近 30 天收入 | $23,880 | 平均约 $796/天 |
| 当前 MRR | $19,869 | 折合约 $662/天的稳定月度经常性收入 |
| 活跃订阅 | 610 | MRR / 订阅约 $32.57 |
| 最近 30 天收入增幅 | +97% | 处于高速增长期 |

更准确的说法是：Laper 已经达到“最近 7 天约 $1,000/天”的收入速度，但还没有连续 30 天稳定在 $1,000/天。现金收入高于 MRR，可能来自年度预付、套餐升级或新增订阅；不能把单日或 7 日峰值等同于稳定 MRR。

收入增长时间线也很关键：

| 月份 | 验证收入 |
| --- | ---: |
| 2026-04 | $595 |
| 2026-05 | $5,136 |
| 2026-06 | $15,857 |
| 2026-07（截至 26 日） | $19,569 |

Laper 的 Final Draft / WriterDuet 等 alternatives 页面和 `best screenwriting software 2026` 内容主要在 5 月上线，时间上与收入跃升重合。这是强相关信号，但不能证明因果，因为产品、社媒、付费广告、邮件和合作也在同期发挥作用。

## 3. Laper 的网站结构

[Laper sitemap](https://laper.ai/sitemap.xml)约 101 个 URL：

| 页面族 | 数量 | 漏斗作用 |
| --- | ---: | --- |
| Docs | 34 | 长尾发现、产品教育、激活和留存 |
| Blog | 23 | 教程、best、comparison、行业词 |
| Features | 12 | 一个具体工作任务对应一个产品页面 |
| Recent highlights | 12 | 新鲜度、行业观点、案例 |
| Changelog | 7 | 产品可信度与更新信号 |
| Alternatives | 6 | 抢占替代、比较、迁移等购买意图 |
| Authors | 2 | 作者实体与 E-E-A-T 信号 |
| 核心页与 AI 索引文件 | 5 | 首页、编辑器、定价、llms.txt、llms-full.txt |

其完整漏斗可以概括为：

```mermaid
flowchart LR
  A["泛需求：教程 / 行业 / How-to"] --> B["方案评估：Best / Features / Docs"]
  B --> C["购买意图：Alternatives / Vs / Pricing"]
  C --> D["低门槛激活：首页直接开始 / 免费 Junior"]
  D --> E["付费扩张：$20 / $60 / $100 / $400"]
  E --> F["留存：协作 / 制片工作流 / Docs / Changelog"]
```

### 3.1 首页：把产品使用放在第一屏

[Laper 首页](https://laper.ai/)不是纯品牌介绍。第一屏直接让用户选择“修复剧本格式”或“从新想法开始”，并支持添加文件。页面随后展示真实工作区式界面：场景、角色、地点、道具、世界观、beats、storyboard、评论、协作和 AI assistant。

作用：

- 用户不需要先理解所有功能，可以直接开始任务。
- 真实界面证明产品不是一个简单 prompt wrapper。
- 页面展示“从剧本到制作”的完整工作流，支撑较高套餐价格。

### 3.2 Features：从产品实现反推搜索页面

[AI Storyboarding 页面](https://laper.ai/features/ai-storyboarding/)不是泛泛描述“AI 能生成分镜”，而是解释：

- scene 是上下文边界；
- 用户明确的镜头选择不会被 AI 覆盖；
- continuity 可以是硬约束；
- 缺少上一帧时任务会被阻止且不扣 credits；
- shot 与 image 有不同生命周期。

这类“code-backed feature page”同时完成三件事：

1. 覆盖 `AI storyboarding`、`screenplay to storyboard`、`shot list software` 等任务词；
2. 用真实产品约束建立可信度；
3. 向用户解释为什么该产品值得持续订阅，而不是一次性生成。

页面使用自指 canonical，并组合 `TechArticle`、`FAQPage`、`SoftwareApplication`、`Organization` 等结构化数据。检查时发现部分 JSON-LD 类型可能重复输出，应该去重验证，但总体模板思路正确。

### 3.3 Alternatives：最接近收入的 SEO 页面

[Laper vs Final Draft](https://laper.ai/alternatives/final-draft/)的结构远强于常见的薄 comparison 页面：

- 第一屏给出直接结论；
- “Start free”与“View pricing”CTA 带 `utm_source=alternatives` 等参数；
- 按使用场景给出 quick verdict；
- 明确写 Laper 更好的地方，也写 Final Draft 更好的地方；
- 展示实际价格与 5 年 TCO；
- 分析 FDX / Fountain 的导入导出和互操作；
- 提供从竞品迁移到 Laper 的步骤；
- 有 “When NOT to Choose Laper”，主动筛除不合适用户。

这类页面覆盖的不是“了解 AI”的流量，而是已经在选型或准备换工具的人。诚实的反向建议还能提高信任和销售效率。

### 3.4 Blog：优先做决策内容

[Best Screenwriting Software for Writers in 2026](https://laper.ai/blog/2026-05-13-best-screenwriting-software-for-writers-2026/)约 2,500 字，包含：

- Laper、Final Draft、WriterDuet、Celtx 等工具比较；
- feature matrix；
- decision tree；
- strengths / weaknesses；
- `Choose X if...`；
- FAQ；
- “Try Laper Free” CTA。

它不是单纯流量文章，而是一个带产品选择逻辑的销售页。

### 3.5 Docs、llms.txt 与 AI 搜索

[Laper 文档](https://laper.ai/docs/)用 34 个页面覆盖入门、编辑器、故事结构、角色与制作实体、AI assistant、pre-production、协作、账号和 credits。

[llms.txt](https://laper.ai/llms.txt)没有堆营销文案，而是提供可验证的产品事实、核心页面、价格和工作流边界。`robots.txt`还明确允许公开内容被搜索与 AI crawler 发现，仅屏蔽私有应用路由。

Docs 的价值不只是 SEO：

- 降低首次使用成本；
- 让高客单价产品显得完整、可靠；
- 形成从功能页到操作文档的深度内链；
- 为 AI 搜索和引用提供结构化事实。

### 3.6 定价是收入倍增器

[Laper Pricing](https://laper.ai/pricing/)：

| 套餐 | 月价 | 核心角色 |
| --- | ---: | --- |
| Junior | $0 | 激活与试用 |
| Senior | $20 | 个人编剧 |
| Elite | $60 | 高频创作者 |
| Master | $100 | 专业创作与无限项目 |
| Legend | $400 | 高强度团队、专属通道与支持 |

即使平均 MRR / 活跃订阅只有约 $32.57，$100 和 $400 套餐仍显著提高收入上限。它说明达到 $1,000/天不一定需要海量自然流量，更可能需要“有清晰 ROI 的专业用户 + 合理的高阶套餐”。

## 4. 最值得研究的相似网站

| 网站 | 当前收入证据 | SEO / 站点规模 | 最值得学习 | 主要警示 |
| --- | --- | --- | --- | --- |
| [Laper](https://laper.ai/) | $19.9k MRR；最近 7 天约 $1,009/天 | 101 sitemap URL；DR 9 | 高意图集群、完整漏斗、专业定价、文档与迁移页 | 无法证明收入主要来自 SEO；GA 的 16 visitors 明显不可用 |
| [VidAI](https://vid.ai/) | $75.8k MRR；最近 30 天 $53.1k | 11 sitemap URL；DR 40 | 极强社会证明、结果案例、$99/$199/$499 高客单价、affiliate / creator distribution | 首页无 H1、无 JSON-LD，几乎不是内容 SEO 模型 |
| [ComicsAI](https://www.comicsai.org/en) | $351 MRR；最近 30 天 $409 | 当前 sitemap 68 个 canonical URL，并有大量 model / style / format 内链与多语言 | 适合研究程序化页面、模型页、格式页、hreflang | 页面覆盖和 DR 20 没有转化成对应收入；证明 pSEO 数量不等于 PMF |
| [Comic Translator](https://comictranslator.com/) | 快照 MRR $929、123 订阅；收入最后同步时间较旧 | 6 sitemap URL；DR 3 | 一个任务、一个动作；Web/Chrome/Firefox/iOS/Android 多入口 | 客单价约 $7.55，收入天花板较低；结构化数据较弱 |
| [StarVeil](https://starveilai.com/en/compare/llamagen) | 本报告没有可用的当前收入验证 | comparison、use case、公开作品等内容方向 | 正在用“StarVeil vs LlamaGen”拦截 LlamaGen 品牌搜索；页面有 FAQ / SoftwareApplication schema | 流量或页面规模不能替代收入与留存验证 |

### 4.1 VidAI：高收入并不依赖大量 SEO 页面

VidAI 首页没有 H1 和 JSON-LD，sitemap 只有 11 个 URL，但 [TrustMRR 数据](https://trustmrr.com/startup/vidai-llc)显示约 $75.8k MRR。

其增长模型更偏向：

- 100K+ creators、500+ reviews 等密集社会证明；
- 真实频道、播放量和收入结果展示；
- creator / affiliate distribution；
- $99、$199、$499/月的高客单价；
- 无免费试用，用 50% first month offer 直接筛选购买者。

它是一个重要对照：收入增长首先是产品价值、分发和价格问题，SEO 只是可选的放大器。

### 4.2 ComicsAI：最值得用作 pSEO 反例

ComicsAI 有清晰的模型、格式、风格与多语言架构，首页也包含 `Organization`、`WebSite`、`SoftwareApplication` 和 `FAQPage` schema。站内链接覆盖 GPT Image、Stable Diffusion、日漫、韩漫、webtoon 和大量 style 词。

但验证 MRR 只有约 $351。可能原因包括：

- 关键词离付费意图较远；
- 用户把它当作免费/一次性生成器；
- 页面与独特产品能力的绑定不足；
- 低价或弱留存使流量难以转成 MRR。

因此 LlamaGen 不应继续以“模型 × 风格 × 语言”的 URL 数量为主要增长指标。

### 4.3 Comic Translator：窄工具也能形成小而稳定的收入

Comic Translator 只有 6 个 sitemap 页面，首页直接把用户导向：

- 一键网页翻译；
- frame translate；
- 上传工具；
- Chrome / Firefox extension；
- iOS / Android。

它说明单点工具 SEO 的正确方式是把搜索任务直接变成产品动作。不过 $5.99 / $13.99 的价格使其增长上限明显低于 Laper 和 VidAI。

## 5. LlamaGen 当前差距

[LlamaGen sitemap](https://llamagen.ai/sitemap.xml)当前包含 4,198 个 URL。按去除 locale 前缀后的页面族统计：

| 页面族 | URL 数 |
| --- | ---: |
| `/vs` | 1,020 |
| `/blogs` | 789 |
| `/features` | 629 |
| `/ai-video-generator` | 340 |
| `/articles` | 260 |
| `/tools` | 167 |
| `/style` | 166 |
| `/solutions` | 121 |

这意味着 LlamaGen 的主要问题不是内容规模，而是下面四个方面：

### 5.1 高意图页面质量与 canonical 治理

现场检查 [llamagen.ai/vs/dashtoon](https://llamagen.ai/vs/dashtoon)发现：

- canonical 指向 `/vs/dashtoon-vs-llamagen-ai`，但两个 URL 都进入 sitemap；
- 页面有两个 H1；
- 没有 JSON-LD；
- title、H1 与 canonical slug 的表达不完全一致。

这会稀释对比页的信号，也说明 1,020 个 `/vs` URL 的模板治理比继续扩量更紧急。

### 5.2 品牌词防守

StarVeil 已发布 [StarVeil AI vs LlamaGen](https://starveilai.com/en/compare/llamagen)，具备自指 canonical、单 H1、FAQPage、WebPage 和 SoftwareApplication schema。

LlamaGen 应拥有高质量、诚实、可维护的：

- LlamaGen vs StarVeil；
- LlamaGen vs Laper；
- LlamaGen vs ComicsAI；
- LlamaGen vs Dashtoon；
- LlamaGen alternatives；
- 从竞品迁移到 LlamaGen。

这些页面应提供真正的工作流差异、credits 成本、文件迁移、角色一致性测试和适用/不适用场景，而不是批量替换竞品名。

### 5.3 产品事实深度

Laper 的强页面来自具体系统行为。LlamaGen 可以建立相同标准的 “code-backed pages”：

1. 长篇故事到分镜：上下文如何切分，什么信息进入每个 panel。
2. 角色一致性：角色 reference、服装、表情、跨章节约束如何工作。
3. Panel 与页面布局：生成、编辑、重排、导出分别如何处理。
4. Comic-to-video：镜头、运动、时长、音频和失败重试。
5. 漫画翻译与排版：OCR、擦字、翻译、字体、气泡和导出。
6. Credits 与失败退款：哪些任务扣费、失败如何补偿、重试边界。
7. 团队与版本：协作、评论、历史、恢复、权限。

每页都应包含真实 UI、输入与输出、限制条件、FAQ、相关文档、案例和直接开始 CTA。

### 5.4 SEO 到收入的归因

每个模板和竞品页都需要独立 campaign 参数，并记录：

- organic landing；
- signup；
- first successful generation；
- project saved / exported；
- paid conversion；
- 30 / 60 / 90 日留存；
- MRR 与毛利。

核心指标应从“收录页数/流量”升级为：

- 每 1,000 次 organic landing 的激活数；
- 每 1,000 次 organic landing 的 MRR；
- 各页面族的付费转化率；
- 各 landing page cohort 的 30 / 90 日留存；
- 非品牌搜索带来的新增 MRR；
- comparison 页面辅助转化收入。

## 6. 建议的 90 天执行框架

### 第 1–2 周：先修漏斗和测量

- 清理 `/vs` canonical、重复 sitemap URL、双 H1 和 schema 缺失。
- 建立 SEO landing → signup → first generation → paid 的事件链。
- 为 comparison、features、tools、docs 定义独立 campaign / content group。
- 从 4,198 个 URL 中选出带来注册、付费和留存的 20% 页面，停止用总页数判断成败。

### 第 3–6 周：发布 12–20 个“赚钱页”

- 6–8 个真实产品能力页；
- 4–6 个竞品 / alternative / migration 页面；
- 2–4 个 best / cost / workflow decision 页面；
- 同步建立对应 docs，而不是只写 landing page。

推荐优先主题：

1. consistent character across comic panels；
2. novel / script to comic；
3. webtoon production workflow；
4. comic storyboard generator；
5. comic to video；
6. AI manga translation and typesetting；
7. Dashtoon / StarVeil / ComicsAI / Laper alternatives；
8. AI comic generator cost comparison。

### 第 7–12 周：扩张到可复用增长系统

- 建立经用户授权、审核、可 canonical 的公开作品页；
- 把优秀项目转成 case study，展示输入、步骤、结果和用户类型；
- 为高表现页面增加相关模板、docs、pricing 和 CTA 内链；
- 对 SEO landing 运行 CTA、免费额度、定价锚点和案例位置测试；
- 更新 `llms.txt`，补充事实型能力、价格、限制与核心页面；评估是否需要 `ai.txt`。

## 7. 商业化建议

Laper 与 VidAI 的共同点不是 SEO，而是高阶价格：

- Laper：最高 $400/月；
- VidAI：$99 / $199 / $499/月。

如果 LlamaGen 只依赖低价 creator 套餐，即使自然流量很大，也需要更多付费用户才能增加 $30k MRR：

| 平均月收入 / 账号 | 增加 $30k MRR 所需账号 |
| ---: | ---: |
| $29 | 约 1,035 |
| $99 | 约 304 |
| $299 | 约 101 |
| $499 | 约 61 |

建议把 SEO 页面与清晰的用户层级绑定：

- Creator：个人漫画、短篇、低并发；
- Pro：长篇、更多角色、优先生成、商业导出；
- Studio：团队、版本、审批、批量生成、优先支持；
- Enterprise / production：私有资产、SLA、专属额度和工作流。

这不是简单涨价，而是让完整工作流、团队协作和可靠性成为升级理由。

## 8. 最终判断

最应该复制的不是 Laper 的页面外观，而是它的增长结构：

> 真实产品能力 → 高意图搜索页面 → 可归因的免费激活 → 专业套餐 → 文档与协作带来的留存。

最不应该复制的是：

- 只扩充风格、模型和语言组合页；
- 把 comparison 做成竞品名替换模板；
- 用 sitemap URL 数代替收入指标；
- 把最近 7 天的 $1,000/天速度误报为稳定 MRR；
- 在没有 cohort 数据时声称 SEO 是全部增长来源。

对 LlamaGen 来说，正确方向是减少对“更多页面”的依赖，用 20–40 个能证明产品、解释迁移、直接开始任务并可跟踪收入的核心页面，重做从搜索到付费的闭环。

## 数据来源与限制

- [Laper 官网](https://laper.ai/)、[sitemap](https://laper.ai/sitemap.xml)、[定价](https://laper.ai/pricing/)、[文档](https://laper.ai/docs/)、[llms.txt](https://laper.ai/llms.txt)。
- [TrustMRR：Laper](https://trustmrr.com/startup/laper)；支付数据由 Stripe API 验证，但营销渠道和部分档案信息可能由创始人填写。
- [TrustMRR：VidAI](https://trustmrr.com/startup/vidai-llc)、[ComicsAI](https://trustmrr.com/startup/comicsai)、[Comic Translator](https://trustmrr.com/startup/comic-translator)。
- [VidAI](https://vid.ai/)、[ComicsAI](https://www.comicsai.org/en)、[Comic Translator](https://comictranslator.com/)、[StarVeil vs LlamaGen](https://starveilai.com/en/compare/llamagen)。
- Laper 的公开 GA “16 visitors”与收入、订阅规模明显不相容，可能是 GA 配置或 property 范围错误；本报告没有用它计算转化率或 SEO 收入占比。
- 页面数量按 2026-07-27 公开 sitemap 的 `<loc>` 统计；后续会随站点更新变化。
