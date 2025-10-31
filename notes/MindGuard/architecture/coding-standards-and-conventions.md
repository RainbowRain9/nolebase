# Coding Standards and Conventions
- **Compliance**: 新代码遵循`CLAUDE.md`中定义的代码风格、文件结构和JSDoc注释规范。
- **Critical Rules**: API返回值保持`{ok,data,error}`；云函数支持`apiVersion`；数据库迁移必须向后兼容；敏感数据加密；错误需记录并提供降级处理。
