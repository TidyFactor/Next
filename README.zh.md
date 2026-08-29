<div align="center">

# tidyfactor-next `v1.4.0`

**基于 Next.js 16、React 19 与 Supabase 的生产级多租户 SaaS 引擎**

[![npm version](https://img.shields.io/npm/v/@tidyfactor/next.svg?style=for-the-badge&color=0284C7)](https://www.npmjs.com/package/@tidyfactor/next)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg?style=for-the-badge)](LICENSE)

[ English ](README.md) • [ العربية ](README.ar.md) • [ فارسی ](README.fa.md) • [ Español ](README.es.md) • [ Português ](README.pt.md) • [ 简体中文 ](README.zh.md) • [ Deutsch ](README.de.md) • [ Français ](README.fr.md)

</div>

---

## ⚡ 快速上手 (Quickstart)

```bash
# 通过 NPX 快速运行
npx @tidyfactor/cli-next
```

或在 AI 编码助手 (*Google Antigravity, Claude Code, Cursor, Codex*) 中调用：
```text
/tidyfactor-next
```

---

## 📋 核心命令矩阵

| 命令 | 目标与产出 | 执行工作流 |
|---|---|---|
| `/brief` | Arquitectura SaaS y aislamiento de inquilinos | `workflows/brief.md` |
| `/init` | Scaffolding de proyecto Next.js App Router estricto | `workflows/init.md` |
| `/tenant` | Aislamiento por tenant_id y Postgres RLS | `workflows/tenant.md` |
| `/auth` | Autenticación segura y RBAC | `workflows/auth.md` |
| `/data` | Capa de datos y mutaciones seguras | `workflows/data.md` |

---

## 📖 完整技术规范与文档

如需查看深层架构设计、完整 JSON Schema 契约和原生代码，请参阅[英文权威技术文档 (README.md)](README.md)。
