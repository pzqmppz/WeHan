'use client'

import React from 'react'
import {
  Form, Input, InputNumber, Select, Switch, Button, Space, Card, Divider, Row, Col
} from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { INDUSTRIES, EDUCATION_LEVELS, WUHAN_DISTRICTS } from '@/lib/constants'

const { TextArea } = Input
const { Option } = Select

export interface JobFormValues {
  title: string
  industry?: string
  category?: string
  salaryMin?: number
  salaryMax?: number
  location?: string
  address?: string
  description: string
  requirements?: string
  benefits?: string
  skills: string[]
  educationLevel?: string
  experienceYears?: number
  freshGraduate: boolean
  headcount: number
}

interface JobFormProps {
  initialValues?: Partial<JobFormValues>
  onSubmit: (values: JobFormValues) => Promise<void>
  loading?: boolean
  isEdit?: boolean
}

export default function JobForm({ initialValues, onSubmit, loading, isEdit }: JobFormProps) {
  const [form] = Form.useForm<JobFormValues>()
  const [skillInput, setSkillInput] = React.useState('')

  const handleSubmit = async (values: JobFormValues) => {
    await onSubmit(values)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        freshGraduate: true,
        headcount: 1,
        skills: [],
        ...initialValues,
      }}
    >
      {/* 基本信息 */}
      <Card title="基本信息" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="title"
              label="岗位名称"
              rules={[{ required: true, message: '请输入岗位名称' }]}
            >
              <Input placeholder="如：前端开发工程师" maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="category" label="岗位类别">
              <Select placeholder="选择岗位类别" allowClear>
                <Option value="技术">技术</Option>
                <Option value="产品">产品</Option>
                <Option value="设计">设计</Option>
                <Option value="运营">运营</Option>
                <Option value="市场">市场</Option>
                <Option value="销售">销售</Option>
                <Option value="人事">人事</Option>
                <Option value="财务">财务</Option>
                <Option value="行政">行政</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="industry" label="所属行业">
              <Select placeholder="选择行业" allowClear showSearch>
                {INDUSTRIES.map(industry => (
                  <Option key={industry} value={industry}>{industry}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="headcount" label="招聘人数">
              <InputNumber min={1} max={999} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 薪资地点 */}
      <Card title="薪资与地点" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="最低薪资（元/月）">
              <Form.Item name="salaryMin" noStyle>
                <InputNumber
                  min={0}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="最高薪资（元/月）">
              <Form.Item name="salaryMax" noStyle>
                <InputNumber
                  min={0}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="接受应届生">
              <Form.Item name="freshGraduate" valuePropName="checked" noStyle>
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="location" label="工作区域">
              <Select placeholder="选择工作区域" allowClear showSearch>
                {WUHAN_DISTRICTS.map(district => (
                  <Option key={district} value={district}>{district}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="address" label="详细地址">
              <Input placeholder="如：光谷软件园A区" maxLength={200} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 任职要求 */}
      <Card title="任职要求" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="educationLevel" label="学历要求">
              <Select placeholder="选择学历要求" allowClear>
                {EDUCATION_LEVELS.map(level => (
                  <Option key={level} value={level}>{level}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="experienceYears" label="工作经验（年）">
              <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="requirements" label="任职要求">
          <TextArea
            placeholder="描述任职资格、技能要求等"
            rows={4}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        {/* 技能标签 */}
        <Form.Item label="技能要求">
          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <Form.Item
                        {...restField}
                        name={name}
                        noStyle
                      >
                        <Input
                          style={{ width: 100, border: 'none', background: 'transparent' }}
                          placeholder="技能"
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="text-red-500 cursor-pointer"
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  添加技能
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      {/* 岗位描述 */}
      <Card title="岗位描述" className="mb-4">
        <Form.Item
          name="description"
          label="岗位职责"
          rules={[{ required: true, message: '请输入岗位描述' }]}
        >
          <TextArea
            placeholder="描述岗位职责、工作内容等"
            rows={6}
            showCount
            maxLength={5000}
          />
        </Form.Item>

        <Form.Item name="benefits" label="福利待遇">
          <TextArea
            placeholder="描述福利待遇，如：五险一金、带薪年假、节日福利等"
            rows={3}
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <Space>
          <Button onClick={() => window.history.back()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '创建岗位'}
          </Button>
        </Space>
      </div>
    </Form>
  )
}
