# WeHan 设计系统

> B 端 (才聚江城) + C 端 (WeHan) 统一设计规范

**版本**: 1.0 | **更新时间**: 2026-02-27

---

## 一、设计原则

### 核心原则

| 原则 | 说明 |
|-----|------|
| **一致性** | 全平台视觉语言统一，组件复用 |
| **专业性** | 企业级产品，稳重可靠 |
| **效率** | 减少用户认知负担，快速完成任务 |
| **可访问性** | 对比度 4.5:1+，支持键盘导航 |

### 品牌调性

| 维度 | B 端 (才聚江城) | C 端 (WeHan) |
|-----|----------------|--------------|
| 风格 | 专业、高效、稳重 | 亲和、智能、温暖 |
| 色调 | 蓝色系为主 | 蓝色+橙色点缀 |
| 语言 | 正式、简洁 | 友好、鼓励性 |

---

## 二、色彩系统

### 主色板

```
Primary Blue (主色 - 信任/专业)
├── 50  #E6F4FF   背景、hover
├── 100 #BAE0FF   浅背景
├── 200 #91CAFF   边框
├── 300 #69B1FF   辅助
├── 400 #4096FF   图标
├── 500 #1677FF   主按钮 ← 核心色
├── 600 #0958D9   hover
├── 700 #003EB3   active
├── 800 #002C8C   深色
└── 900 #001D66   标题
```

### 功能色

```
Success (成功)
├── Light #F6FFED  背景
├── Main  #52C41A  图标、标签
└── Dark  #389E0D  文字

Warning (警告)
├── Light #FFFBE6  背景
├── Main  #FAAD14  图标、标签
└── Dark  #D48806  文字

Error (错误)
├── Light #FFF2F0  背景
├── Main  #FF4D4F  图标、标签
└── Dark  #CF1322  文字

Info (信息)
├── Light #E6F4FF  背景
├── Main  #1677FF  图标、标签
└── Dark  #0958D9  文字
```

### 中性色

```
Gray (中性色)
├── 50  #FAFAFA   页面背景
├── 100 #F5F5F5   区域背景
├── 200 #E8E8E8   边框
├── 300 #D9D9D9   分割线
├── 400 #BFBFBF   禁用边框
├── 500 #8C8C8C   占位符
├── 600 #595959   辅助文字
├── 700 #434343   正文
├── 800 #262626   标题
└── 900 #1F1F1F   深色标题
```

### CSS 变量

```css
:root {
  /* 主色 */
  --primary-50: #E6F4FF;
  --primary-500: #1677FF;
  --primary-600: #0958D9;

  /* 功能色 */
  --success-main: #52C41A;
  --warning-main: #FAAD14;
  --error-main: #FF4D4F;
  --info-main: #1677FF;

  /* 中性色 */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #E8E8E8;
  --gray-700: #434343;
  --gray-800: #262626;

  /* 背景 */
  --bg-page: #F0F2F5;
  --bg-card: #FFFFFF;

  /* 文字 */
  --text-primary: #262626;
  --text-secondary: #595959;
  --text-disabled: #BFBFBF;
}
```

---

## 三、字体系统

### 字体家族

```css
/* 中文优先 */
--font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 代码字体 */
--font-family-mono: 'SF Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, monospace;
```

### 字号规范

| 用途 | 字号 | 行高 | 字重 | Tailwind |
|-----|------|-----|------|----------|
| 大标题 | 30px | 38px | 600 | `text-3xl font-semibold` |
| 页面标题 | 24px | 32px | 600 | `text-2xl font-semibold` |
| 区块标题 | 20px | 28px | 500 | `text-xl font-medium` |
| 卡片标题 | 16px | 24px | 500 | `text-base font-medium` |
| 正文 | 14px | 22px | 400 | `text-base` |
| 辅助文字 | 14px | 22px | 400 | `text-sm text-gray-600` |
| 小字 | 12px | 20px | 400 | `text-xs` |

### Ant Design 配置

```typescript
// theme.ts
import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,

    // 颜色
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',

    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
  },
  components: {
    Button: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Input: {
      controlHeight: 32,
    },
    Select: {
      controlHeight: 32,
    },
    Table: {
      headerBg: '#FAFAFA',
      rowHoverBg: '#F5F5F5',
    },
    Card: {
      paddingLG: 24,
    },
  },
}
```

---

## 四、间距系统

### 基础单位

基于 4px 网格系统：

| 名称 | 值 | Tailwind | 用途 |
|-----|---|----------|-----|
| xs | 4px | `p-1` | 图标与文字间距 |
| sm | 8px | `p-2` | 紧凑元素内边距 |
| md | 12px | `p-3` | 表单项间距 |
| lg | 16px | `p-4` | 卡片内边距 |
| xl | 24px | `p-6` | 页面区块间距 |
| 2xl | 32px | `p-8` | 页面边距 |
| 3xl | 48px | `p-12` | 大区块间距 |

### 布局间距

```
┌─────────────────────────────────────────────────┐
│                    页面 (p-6)                    │
│  ┌───────────────────────────────────────────┐  │
│  │              卡片 (p-4)                    │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │           表单项 (mb-3)              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │           表单项 (mb-3)              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 五、圆角系统

| 名称 | 值 | Tailwind | 用途 |
|-----|---|----------|-----|
| sm | 4px | `rounded-sm` | 小按钮、标签 |
| default | 6px | `rounded` | 按钮、输入框 |
| lg | 8px | `rounded-lg` | 卡片、下拉框 |
| xl | 12px | `rounded-xl` | 大卡片 |
| full | 9999px | `rounded-full` | 头像、圆形按钮 |

---

## 六、阴影系统

```css
/* 卡片阴影 */
--shadow-card: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
               0 1px 6px -1px rgba(0, 0, 0, 0.02),
               0 2px 4px 0 rgba(0, 0, 0, 0.02);

/* 悬浮阴影 */
--shadow-hover: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
                0 6px 16px 0 rgba(0, 0, 0, 0.08),
                0 9px 28px 8px rgba(0, 0, 0, 0.05);

/* 弹窗阴影 */
--shadow-modal: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
                0 3px 6px -4px rgba(0, 0, 0, 0.12),
                0 9px 28px 8px rgba(0, 0, 0, 0.05);
```

**Tailwind 对应**:
- 卡片: `shadow-sm`
- 悬浮: `shadow-md`
- 弹窗: `shadow-lg`

---

## 七、组件规范

### 7.1 按钮

| 类型 | 样式 | 使用场景 |
|-----|------|---------|
| Primary | 蓝色填充 `bg-primary text-white` | 主要操作、提交 |
| Default | 白色填充 `bg-white border` | 次要操作、取消 |
| Dashed | 虚线边框 | 添加新项 |
| Text | 无边框 | 链接式按钮 |
| Link | 蓝色文字 | 跳转链接 |

**尺寸**:
```tsx
// 大按钮
<Button size="large" className="h-10 px-6 text-base">

// 默认按钮
<Button className="h-8 px-4 text-sm">

// 小按钮
<Button size="small" className="h-6 px-3 text-xs">
```

### 7.2 表单

```tsx
// 标准表单项
<Form.Item
  label={<span className="text-gray-700">岗位名称</span>}
  name="title"
  rules={[{ required: true, message: '请输入岗位名称' }]}
>
  <Input placeholder="请输入" className="h-8" />
</Form.Item>

// 标签对齐方式
<Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
```

### 7.3 表格

```tsx
// 标准表格配置
<Table
  columns={columns}
  dataSource={data}
  pagination={{
    current: page,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  }}
  rowKey="id"
  className="bg-white rounded-lg"
/>
```

**表格列宽度**:
- 序号: 60px
- 状态: 80px
- 操作: 120-180px
- 日期: 120px
- 其他: auto

### 7.4 卡片

```tsx
// 标准卡片
<Card
  title={<span className="font-medium">标题</span>}
  extra={<a href="#">更多</a>}
  className="rounded-lg shadow-sm"
>
  {content}
</Card>

// 统计卡片
<Card className="text-center">
  <Statistic
    title={<span className="text-gray-600">今日投递</span>}
    value={1234}
    valueStyle={{ color: '#1677FF', fontSize: 28 }}
  />
</Card>
```

### 7.5 状态标签

```tsx
// 岗位状态
<Tag color="default">草稿</Tag>
<Tag color="green">已发布</Tag>
<Tag color="orange">已关闭</Tag>

// 投递状态
<Tag color="blue">待处理</Tag>
<Tag color="cyan">已查看</Tag>
<Tag color="purple">面试中</Tag>
<Tag color="green">已录用</Tag>
<Tag color="red">已拒绝</Tag>

// 审核状态
<Tag color="gold">待审核</Tag>
<Tag color="green">已通过</Tag>
<Tag color="red">已拒绝</Tag>
```

---

## 八、布局规范

### 8.1 页面布局

```
┌────────────────────────────────────────────────────────┐
│                     Header (64px)                       │
├─────────────┬──────────────────────────────────────────┤
│             │                                          │
│   Sider     │              Content                     │
│   (240px)   │           (padding: 24px)                │
│             │                                          │
│             │  ┌────────────────────────────────────┐  │
│             │  │           Page Header              │  │
│             │  │        (mb-6, text-2xl)            │  │
│             │  └────────────────────────────────────┘  │
│             │                                          │
│             │  ┌────────────────────────────────────┐  │
│             │  │           Content Area             │  │
│             │  │         (bg-white, rounded-lg)     │  │
│             │  └────────────────────────────────────┘  │
│             │                                          │
└─────────────┴──────────────────────────────────────────┘
```

### 8.2 响应式断点

| 断点 | 宽度 | 说明 |
|-----|------|-----|
| xs | < 576px | 手机 |
| sm | ≥ 576px | 小屏 |
| md | ≥ 768px | 平板 |
| lg | ≥ 992px | 桌面 |
| xl | ≥ 1200px | 大屏 |
| 2xl | ≥ 1600px | 超大屏 |

### 8.3 栅格系统

```tsx
// 4 列统计卡片
<Row gutter={[16, 16]}>
  <Col xs={12} sm={6}><Card>...</Card></Col>
  <Col xs={12} sm={6}><Card>...</Card></Col>
  <Col xs={12} sm={6}><Card>...</Card></Col>
  <Col xs={12} sm={6}><Card>...</Card></Col>
</Row>

// 主从布局
<Row gutter={16}>
  <Col xs={24} lg={16}><Card>主内容</Card></Col>
  <Col xs={24} lg={8}><Card>侧边栏</Card></Col>
</Row>
```

---

## 九、动效规范

### 9.1 过渡时间

| 类型 | 时长 | 用途 |
|-----|------|-----|
| fast | 150ms | 按钮状态、图标旋转 |
| normal | 200ms | 展开/收起、hover |
| slow | 300ms | 弹窗、抽屉 |

### 9.2 缓动函数

```css
/* 标准缓动 */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 9.3 Tailwind 配置

```tsx
// hover 过渡
<div className="transition-colors duration-200 hover:bg-gray-50">

// 展开动画
<div className="transition-all duration-300 ease-out">
```

---

## 十、图标规范

### 10.1 图标库

统一使用 **@ant-design/icons**，不使用 emoji 作为图标。

```tsx
// 常用图标导入
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
  BankOutlined,
  SolutionOutlined,
  NotificationOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
```

### 10.2 图标尺寸

| 用途 | 尺寸 | Tailwind |
|-----|------|----------|
| 菜单图标 | 16px | `text-base` |
| 按钮图标 | 14px | `text-sm` |
| 标题图标 | 20px | `text-xl` |
| 大图标 | 24px | `text-2xl` |

---

## 十一、页面模板

### 11.1 列表页模板

```tsx
'use client'

import { Table, Card, Button, Input, Select, Space } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

export default function ListPage() {
  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag>{v}</Tag> },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a>删除</a></Space> },
  ]

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-semibold mb-6">页面标题</h1>

      {/* 筛选区 */}
      <Card className="mb-4">
        <Space>
          <Input placeholder="搜索" prefix={<SearchOutlined />} />
          <Select placeholder="状态" style={{ width: 120 }} />
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
          <Button>重置</Button>
        </Space>
      </Card>

      {/* 表格区 */}
      <Card>
        <div className="mb-4">
          <Button type="primary" icon={<PlusOutlined />}>新增</Button>
        </div>
        <Table columns={columns} dataSource={[]} rowKey="id" />
      </Card>
    </div>
  )
}
```

### 11.2 详情页模板

```tsx
'use client'

import { Card, Descriptions, Button, Space, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'

export default function DetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            返回
          </Button>
          <h1 className="text-2xl font-semibold">详情标题</h1>
          <Tag color="blue">状态</Tag>
        </div>
        <Button type="primary" icon={<EditOutlined />}>编辑</Button>
      </div>

      {/* 信息区 */}
      <Card title="基本信息">
        <Descriptions column={2}>
          <Descriptions.Item label="字段1">值1</Descriptions.Item>
          <Descriptions.Item label="字段2">值2</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
```

---

## 十二、开发检查清单

### 每次开发前

- [ ] 确认使用统一的颜色变量
- [ ] 确认使用统一的字号规范
- [ ] 确认使用 Ant Design 组件而非自定义
- [ ] 确认图标来自 @ant-design/icons

### 每次提交前

- [ ] 页面标题使用 `text-2xl font-semibold mb-6`
- [ ] 卡片使用 `rounded-lg shadow-sm`
- [ ] 表格操作列宽度 120-180px
- [ ] 状态使用统一的 Tag 颜色
- [ ] 按钮间距使用 Space 组件
- [ ] 表单项使用 `mb-3` 间距

### 视觉一致性

- [ ] 不使用 emoji 作为图标
- [ ] 不使用行内样式 (style prop)
- [ ] 不使用未定义的颜色值
- [ ] 不混用多种圆角大小

---

## 十三、Skill 技能索引

本项目开发时需参考以下 Skill 文档：

| Skill | 用途 | 关键规则 |
|-------|------|---------|
| **frontend-patterns** | 前端组件模式 | 组件组合、Custom Hooks、状态管理 |
| **backend-patterns** | 后端 API 模式 | Repository 模式、Service 层、RBAC |
| **postgres-patterns** | 数据库优化 | 索引策略、N+1 预防、查询优化 |
| **coding-standards** | 代码规范 | 命名规范、类型安全、不可变模式 |
| **ui-ux-pro-max** | UI/UX 设计 | 本文档的完整规范 |

---

*设计系统版本: 1.0 | 生成时间: 2026-02-27*
