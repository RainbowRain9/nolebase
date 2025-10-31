# Testing Strategy
- **Framework**: 引入Jest进行服务层和云函数单元测试。
- **Organization**: 新建`__tests__`目录存放测试文件。
- **Coverage**: 核心流程（情绪闭环、社区守护、SOS）要求测试覆盖率 ≥ 80%。
- **Integration Tests**: 重点测试情绪打卡->建议->任务->周报的端到端链路，以及社区审核->SOS触发的流程。
- **Regression Testing**: 建立自动化回归用例集，确保改动不破坏现有功能。
