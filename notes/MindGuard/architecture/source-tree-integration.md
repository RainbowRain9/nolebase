# Source Tree Integration

### Existing Project Structure
```
miniprogram/
├── pages/
├── packages/
├── services/
└── ...
cloudfunctions/
├── checkinRecorder/
├── suggestionOrchestrator/
└── ...
docs/
```

### New File Organization
```
MindGuard/
├── tools/
│   └── mock-sync/          # MockDatasetRegistry 同步脚本
├── miniprogram/
│   ├── services/
│   │   ├── feedback.js       # SuggestionFeedbackService
│   │   ├── taskExecution.js  # TaskExecutionService
│   │   └── mock-registry.js  # MockDatasetRegistry 访问辅助
│   └── utils/
│       └── api-version.js    # 服务层统一附加 apiVersion
├── cloudfunctions/
│   ├── suggestionOrchestrator/
│   │   └── actions/          # 按动作拆分逻辑
│   └── ...
└── docs/
    └── architecture/
        └── brownfield-v2.md  # 本文档
```
- **Guidelines**: 新服务模块遵循现有`kebab-case`命名。云函数逻辑按动作拆分到`actions/`子目录。
