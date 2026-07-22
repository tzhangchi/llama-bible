# LlamaGen Codex 指引与 Skill 贡献指南

这份文档面向维护 LlamaGen 工作区的项目成员和自动化代理。它说明何时、在哪里以及如何更新 `AGENTS.md`，以及何时新增或修改 Codex skill。

## 1. 先判断应该改什么

| 需求 | 放置位置 |
| --- | --- |
| 只在当前任务有效的要求 | 当前任务描述，不写入仓库 |
| 对整个 LlamaGen 工作区长期有效的边界、命令或安全规则 | `.codex/AGENTS.md` |
| 只适用于某个子项目的长期规则 | `<project>/AGENTS.md` |
| 只适用于子项目某个目录的规则 | 对应目录下更近的 `AGENTS.md` |
| 可重复执行、包含步骤或配套脚本的维护流程 | `.codex/skills/<skill-name>/` |
| 一次性的排障记录、临时分支信息或事故时间线 | Issue、任务记录或项目文档，不写入 `AGENTS.md` 或 skill |

简单判断：`AGENTS.md` 回答“在这里工作必须知道什么”，skill 回答“这类任务应该怎样稳定地完成”。如果几条静态规则就能说清楚，不要为了形式新增 skill。

## 2. 当前目录约定

本工作区使用以下布局：

```text
AGENTS.md                         -> .codex/AGENTS.md
.codex/
├── AGENTS.md                    # 工作区级规则的唯一来源
├── CONTRIBUTING.md              # 本指南
└── skills/
    └── maintain-llamagen/
        ├── SKILL.md
        ├── agents/openai.yaml
        ├── references/
        └── scripts/
.agents/skills                   -> ../.codex/skills
```

- 编辑 `.codex/AGENTS.md`，不要把根目录 `AGENTS.md` 替换成另一份副本。
- skill 的源码统一维护在 `.codex/skills/`。
- `.agents/skills` 是 Codex 的项目级发现入口；保持它指向 `.codex/skills`，不要在两处各维护一套 skill。
- 文档和命令使用工作区相对路径，避免写入个人机器的绝对路径。

## 3. 更新 `AGENTS.md`

### 适合写入的内容

- 稳定的仓库职责、所有权和跨项目边界；
- 已验证的开发、测试和本地构建入口；
- 容易误操作的安全限制和生产副作用；
- API、代理、生成物、数据或部署的权威来源；
- 每次处理该范围任务都应执行的检查。

### 不适合写入的内容

- 密钥、环境变量值、客户数据或本地报告；
- 某个任务的临时状态、当前分支名或个人待办；
- 未经本地代码、配置或项目文档验证的猜测；
- 大段历史复盘、实现细节或可以链接到现有文档的内容；
- 只对一个深层目录有效、却被提升到工作区根部的规则。

### 修改步骤

1. 确认影响范围：工作区、某个子项目，还是某个子目录。
2. 从工作区根目录开始，完整阅读到目标目录为止的 `AGENTS.md`、`AGENTS.override.md`、`CLAUDE.md` 或 `.CLAUDE.md`。
3. 用代码、`package.json`、锁文件、现有脚本和项目 README 验证准备写入的事实。
4. 在最接近适用范围的位置做最小修改。更深层的指引优先，不要在多个层级复制同一规则。
5. 如果新增、移除或重新分配子项目，同时更新：
   - `.codex/AGENTS.md` 的 Repository map；
   - `.codex/skills/maintain-llamagen/references/workspace-map.md`；
   - `.codex/skills/maintain-llamagen/scripts/workspace-status.sh` 中的项目列表。
6. 检查链接、命令和目录名，确保缺失项目被明确标成缺失，而不是擅自创建 checkout。
7. 在交付说明中写明事实来源、修改范围和验证结果。

根指引应保持精炼。Codex 默认会合并从仓库根到当前目录的指引，并有总大小限制；细节流程和长篇背景应下沉到 skill 的 `references/`。

## 4. 新增 skill

### 何时值得新增

同时满足以下大部分条件时再创建：

- 任务会重复出现，且有稳定的触发场景；
- 完成任务需要多步判断、领域知识或固定检查；
- 可以复用脚本、参考资料或模板来减少错误；
- 现有 skill 无法通过一个清晰的小扩展覆盖。

如果只是为 `maintain-llamagen` 增加一个维护分支，优先扩展现有 skill 的 `references/playbooks.md`，不要创建名称相近的新 skill。

### 命名和最小结构

- 目录名和 frontmatter 的 `name` 必须相同。
- 名称只使用小写字母、数字和连字符，例如 `audit-public-pages`。
- `SKILL.md` frontmatter 只保留 `name` 和 `description`。
- `description` 必须同时说明“做什么”和“什么时候触发”，并写清不适用的边界。

最小可用结构：

```text
.codex/skills/<skill-name>/
└── SKILL.md
```

按需增加：

```text
agents/openai.yaml   # UI 展示名称、简述和默认提示词
references/          # 仅在特定任务中读取的详细知识
scripts/             # 可重复、可独立验证的确定性工具
assets/              # 输出会直接复用的模板或资源
```

不要在 skill 内添加独立的 `README.md`、安装指南或变更日志；使用说明写进 `SKILL.md`，详细资料放进 `references/`。

### 创建步骤

1. 先读 `skill-creator` 的完整说明，并确认没有可复用的现有 skill。
2. 使用 `skill-creator` 提供的 `init_skill.py` 初始化目录，不要手工复制旧 skill：

   ```bash
   python "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/init_skill.py" \
     <skill-name> \
     --path .codex/skills \
     --resources references,scripts \
     --interface 'display_name=<Display Name>' \
     --interface 'short_description=<One-line description>' \
     --interface 'default_prompt=Use $<skill-name> to <desired outcome>.'
   ```

   只声明实际需要的资源目录；不需要脚本时去掉 `scripts`。
3. 把 `SKILL.md` 写成祈使式操作流程，并将触发条件集中写进 `description`。
4. 保持主文件短小。较长的仓库清单、API 约定和排障矩阵放入 `references/`，并从 `SKILL.md` 直接链接。
5. 脚本必须支持安全的只读或 dry-run 用法；任何部署、上传、消息发送、数据库迁移等外部副作用都必须继续要求用户明确授权。
6. 运行并验证每个脚本的典型路径和至少一个失败路径。
7. 用 `quick_validate.py` 验证 skill，然后从一个符合 `description` 的真实提示词测试能否正确触发。

### 修改已有 skill

1. 完整阅读现有 `SKILL.md` 及本次改动直接引用的文件。
2. 保持原有触发边界，除非任务明确要求扩大或缩小范围。
3. 行为、脚本参数或目录结构变化时，同步更新 `SKILL.md`、相关 reference 和 `agents/openai.yaml`。
4. 删除已经失效的重复说明，不要让新旧流程并存。
5. 重新执行新建 skill 的全部相关验证。

## 5. 新子项目接入工作区

项目加入 LlamaGen 伞形工作区时：

1. 确认它是独立 Git 仓库、父仓库的一部分，还是仅有目录占位。
2. 读取该项目已有的本地指引，不要覆盖来自项目自身的约定。
3. 核实 remote、默认分支、包管理器、锁文件、开发端口和最小验证命令。
4. 更新 `.codex/AGENTS.md`、`workspace-map.md` 和 `workspace-status.sh`。
5. 如果项目经由主站代理接入，同时更新 `llamagen.ai/next.config.js` 和 `.codex/skills/maintain-llamagen/references/local-development.md`，记录端口、origin 变量、rewrite 阶段与路由范围。
6. 如果项目使用主应用数据库，它的 `prisma/schema.prisma` 只能是 `llamagen.ai/prisma/schema.prisma` 的消费副本，不能成为第二个 schema 或 migration 源头。
7. 只有项目确实存在长期专属规则时，才新增 `<project>/AGENTS.md`。
8. 只有项目带来了可重复且独立的维护流程时，才新增 skill；通常先扩展 `maintain-llamagen`。
9. 不要在接入过程中自动部署、迁移、上传、推送或创建缺失仓库。

维护现有跨项目关系时遵循两个同步约定：

- `llamagen.ai/next.config.js` 中的本地 origin、端口、rewrite 阶段或路由范围发生变化时，同步更新 `local-development.md`，并通过端口 3000 验证一条代表性集成路由。
- 主数据库结构只能先改 `llamagen.ai/prisma/schema.prisma`。源文件评审通过后，再完整复制到明确受影响的消费仓库；禁止在副本里先改字段、模型或 migration。

## 6. 验证清单

在工作区根目录执行与改动有关的检查：

```bash
# 查看所有已知子项目状态，确认没有误改其他仓库
.codex/skills/maintain-llamagen/scripts/workspace-status.sh

# 检查根入口仍指向唯一来源
test "$(readlink AGENTS.md)" = ".codex/AGENTS.md"
test "$(readlink .agents/skills)" = "../.codex/skills"

# 根 AGENTS.md 应保持在默认合并预算内
test "$(wc -c < .codex/AGENTS.md)" -le 32768

# 验证修改过的 skill
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" \
  .codex/skills/<skill-name>

# 校验 shell 脚本语法；再以安全参数实际运行
bash -n .codex/skills/<skill-name>/scripts/<script>.sh

# 查看主 Prisma schema 与已知消费副本的漂移；同步任务完成后可加 --check
.codex/skills/maintain-llamagen/scripts/schema-copy-status.sh

# 检查当前根仓库和每个受影响子仓库
git status --short -- .codex .agents AGENTS.md
git -C <project> status --short
```

提交前再确认：

- 没有密钥、环境文件值、客户数据或机器专属绝对路径；
- 没有未经验证的命令、端口、仓库职责或部署结论；
- 没有重复维护 `.codex/skills` 和 `.agents/skills`；
- 没有顺带修改无关子仓库；
- 所有跳过的测试和未执行的外部副作用都已说明。

## 7. 交付说明模板

```text
范围：更新了哪个层级的 AGENTS.md，或新增/修改了哪个 skill
依据：用于验证职责、命令和边界的代码或项目文档
改动：文件列表及关键行为变化
验证：实际执行的命令与结果
未执行：部署、上传、迁移、推送等明确未运行的动作
后续：仍需同步的子项目或尚未确认的所有权问题
```

相关官方规范：

- [AGENTS.md 项目指引](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex skills 创建与发现](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI Codex 仓库中的 `.codex` 示例](https://github.com/openai/codex/tree/main/.codex)
