# 火山引擎端到端实时语音大模型 API

## 概述

豆包端到端实时语音大模型 API（Realtime API）支持低延迟、多模式交互，可用于构建语音到语音的对话工具。

- **协议**：仅支持 WebSocket
- **语种**：中文、英语
- **特点**：边发送数据边接收数据的流式交互

## 模型版本

| 功能 | O版本 | O2.0版本 | SC版本 | SC2.0版本 |
|-----|-------|---------|--------|----------|
| 精品音色 | ✅ | ✅ | ❌ | ❌ |
| System Prompt | ✅ | ✅ | ✅ | ✅ |
| 克隆音色1.0 | ❌ | ❌ | ✅ | ❌ |
| 克隆音色2.0 | ❌ | ❌ | ❌ | ✅ |

### 版本差异

**O2.0 vs O版本**：
- 整体能力升级：提升推理能力与语音理解、生成能力
- 唱歌能力增强：引入合规版权曲库
- 热修复能力：支持音频级热修复

**SC2.0 vs SC版本**：
- 角色演绎能力提升：增强角色塑造与拟人化表达
- 角色控制能力增强：完善角色控制指令体系
- 音色克隆能力升级

## 音频格式要求

### 输入音频

| 参数 | 要求 |
|-----|------|
| 格式 | PCM（未压缩）或 Opus |
| 采样率 | 16000 Hz |
| 声道 | 单声道 |
| 位深 | 16 bit (int16) |
| 字节序 | 小端序 |

**Opus 格式配置**：
```json
{
  "asr": {
    "audio_info": {
      "format": "speech_opus",
      "sample_rate": 16000,
      "channel": 1
    }
  }
}
```

### 输出音频

**默认**：OGG 封装的 Opus 音频

**PCM 格式配置**：
```json
// 32bit 位深
{
  "tts": {
    "audio_config": {
      "channel": 1,
      "format": "pcm",
      "sample_rate": 24000
    }
  }
}

// 16bit 位深
{
  "tts": {
    "audio_config": {
      "channel": 1,
      "format": "pcm_s16le",
      "sample_rate": 24000
    }
  }
}
```

## 音色配置

### O版本精品音色

| 音色 ID | 描述 |
|--------|------|
| zh_female_vv_jupiter_bigtts | vv音色，活泼灵动的女声，有很强的分享欲 |
| zh_female_xiaohe_jupiter_bigtts | xiaohe音色，甜美活泼的女声，有明显的台湾口音 |
| zh_male_yunzhou_jupiter_bigtts | yunzhou音色，清爽沉稳的男声 |
| zh_male_xiaotian_jupiter_bigtts | xiaotian音色，清爽磁性的男声 |

**配置方式**：
```json
{
  "tts": {
    "speaker": "zh_female_vv_jupiter_bigtts"
  }
}
```

### SC版本克隆音色

**女性音色**：
- ICL_zh_female_aojiaonvyou_tob（傲娇女友）
- ICL_zh_female_bingjiaojiejie_tob（冰娇姐姐）
- ICL_zh_female_chengshujiejie_tob（成熟姐姐）
- ICL_zh_female_keainvsheng_tob（可爱女生）
- ICL_zh_female_nuanxinxuejie_tob（暖心学姐）
- ICL_zh_female_tiexinnvyou_tob（贴心女友）
- ICL_zh_female_wenrouwenya_tob（温柔文雅）
- ICL_zh_female_wumeiyujie_tob（御魅羽姐）
- ICL_zh_female_xingganyujie_tob（性感御姐）

**男性音色**：
- ICL_zh_male_aiqilingren_tob（爱妻令人）
- ICL_zh_male_aojiaogongzi_tob（傲娇公子）
- ICL_zh_male_aojiaojingying_tob（傲娇精英）
- ICL_zh_male_aomanshaoye_tob（傲慢少爷）
- ICL_zh_male_badaoshaoye_tob（霸道少爷）
- 等...

## System Prompt 配置

### O版本/O2.0版本

```json
{
  "bot_name": "面试官",
  "system_role": "你是一位专业的面试官...",
  "speaking_style": "专业、友好、鼓励性"
}
```

### SC版本/SC2.0版本

```json
{
  "character_manifest": "你是一位资深HR面试官，擅长引导候选人展示真实能力..."
}
```

## WebSocket 事件

### 发送端事件

| Event | 值 | 描述 |
|-------|---|------|
| StartSession | 100 | 建联请求 |
| UpdateConfig | 201 | 更新参数 |
| TaskRequest | 200 | 发送音频数据 |
| FinishSession | 102 | 结束 session |

### 接收端事件

| Event | 值 | 描述 |
|-------|---|------|
| SessionStarted | 150 | 建联成功 |
| SourceSubtitleStart | 650 | 原文开始 |
| SourceSubtitleResponse | 651 | 原文数据 |
| SourceSubtitleEnd | 652 | 原文结束 |
| TranslationSubtitleStart | 653 | 译文开始 |
| TranslationSubtitleResponse | 654 | 译文数据 |
| TranslationSubtitleEnd | 655 | 译文结束 |
| TTSSentenceStart | 350 | TTS 开始 |
| TTSResponse | 352 | TTS 数据 |
| TTSSentenceEnd | 351 | TTS 结束 |
| SessionFinished | 152 | 会话正常结束 |
| SessionFailed | 153 | 会话失败 |

## 鉴权配置

在 WebSocket 建连的 HTTP 请求头中添加：

| Header | 说明 | 示例 |
|--------|------|------|
| X-Api-App-Key | APP ID | 123456789 |
| X-Api-Access-Key | Access Token | your-access-key |
| X-Api-Resource-Id | 资源 ID | volc.service_type.10053 |

## 延迟参考

| 处理环节 | 耗时 (ms) |
|---------|----------|
| 音频采集 | 5 |
| 降噪处理 | 12 |
| 编码延迟 | 8 |
| 网络传输 | 35 |
| 解码播放 | 10 |
| **端到端延迟** | **~70** |

## 应用场景

- 实时语音对话
- AI 电话客服
- 语音面试模拟
- 同声传译
- 语音助手

## 相关链接

- 官方文档: https://www.volcengine.com/docs/6561/1594356
- 控制台: https://console.volcengine.com/speech/app
