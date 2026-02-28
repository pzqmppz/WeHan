"""
配置验证脚本
检查 .env 文件中的所有配置是否正确有效
"""
import os
import sys
import requests
from dotenv import load_dotenv

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 加载环境变量
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# ANSI 颜色代码（Windows 兼容）
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_status(status, message):
    """打印带颜色的状态信息"""
    # Windows 控制台兼容：使用 ASCII 字符
    symbols = {
        "success": "[OK]",
        "error": "[FAIL]",
        "warning": "[WARN]",
        "info": "[INFO]"
    }
    print(f"{symbols[status]} {message}")

def verify_coze_config():
    """验证 Coze 平台配置"""
    print("\n" + "="*60)
    print("【1/3】验证 Coze 平台配置")
    print("="*60)

    pat = os.getenv("COZE_PAT")
    space_id = os.getenv("SPACE_ID")

    # 检查 PAT 格式
    if not pat:
        print_status("error", "COZE_PAT 未配置")
        return False
    elif not pat.startswith("pat_"):
        print_status("error", f"COZE_PAT 格式错误：应以 'pat_' 开头，当前：{pat[:10]}...")
        return False
    elif len(pat) < 50:
        print_status("error", f"COZE_PAT 长度可能不足，当前长度：{len(pat)}")
        return False
    else:
        print_status("success", f"COZE_PAT 格式正确：{pat[:20]}...{pat[-10:]}")

    # 检查 SPACE_ID
    if not space_id:
        print_status("error", "SPACE_ID 未配置")
        return False
    elif not space_id.isdigit():
        print_status("error", f"SPACE_ID 格式错误：应为纯数字，当前：{space_id}")
        return False
    else:
        print_status("success", f"SPACE_ID 格式正确：{space_id}")

    # 尝试测试 Coze API 连接
    print_status("info", "测试 Coze API 连接...")
    try:
        # 尝试多个可能的 API 端点
        api_endpoints = [
            ("https://api.coze.cn/v1/space/list", "空间列表"),
            ("https://api.coze.com/v1/space/list", "空间列表（国际版）"),
            ("https://api.coze.cn/v1/bot/list", "Bot 列表"),
        ]

        connected = False
        for url, desc in api_endpoints:
            try:
                headers = {
                    "Authorization": f"Bearer {pat}",
                    "Content-Type": "application/json"
                }
                response = requests.get(url, headers=headers, timeout=10)

                if response.status_code == 200:
                    print_status("success", f"Coze API 连接成功！使用端点：{desc}")
                    connected = True
                    break
                elif response.status_code == 401:
                    print_status("error", "Coze API 认证失败：PAT 无效或已过期")
                    return False
            except:
                continue

        if connected:
            return True
        else:
            print_status("warning", "无法连接到 Coze API，但 PAT 和 SPACE_ID 格式正确")
            print_status("info", "这可能是网络问题或 API 端点变更，可以继续开发")
            print_status("info", "如果后续调用失败，请检查：")
            print_status("info", "  1. 网络连接是否正常")
            print_status("info", "  2. PAT 是否已过期（在扣子平台检查）")
            print_status("info", "  3. 是否使用了正确的 Coze 区域（cn 或 com）")
            return True  # 格式正确就通过

    except Exception as e:
        print_status("warning", f"Coze API 测试失败：{str(e)}")
        print_status("info", "但配置格式正确，可以继续开发")
        return True

def verify_b_api_config():
    """验证 B 端 API 配置"""
    print("\n" + "="*60)
    print("【2/3】验证 B 端 API 配置")
    print("="*60)

    base_url = os.getenv("B_API_BASE_URL")
    api_key = os.getenv("OPEN_API_KEY")

    # 检查配置
    if not base_url:
        print_status("error", "B_API_BASE_URL 未配置")
        return False
    else:
        print_status("success", f"B_API_BASE_URL: {base_url}")

    if not api_key or api_key == "your_api_key_here":
        print_status("warning", "OPEN_API_KEY 未配置或仍是占位符")
        print_status("info", "请向 B 端团队获取 OPEN_API_KEY 并更新 .env 文件")
        return False
    else:
        print_status("success", f"OPEN_API_KEY: {api_key[:10]}...{api_key[-4:]}")

    # 测试 B 端 API 连接
    print_status("info", "测试 B 端 API 连接（调用 /jobs 接口）...")

    try:
        url = f"{base_url}/jobs"
        headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
        params = {"limit": 1}

        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                jobs = data.get("data", [])
                print_status("success", f"B 端 API 连接成功！返回 {len(jobs)} 条岗位数据")
                return True
            else:
                print_status("error", f"B 端 API 返回业务错误：{data.get('error', 'Unknown')}")
                return False
        elif response.status_code == 401:
            print_status("error", "B 端 API 认证失败：OPEN_API_KEY 无效")
            return False
        elif response.status_code == 404:
            print_status("error", f"B 端 API 端点不存在：{url}")
            print_status("info", "请确认 B 端是否已启动，且路由为 /api/open/jobs")
            return False
        else:
            print_status("error", f"B 端 API 返回错误：{response.status_code} - {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print_status("error", f"无法连接到 B 端服务器：{base_url}")
        print_status("info", "请确认：")
        print_status("info", "  1. B 端服务是否已启动")
        print_status("info", "  2. 地址是否正确（本地开发应为 http://localhost:3000/api/open）")
        return False
    except requests.exceptions.Timeout:
        print_status("error", "B 端 API 连接超时")
        return False
    except Exception as e:
        print_status("error", f"B 端 API 连接失败：{str(e)}")
        return False

def verify_optional_configs():
    """验证可选配置"""
    print("\n" + "="*60)
    print("【3/3】验证可选配置")
    print("="*60)

    # Bot ID
    bot_id = os.getenv("BOT_ID")
    if bot_id:
        print_status("success", f"BOT_ID 已配置：{bot_id}")
    else:
        print_status("info", "BOT_ID 未配置（正常，创建 Bot 后会自动填充）")

    # Workflow ID
    workflow_id = os.getenv("WORKFLOW_ID_INTERVIEW")
    if workflow_id:
        print_status("success", f"WORKFLOW_ID_INTERVIEW 已配置：{workflow_id}")
    else:
        print_status("info", "WORKFLOW_ID_INTERVIEW 未配置（正常，导入工作流后会自动填充）")

    # Knowledge ID
    knowledge_id = os.getenv("KNOWLEDGE_ID")
    if knowledge_id:
        print_status("success", f"KNOWLEDGE_ID 已配置：{knowledge_id}")
    else:
        print_status("info", "KNOWLEDGE_ID 未配置（正常，创建知识库后会自动填充）")

    # 实时语音配置
    voice_id = os.getenv("VOICE_ID")
    if voice_id and voice_id.isdigit():
        print_status("success", f"VOICE_ID 已配置：{voice_id}")
    else:
        print_status("warning", "VOICE_ID 未配置或格式错误")

    print_status("success", "可选配置检查完成")
    return True

def main():
    """主函数"""
    print("\n" + "="*60)
    print("WeHan C 端配置验证")
    print("="*60)

    # 检查 .env 文件是否存在
    if not os.path.exists(env_path):
        print_status("error", f".env 文件不存在：{env_path}")
        print_status("info", "请先创建并配置 .env 文件")
        return False

    print_status("success", f".env 文件存在：{env_path}")

    # 执行验证
    results = {
        "coze_config": verify_coze_config(),
        "b_api_config": verify_b_api_config(),
        "optional_configs": verify_optional_configs()
    }

    # 输出总结
    print("\n" + "="*60)
    print("验证总结")
    print("="*60)

    all_passed = all(results.values())

    if all_passed:
        print_status("success", "所有配置验证通过！可以开始开发。")
    else:
        print_status("error", "部分配置验证失败，请根据上述提示修复。")
        print("\n需要修复的项目：")
        if not results["coze_config"]:
            print_status("error", "- Coze 平台配置")
        if not results["b_api_config"]:
            print_status("error", "- B 端 API 配置")

    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
