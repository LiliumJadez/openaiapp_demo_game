# 🎵 BGM 音频文件目录

## 目录结构

```
public/audio/
├── weather/          # 天气BGM
│   ├── sunny.mp3
│   ├── blood-rain.mp3
│   ├── fog.mp3
│   ├── storm.mp3
│   ├── aurora.mp3
│   ├── eclipse.mp3
│   └── starfall.mp3
└── endings/          # 结局BGM
    ├── descent.mp3
    ├── avarice.mp3
    ├── ascension.mp3
    ├── balance.mp3
    ├── void.mp3
    ├── hoarder.mp3
    ├── devourer.mp3
    ├── corruptor.mp3
    └── moon-secret.mp3
```

## 使用说明

### 添加音频文件

1. 将音频文件（mp3、ogg、wav等）放入对应目录
2. 在配置控制台（http://localhost:3000/config.html）的"🎵 BGM音乐"标签页中配置路径
3. 点击"🎵 应用音频配置"按钮保存

### 路径格式

- **本地文件**：`/audio/weather/sunny.mp3`
- **在线URL**：`https://example.com/music/sunny.mp3`

### 推荐音乐风格

#### 天气BGM（循环播放）
- **sunny** (晴空)：宁静、空灵、环境音乐
- **bloodRain** (血雨)：黑暗、压抑、工业音乐
- **fog** (迷雾)：神秘、悬疑、氛围音乐
- **storm** (风暴)：激烈、紧张、电子音乐
- **aurora** (极光)：梦幻、治愈、合成器音乐
- **eclipse** (日蚀)：诡异、神秘、暗黑环境音乐
- **starfall** (星陨)：史诗、壮丽、交响乐

#### 结局BGM（单次播放）
- **descent** (沉沦)：绝望、堕落、低沉音乐
- **avarice** (贪婪)：疯狂、混乱、快节奏
- **ascension** (觉悟)：升华、神圣、合唱音乐
- **balance** (平衡)：和谐、平静、禅意音乐
- **void** (虚无)：空旷、寂静、极简音乐
- **hoarder** (囤积者)：紧张、压迫、不和谐音乐
- **devourer** (吞噬者)：贪婪、吞噬、恐怖音乐
- **corruptor** (堕落者)：腐败、扭曲、实验音乐
- **moonSecret** (月之秘密)：神秘、启示、空灵音乐

## 音频格式建议

- **格式**：MP3 (兼容性最好) 或 OGG
- **码率**：128-192 kbps（平衡质量和文件大小）
- **长度**：
  - 天气BGM：2-5分钟（会循环播放）
  - 结局BGM：1-3分钟（单次播放）
- **音量**：标准化到 -14 LUFS（避免音量差异过大）

## 获取免费音乐资源

推荐使用无版权音乐网站：
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Incompetech](https://incompetech.com/music/)

## 音频切换机制

- 使用**交叉淡入淡出**技术
- 默认过渡时间：2秒
- 新音乐从0音量淡入，旧音乐同时淡出
- 过渡期间两个音轨同时播放，确保丝滑无缝

## 快捷键

- **M 键**：快速静音/取消静音
- 音量调整可在配置控制台中设置

