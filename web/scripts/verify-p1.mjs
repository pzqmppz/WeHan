/**
 * P1 功能验证脚本
 * 验证核心 API 端点和业务逻辑
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// 测试结果收集
const results = {
  passed: [],
  failed: [],
  skipped: []
}

// 辅助函数 - 声明在顶部
let globalResults = null

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()
    return { ok: true, status: response.status, data }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

// 测试用例
const tests = [
  // 1. 开放API - 岗位列表
  {
    name: 'Open Jobs API',
    url: `${BASE_URL}/api/open/jobs`,
    expect: (res) => res.status === 200 && res.data && res.data.success === true,
  },

  // 2. 开放API - 岗位详情（需要有效ID，暂时跳过）
  // {
  //   name: 'Open Job Detail',
  //   url: `${BASE_URL}/api/open/jobs/VALID_ID`,
  //   skip: true,
  // },

  // 3. 认证检查（未登录应返回401或重定向）
  {
    name: 'Auth Protected API (Unauthorized)',
    url: `${BASE_URL}/api/jobs`,
    expect: (res) => res.status === 401 || (res.data && res.data.success === false),
  },
]

async function runTests() {
  console.log('\n========================================')
  console.log('  P1 功能验证测试')
  console.log('========================================\n')

  for (const test of tests) {
    if (test.skip) {
      console.log(`⏭️ SKIP: ${test.name}`)
      results.skipped.push(test.name)
      continue
    }

    process.stdout.write(`🔍 Testing: ${test.name}... `)

    const result = await fetchWithTimeout(test.url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (result.ok) {
      const passed = test.expect(result)
      if (passed) {
        console.log(`✅ PASS`)
        results.passed.push(test.name)
      } else {
        console.log(`❌ FAIL`)
        console.log(`   Response: ${JSON.stringify(result.data).slice(0, 300)}`)
        results.failed.push({ name: test.name, reason: 'Assertion failed' })
      }
    } else {
      console.log(`❌ FAIL`)
      console.log(`   Error: ${result.error}`)
      results.failed.push({ name: test.name, reason: result.error })
    }
  }

  // 输出结果
  console.log('\n========================================')
  console.log('  测试结果汇总')
  console.log('========================================')
  console.log(`✅ Passed: ${results.passed.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  console.log(`⏭️ Skipped: ${results.skipped.length}`)
  console.log(`\n总计: ${results.passed.length + results.failed.length + results.skipped.length} 个测试`)

  if (results.failed.length > 0) {
    console.log('\n❌ 失败的测试:')
    results.failed.forEach(f => {
      console.log(`  - ${f.name}: ${f.reason}`)
    })
    process.exit(1)
  } else {
    console.log('\n✅ 所有测试通过!')
    process.exit(0)
  }
}

// 保存全局结果供外部访问
globalResults = results

runTests().catch(err => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
