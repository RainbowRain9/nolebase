# Introduction

This document outlines the architectural approach for enhancing MindGuard with the PRD-defined brownfield improvements that complete the “情绪打卡 → AI建议 → 任务执行 → 效果验证” loop while strengthening community safety and SOS coverage. Its primary goal is to guide AI-assisted implementation of the remaining feature work so new capabilities slot cleanly into the existing CloudBase + Dify architecture without breaking current experiences.

**Relationship to Existing Architecture:**
The plan builds on MindGuard’s layered structure (CLAUDE.md) and the v4 PRD scope (docs/prd.md). Where new workflows (treehole moderation hardening, AI micro-suggestion lifecycle, SOS escalation) touch established modules, this document specifies integration contracts so the current TDesign front-end, service layer normalizers, and CloudBase functions remain consistent. When trade-offs arise—e.g., expanding data models vs. keeping migrations lightweight—we favor compatibility with existing schemas and deployment tooling.
