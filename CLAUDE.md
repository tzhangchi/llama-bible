❯ cd llamagen.ai
❯ npm run dev

> llamagen.ai@1.0.0 dev
> dotenv -e .env.local next dev --turbo

  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.development.local, .env.local, .env

 ✓ Starting...
 ✓ Ready in 2.7s


 ❯ cd workflow.llamagen.ai
❯ npm run dev

> workflow.llamagen.ai@1.0.4 dev
> next dev --hostname 0.0.0.0 --port 5001

▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:5001
- Network:       http://0.0.0.0:5001
- Environments: .env.local
- Experiments (use with caution):
  · serverActions

✓ Starting...
Failed to benchmark file I/O: No such file or directory (os error 2)
✓ Ready in 3.9s



启动项目的时候，是在 llamagen.ai 里面去启动项目，或者在 llamagen.ai 这个项目里面。

在启动 3000 端口之后，系统会把 /workflows 的前端请求打给当前这个项目。所以你不需要在这个项目里调任何接口，联调的东西都已经处理好了。


## 1) 项目定位

`workflow.llamagen.ai` 是一个以 **Next.js App Router** 为核心的 Workflow 前端应用，主要能力：

- 可视化工作流编辑（React Flow / XYFlow）
- 模版市场（SEO 页面 + 模版详情 + 一键创建 Project）
- 与 LlamaGen 主站后端联动（鉴权、项目 CRUD、积分、分享/发布）
- 大规模多语言 UI（`react-i18next` + `locales/*.json`）

## 2) 架构总览（高层）

- 前端渲染层：`app/**` + `components/**`
- 领域逻辑层：`lib/**`
- 数据资源层：`data/workflow-templates/*.json` + `data/workflow-templates.json`
- 构建/内容流水线：`scripts/**`
- i18n 资源层：`locales/*.json`

当前仓库是 **Workflow 前端主仓**，并非完整后端仓：

- 本仓库内只有少量 API（如 `app/api/workflows/projects/from-template/route.ts`）
- 核心项目后端 API（`/api/workflows/projects*`、分享发布相关接口）依赖外部后端（通常是 `llamagen.ai` 主站）
- 后端源地址由 `WORKFLOW_BACKEND_ORIGIN` 决定（见 `lib/llamagen-backend.ts`、`lib/workflows-projects.ts`）

当前开发环境下还有一个非常重要的联调事实：

- `workflow.llamagen.ai` 前端通常被 `llamagen.ai` 项目代理接入
- 因此前端请求应优先直接使用 **相对路径**
- 不要在本仓重复包装一层本地 chatbot 代理 route，除非明确需要单独 mock 或隔离调试

## 2.1) 外部后端 API 设计归属（重要）

Workflow 的后端 API 设计与实现以 **外部仓库**为准：

- 源码目录：`/Users/terry/code/llamagen.ai/src/`
- 其中 workflow 相关接口通常在：
  - `/Users/terry/code/llamagen.ai/src/app/api/workflows/projects/**`
  - `/Users/terry/code/llamagen.ai/src/app/api/workflows/chatbot/**`
  - `/Users/terry/code/llamagen.ai/src/app/api/chatbot/**`
  - 以及其依赖的 service/core/db 层

本仓（`workflow.llamagen.ai`）的定位是：

- 消费 API 契约（调用、错误处理、只读降级、UI 回显）
- 不定义权限真相，不作为后端模型的 source of truth
- 定义 Chat -> Canvas 的前端事件协议与消息渲染协议
- 不负责 chatbot message 持久化真相，不负责 workflow operation 审计真相

维护约束：

1. 涉及权限、可见性、分享策略的变更，必须先改 `/Users/terry/code/llamagen.ai/src/`。
2. 本仓只做前端联调与兼容逻辑（例如匿名 `access=view` 回退请求）。
3. 若本仓与后端行为不一致，以后端仓实现为准，并及时同步本文档。
4. 对于 Workflow Chatbot：
   - 本仓负责 UI、消息状态、Confirm/Dismiss 交互、Canvas 应用事件
   - 外部后端仓负责 session/message/operation 持久化、feedback 审计、历史回放
5. 当前联调模式下，前端应直接请求相对路径：
   - `/api/workflows/chatbot`
   - `/api/workflows/chatbot/operations/:id/confirm`
   - `/api/workflows/chatbot/messages/:id/feedback`
   - `/api/chatbot/messages/append`
   这些接口的真实实现都在 `llamagen.ai` 项目，不应在本仓重复实现代理层。

推荐联调流程：

1. 先在后端仓完成 API 改动与验证。
2. 再在本仓调整调用参数与 UI 行为。
3. 最后更新 `CLAUDE.md` 的 API 契约说明，记录变更点与风险边界。

后端 Chatbot 设计参考文档：

- `/Users/terry/code/llamagen.ai/src/docs/workflow-chatbot-backend-design.md`

## 2.2) 双项目职责划分（必须清楚）

### `workflow.llamagen.ai` 负责什么

- Workflow 编辑器前端
- Project 页面与模板页面
- Canvas 节点/连线渲染与本地交互
- Chatbot UI、消息展示、Thinking/Thought 状态、Confirm/Dismiss 行为
- Chat -> Canvas 的前端原子操作应用
- 与后端接口的契约消费、错误回显、降级体验

### `llamagen.ai` 负责什么

- 所有 workflow chatbot 真正后端接口
- workflow chat session / message / operation 持久化
- message feedback 落库与工单同步
- operation confirm / reject / applied 审计
- assistant message 的结构化 `meta.operation` 真相
- profile / credits / 鉴权 / workflow project 数据真相

### 哪些改动必须去 `llamagen.ai`

- 新增/修改 chatbot API 返回字段
- message 历史结构变更
- `meta.operation` 持久化与回放
- feedback snapshot / CRM / ticket 同步
- operation 生命周期（suggested / confirmed / applied / rejected / failed）
- 任何 project 权限、session 权限、分享权限变更

### 哪些改动应该留在 `workflow.llamagen.ai`

- Message 卡片 UI
- Thinking / Thought 展示逻辑
- Confirm / Dismiss / Copy / hover time 等交互
- Canvas 响应 `WORKFLOW_CHATBOT_APPLY_EVENT`
- 原子操作在画布上的布局、focus、zoom、collision 处理
- 前端 fallback 兼容逻辑

## 3) 关键目录与职责

### 3.1 `app/`

- `app/workflows/(authenticated)/projects/[projectId]/page.tsx`
  - Project 页面入口
  - 处理登录态与共享访问参数（`access=view|edit`）
- `app/workflows/templates/page.tsx`
  - 模版 SEO 列表页
- `app/workflows/templates/[slug]/page.tsx`
  - 模版详情 SEO 页面
- `app/api/workflows/projects/from-template/route.ts`
  - 一键用模版创建项目（先创建空项目，再 PATCH content）

### 3.2 `components/`

- `components/canvas.tsx`
  - 编辑器核心（nodes/edges 变更、保存、插入模版、任务队列）
- `components/project-page-client.tsx`
  - 项目页客户端数据加载与只读/编辑态控制
- `components/project-share-popover.tsx`
  - 分享弹层 UI（Share/Publish tabs，权限设置、邀请、复制链接）
- `components/top-right.tsx`
  - 顶部操作区（Share 入口、升级/积分）
- `components/chatbot/workflow-chatbot.tsx`
  - Project 右下角聊天助手（使用问题解答 + 操作建议 + 用户确认执行）
  - 直接请求相对路径 chatbot 接口，不在本仓维护后端代理
- `components/chatbot/components/elements/*`
  - 从 `vercel/chatbot` 收敛后的可维护 UI primitives（Conversation/PromptInput/Message 等）
- `components/template-*`
  - 模版封面、预览、使用按钮等

### 3.3 `lib/`

- `lib/workflow-templates.ts`
  - 模版数据读取（优先单文件，其次聚合文件）
- `lib/workflow-templates-page.ts`
  - 模版分页、tag 过滤 URL 构建
- `lib/workflows-projects.ts`
  - 项目列表/详情/创建/更新/删除的后端访问封装
- `lib/llamagen-backend.ts`
  - 获取用户 profile/credits，管理后端源地址
- `lib/i18n/*`
  - i18n 初始化与资源绑定
- `lib/workflow-chatbot.ts`
  - Chatbot 与 Canvas 间的操作事件协议（`WORKFLOW_CHATBOT_APPLY_EVENT`）
- `lib/workflow-chatbot-runtime.ts`
  - Chatbot 前端 runtime 规则层
  - 负责：
    - message 修复
    - output review gate
    - `draftOperation / operation` 分层
    - 从 message 中优先读取结构化 `operation meta`
  - 注意：
    - 文本正则解析 operation 只是 legacy fallback
    - 主协议应该是 message `meta.operation`

### 3.4 `data/`

- `data/workflow-templates/*.json`
  - 单模版源数据（推荐维护方式）
- `data/workflow-templates.json`
  - 聚合结果（脚本生成）

### 3.5 `scripts/`

- `generate-workflow-templates.mjs`
  - 从外部 prompt 仓库/规则生成模版 JSON、封面相关流程
- `compose-workflow-templates.mjs`
  - 汇总单模版为聚合 JSON
- `build-workflow-sitemap-public.mjs`
  - 生成模板站点 sitemap
- `cdn-upload-templates.sh` / `cdn-upload-ultra.sh`
  - 资源上传 CDN

## 4) 核心数据流

### 4.1 Project 打开流程

1. 进入 `/workflows/projects/:id`
2. `ProjectPageClient` 请求 `/api/workflows/projects/:id`
3. 如果普通访问失败，再尝试共享回退 `?access=view`（只读）
4. 将数据注入 `ProjectProvider`，`Canvas` 渲染

> 安全边界：最终是否允许匿名只读，必须由后端数据库权限（`linkPermission`）判定。

### 4.2 Use Template 流程

1. 在模板页/弹层点击 `Use Template`
2. 调用 `app/api/workflows/projects/from-template`
3. route 内：
   - 调用上游 `/api/workflows/projects` 创建空项目
   - 再调用 `/api/workflows/projects/:id` PATCH 写入模板 content（含 version）
4. 前端跳转新建 project

### 4.3 Share / Publish 流程

- UI 在 `project-share-popover.tsx`
- 依赖后端能力：
  - `/api/workflows/projects/:id/share`
  - `/api/workflows/projects/:id/publish`
- 当前仓内主要做 UI 和调用，**权限真相以后端存储为准**

### 4.4 Chatbot 操作确认流程

1. 用户在 `WorkflowChatbot` 输入需求（或点击建议问题）
2. 前端直接请求相对路径 `/api/workflows/chatbot`
3. 实际后端实现位于 `/Users/terry/code/llamagen.ai/src/app/api/workflows/chatbot/route.ts`
4. assistant 返回：
   - 人类可读 `answer`
   - 结构化 `operation` 或 `draftOperation`
   - 历史消息中优先通过 `meta.operation` 回传
5. 用户点击确认后，前端派发 `WORKFLOW_CHATBOT_APPLY_EVENT`
6. `Canvas` 监听该事件并执行节点/连线变更，再复用现有保存链路落库

> 约束：Chatbot 不应直接静默改画布；必须始终先展示建议，再由用户确认执行。

### 4.5 Chatbot 结构化消息协议（当前规范）

对于 assistant message：

- `text`：给用户看的自然语言说明
- `meta.operation`：给前端执行层使用的结构化原子操作

标准原则：

1. 前端执行层优先读取 `meta.operation`
2. assistant 正文不应该承担“可执行协议”的责任
3. `canvas.addNode(...)`、`createNode(...)` 这类正文解析只作为历史兼容 fallback
4. 新能力一律先在后端把 `meta.operation` 存库并从 history 接口返回

示例：

```json
{
  "id": "message_id",
  "role": "assistant",
  "text": "I have the next workflow action ready. Confirm when you want me to apply it.",
  "meta": {
    "operation": {
      "type": "add_text_node",
      "label": "Add a text node",
      "payload": {
        "text": "Draft the story beats for a 4-panel comic.",
        "position": { "x": 120, "y": 80 }
      }
    }
  }
}
```

### 4.6 Chatbot Agent 最佳实践（当前采用）

不要在生成侧过早把规则写满。

当前推荐方式：

1. planner 先轻量产出候选动作或候选回答
2. reviewer 在输出侧做 gate：
   - 是否应进入 `draft`
   - 是否应进入 `ready`
   - 是否只保留 conversational answer
3. 真正高影响动作再进入 Confirm/Dismiss

不要做的事：

- 不要把所有边界条件都提前塞进 prompt 主体
- 不要让 assistant 正文同时承担展示和执行协议
- 不要在本仓重复实现一套 chatbot 后端代理
- 不要让前端正文解析成为唯一执行入口

## 5) 模版系统设计要点

- 模版数据优先单文件读取：`data/workflow-templates/{slug}.json`
- 聚合文件用于批量列表与构建产物
- `coverImage` 在读取时会做路径标准化（`workflow/templates/covers` -> `workflow_templates/covers`）
- 模版页面支持：
  - SEO metadata
  - tag 筛选
  - 分页
  - 推荐内链

## 6) i18n 体系

- 库：`i18next + react-i18next`
- 语言集合：`lib/i18n/config.ts`（en/es/fr/it/ja/ko/de/zh-tw/zh-cn/pt）
- 资源文件：`locales/*.json`
- 规则：
  - key 即英文原文（`keySeparator/nsSeparator` 关闭）
  - 新增 UI 文案必须同步所有语种，至少保证不回退为 key
  - 可使用：
    - `npm run i18n:extract`
    - `npm run i18n:translate`

## 7) 前端状态与编辑器机制

- `ProjectProvider` 管理当前项目上下文
- `Canvas` 内部维护 nodes/edges + 保存节流 + 冲突处理
- `useTaskQueue`（zustand）维护异步生成任务
- 只读态由 `project.readOnly` 控制：
  - 工具栏/保存组件隐藏
  - 节点拖拽和连接能力禁用

## 8) 运行与构建

- 本地开发：`npm run dev`（默认 `:5001`）
- 构建：`npm run build`
- 测试：
  - `npm run test:jest`
  - `npm run test:templates`
- 模版流水线：
  - `npm run templates:sync:awesome`
  - `npm run templates:compose`
  - `npm run templates:seo`
  - `npm run templates:cover:flash31`

## 9) 后续特性开发建议（实践清单）

1. 涉及权限（分享/匿名访问）时：
   - 先明确后端权限模型
   - 前端只做“回显 + 调用 + 降级处理”，不要在前端做权限真相
2. 涉及模版数据结构变更时：
   - 先改单模版 schema
   - 再改 compose 脚本与测试
3. 涉及新文案时：
   - 组件中全部用 `t()`
   - 同步更新所有 locale
4. 涉及 SEO 页改版时：
   - 保持 metadata/JSON-LD/canonical/pagination 同步
5. 涉及编辑器节点能力时：
   - 同步检查 readOnly 行为是否一致

## 10) 当前已知边界与风险

- 核心 Workflow API 不在本仓，联调时容易出现“前端改了但后端未部署”的错觉。
- Chatbot 相关问题排查时，要先分清：
  - 是前端 UI/状态问题（本仓）
  - 还是 message/session/operation 持久化问题（`llamagen.ai`）
- 匿名共享访问是高风险区域：
  - 任何“默认放行”都可能产生越权
  - 必须以后端数据库权限字段作为唯一准入标准。
- 模版数量大（尤其 manga 批量模版）时，页面和弹层需注意分页、筛选、加载性能。

## 11) Chatbot 调试规范

### 11.1 调试时先看哪个仓

如果问题是以下类型，优先看 `workflow.llamagen.ai`：

- 消息没渲染
- Confirm / Dismiss 按钮没反应
- Thinking / Thought UI 顺序不对
- Canvas 没有应用已经确认的前端事件
- 节点 focus / zoom / collision / layout 不理想

如果问题是以下类型，优先看 `llamagen.ai`：

- 刷新后消息状态丢失
- 历史消息没有 `meta.operation`
- session 列表、feedback、operation 状态不正确
- 同样的消息后端返回结构不稳定
- 工单同步或 message feedback 丢失

### 11.2 调试顺序

1. 先确认浏览器发出的相对路径请求是否正确
2. 再确认 `llamagen.ai` 对应接口有没有返回结构化 `operation/meta`
3. 再确认本仓 `WorkflowChatbot` 是否把 `operation meta` 写入本地消息
4. 最后确认 `Canvas` 是否正确消费 `WORKFLOW_CHATBOT_APPLY_EVENT`

### 11.3 当前关键接口真实实现位置

- `/api/workflows/chatbot`
  - `/Users/terry/code/llamagen.ai/src/app/api/workflows/chatbot/route.ts`
- `/api/chatbot/messages/append`
  - `/Users/terry/code/llamagen.ai/src/app/api/chatbot/messages/append/route.ts`
- `/api/workflows/chatbot/messages/[id]/feedback`
  - `/Users/terry/code/llamagen.ai/src/app/api/workflows/chatbot/messages/[id]/feedback/route.ts`
- `/api/workflows/chatbot/operations/[id]/confirm`
  - `/Users/terry/code/llamagen.ai/src/app/api/workflows/chatbot/operations/[id]/confirm/route.ts`

---

如果后续做新模块，建议先在本文件补一节“模块边界 + API 契约 + 测试入口”，避免语义漂移。

## Design Context

### Users

- Primary users: people using AI agents to complete professional-service work.
- Usage context: they arrive with a concrete task and need a fast, reliable starting point.
- Core job to be done: pick a service lane and quickly get to execution-ready deliverables.

### Brand Personality

- Personality keywords: minimal, reliable, execution-focused.
- Emotional goal: users should feel clarity and confidence, not overwhelm.
- Writing tone: plain, direct, low-hype language.

### Aesthetic Direction

- Direction: minimalist and restrained.
- Content focus: deliverables over promises; outcomes over buzzwords.
- Anti-patterns: avoid AI buzzword stacking and marketing-heavy phrasing.

### Design Principles

1. One clear action path: choose lane, start workflow, ship output.
2. Every line must be useful: remove decorative or repeated claims.
3. Show proof of execution: emphasize concrete deliverables.
4. Keep hierarchy calm: minimal visual noise and concise copy blocks.
5. Prefer specificity over slogans in key decision areas.

