/**
 * Ant Design 主题配置
 * 遵循 WeHan 设计系统规范
 * @see docs/design-system.md
 */

import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    // 字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,

    // 主色
    colorPrimary: '#1677FF',
    colorPrimaryHover: '#0958D9',
    colorPrimaryActive: '#003EB3',

    // 功能色
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',

    // 背景色
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F0F2F5',
    colorBgElevated: '#FFFFFF',

    // 文字色
    colorText: '#262626',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8C8C8C',
    colorTextQuaternary: '#BFBFBF',

    // 边框
    colorBorder: '#E8E8E8',
    colorBorderSecondary: '#F0F0F0',

    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,

    // 控件高度
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    // 按钮
    Button: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      paddingContentHorizontal: 16,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },

    // 输入框
    Input: {
      controlHeight: 32,
      paddingInline: 12,
    },
    InputNumber: {
      controlHeight: 32,
    },

    // 选择器
    Select: {
      controlHeight: 32,
      optionSelectedBg: '#E6F4FF',
    },

    // 表格
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#262626',
      rowHoverBg: '#F5F5F5',
      borderColor: '#E8E8E8',
      headerSplitColor: '#E8E8E8',
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },

    // 卡片
    Card: {
      paddingLG: 24,
      headerBg: 'transparent',
      headerFontSize: 16,
      headerFontSizeSM: 14,
    },

    // 模态框
    Modal: {
      paddingContentHorizontalLG: 24,
    },

    // 抽屉
    Drawer: {
      paddingLG: 24,
    },

    // 表单
    Form: {
      labelColor: '#595959',
      labelFontSize: 14,
      verticalLabelPadding: '0 0 8px',
    },

    // 标签
    Tag: {
      defaultBg: '#FAFAFA',
      defaultColor: '#595959',
    },

    // 菜单
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#E6F4FF',
      itemSelectedColor: '#1677FF',
      itemHoverBg: '#F5F5F5',
      horizontalItemSelectedColor: '#1677FF',
    },

    // 布局
    Layout: {
      headerBg: '#FFFFFF',
      headerHeight: 64,
      siderBg: '#FFFFFF',
      bodyBg: '#F0F2F5',
    },

    // 面包屑
    Breadcrumb: {
      itemColor: '#8C8C8C',
      lastItemColor: '#262626',
    },

    // 统计
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },

    // 描述列表
    Descriptions: {
      labelBg: '#FAFAFA',
    },

    // 步骤条
    Steps: {
      navArrowColor: '#BFBFBF',
    },

    // 时间线
    Timeline: {
      tailColor: '#E8E8E8',
    },

    // 徽标
    Badge: {
      dotSize: 8,
    },

    // 消息
    Message: {
      contentBg: '#FFFFFF',
    },

    // 通知
    Notification: {
      width: 384,
    },
  },
}

/**
 * Tailwind CSS 与 Ant Design 兼容配置
 */
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F4FF',
          100: '#BAE0FF',
          200: '#91CAFF',
          300: '#69B1FF',
          400: '#4096FF',
          500: '#1677FF',
          600: '#0958D9',
          700: '#003EB3',
          800: '#002C8C',
          900: '#001D66',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          300: '#D9D9D9',
          400: '#BFBFBF',
          500: '#8C8C8C',
          600: '#595959',
          700: '#434343',
          800: '#262626',
          900: '#1F1F1F',
        },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        hover: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        modal: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
}

/**
 * 状态标签颜色映射
 */
export const statusColors = {
  // 岗位状态
  job: {
    DRAFT: 'default',
    PUBLISHED: 'green',
    CLOSED: 'orange',
    ARCHIVED: 'default',
  },
  // 投递状态
  application: {
    PENDING: 'blue',
    VIEWED: 'cyan',
    INTERVIEWING: 'purple',
    OFFERED: 'green',
    REJECTED: 'red',
    WITHDRAWN: 'default',
  },
  // 审核状态
  review: {
    PENDING: 'gold',
    ACTIVE: 'green',
    REJECTED: 'red',
  },
} as const

/**
 * 页面标题样式类名
 */
export const pageStyles = {
  title: 'text-2xl font-semibold mb-6 text-gray-800',
  subTitle: 'text-lg font-medium mb-4 text-gray-700',
  card: 'bg-white rounded-lg shadow-sm',
  filterBar: 'mb-4',
  tableWrapper: 'bg-white rounded-lg shadow-sm',
} as const
