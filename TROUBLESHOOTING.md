# 🐛 故障排除指南

## OpenAI API 连接问题

### 症状
```
APIConnectionError: Connection error.
ENOBUFS
```

### 原因
- 网络连接不稳定
- 并发请求过多
- 防火墙或代理设置问题
- API密钥未正确配置

### 解决方案

#### 1. 检查API密钥配置
确保 `.env` 文件中正确设置了 `OPENAI_API_KEY`:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
JIMENG_API_KEY=your-jimeng-api-key-here
```

#### 2. 检查网络连接
```bash
# 测试OpenAI API连接
curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_API_KEY"
```

#### 3. 使用代理（如果在国内）
在 `.env` 文件中添加代理设置（如果需要）：

```env
HTTP_PROXY=http://your-proxy:port
HTTPS_PROXY=http://your-proxy:port
```

#### 4. 降低请求频率
游戏已经实现了请求队列机制：
- 最多同时3个请求
- 请求间最小间隔300ms
- 自动超时和重试

如果问题仍然存在，可以在 `src/utils/requestQueue.ts` 中调整：

```typescript
private maxConcurrent = 2; // 减少并发数
private minInterval = 500; // 增加间隔
```

#### 5. 使用默认数据（临时方案）
如果API持续失败，游戏会自动使用预设的默认数据：
- 个性化鱼类失败 → 使用模板默认对话和故事
- 图像生成失败 → 显示占位图标
- 不影响游戏核心体验

## 月亮彩蛋问题

### 症状
点击月亮7次后没有触发结局

### 解决方案

#### 1. 确保在正确的天气下
月亮只在以下天气下可见和可点击：
- ☀️ 晴空（sunny）
- 🌌 极光（aurora）

#### 2. 点击位置
月亮位于屏幕右上方，坐标约为 `(canvas.width * 0.8, canvas.height * 0.15)`

点击半径已增大到60像素，应该比较容易点中。

#### 3. 查看控制台日志
打开浏览器开发者工具（F12），查看控制台应该能看到：
- `月亮被点击，当前计数: X`
- `月亮似乎在注视着你... (X/7)`
- 第7次：`触发月之秘密结局！`

#### 4. 手动触发（调试用）
在浏览器控制台中手动执行：

```javascript
// 获取store实例
const store = window.__GAME_STORE__;

// 直接触发月之秘密结局
store.setState({
  phase: 'ending',
  ending: {
    type: 'moonSecret',
    title: '月之秘密',
    narrative: '',
  },
  moonClickCount: 7,
});
```

## 图像生成问题

### 症状
鱼的图像不显示或生成失败

### 检查清单

#### 1. 火山引擎即梦API配置
确保 `.env` 文件中配置了 `JIMENG_API_KEY`:

```env
JIMENG_API_KEY=your-volcano-engine-api-key
```

获取API密钥：https://console.volcengine.com/ark

#### 2. 模型端点
游戏使用以下端点：
- 高级模型：`ep-20251223173306-m5tjd` (seadream-4.5)
- 标准模型：`ep-m-20251015114211-vstns` (seadream-4.0)

确保这些端点在您的火山引擎账户中可用。

#### 3. 图片缓存
- 图片会自动缓存在 IndexedDB 中
- 缓存有效期7天
- 清除缓存：浏览器开发者工具 → Application → IndexedDB → 删除 `imaginary-sea-image-cache`

#### 4. 降级方案
如果图像生成失败，游戏会：
- 显示占位图标（鱼的emoji）
- 不影响游戏进程
- 日志中显示警告

## 结局触发问题

### 症状
业力值达到80但没有触发结局

### 检查点

#### 1. 结局触发时机
结局只在 `makeChoice` 之后检查，即：
- 捕获鱼后
- 选择了"消化"、"收藏"或"放生"
- 处理选择效果后

#### 2. 业力阈值
默认阈值是 **80**，可在配置控制台调整。

#### 3. 优先级
结局检测优先级（从高到低）：
1. 体力耗尽（stamina <= 0）
2. 囤积者（背包连续超载3回合）
3. 吞噬者（消化≥10条善良灵魂）
4. 堕落者（放生≥10条邪恶灵魂）
5. 暴食（gluttony >= 80）
6. 贪婪（greed >= 80）
7. 觉悟（mercy >= 80 且放生≥5条善良灵魂）
8. 平衡（三种业力均衡）

#### 4. 查看当前状态
在浏览器控制台执行：

```javascript
// 查看当前状态
console.log(window.__GAME_STORE__.getState());
```

## 性能问题

### 帧率下降
如果游戏运行缓慢：

1. 关闭浏览器开发者工具
2. 减少粒子数量（在 `LakeScene.tsx` 中修改）
3. 降低画质设置

### 内存占用过高
- 清除图片缓存
- 清除浏览器缓存
- 重启游戏

## 需要帮助？

如果以上方法都无法解决问题，请：

1. 复制完整的错误日志
2. 记录复现步骤
3. 检查浏览器控制台的Network标签页
4. 提供 `.env` 配置（隐藏API密钥）

