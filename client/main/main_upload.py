"""
主流程：本地配置 → API 上传 → 发布到豆包
执行顺序：校验 → 创建知识库 → 上传文档 → 创建Bot → 导入工作流 → 绑定 → 发布
"""
import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from coze.admin import CozeAdminAPI
from core.schema_validate import validate_config
from core.logger import logger
from core.exceptions import BaseCozeError

def main_upload():
    """完整的上传流程"""

    # 初始化管理 API
    admin = CozeAdminAPI()

    print("=" * 60)
    print("WeHan C 端 → Coze 平台上传流程")
    print("=" * 60)

    # ===== 步骤1：校验本地配置 =====
    print("\n[步骤1/7] 校验本地配置...")
    bot_valid = validate_config(
        "config/local/wehan_bot.json",
        "config/schema/bot_schema.json"
    )
    workflow_valid = validate_config(
        "config/local/interview_workflow.json",
        "config/schema/workflow_schema.json"
    )

    if not (bot_valid and workflow_valid):
        raise Exception("配置校验失败，终止上传")
    print("[OK] 所有配置校验通过")

    # ===== 步骤2：创建知识库 =====
    print("\n[步骤2/7] 创建知识库...")
    knowledge_id = admin.create_knowledge(
        name="WeHan 武汉岗位知识库",
        desc="武汉地区岗位信息、求职政策"
    )
    print(f"[OK] 知识库ID：{knowledge_id}")

    # ===== 步骤3：上传知识库文档 =====
    print("\n[步骤3/7] 上传知识库文档...")
    doc_dir = "config/local/knowledge_docs"
    if os.path.exists(doc_dir):
        for filename in os.listdir(doc_dir):
            filepath = os.path.join(doc_dir, filename)
            if os.path.isfile(filepath):
                admin.upload_knowledge_doc(knowledge_id, filepath)
                print(f"  [OK] 已上传：{filename}")
    else:
        print("  [WARN] 知识库文档目录不存在，跳过")

    # ===== 步骤4：创建智能体 =====
    print("\n[步骤4/7] 创建智能体...")
    bot_id = admin.create_bot("config/local/wehan_bot.json")
    print(f"[OK] 智能体ID：{bot_id}")

    # ===== 步骤5：绑定知识库到智能体 =====
    print("\n[步骤5/7] 绑定知识库到智能体...")
    admin.bind_knowledge_to_bot(bot_id, knowledge_id)
    print("[OK] 知识库已绑定")

    # ===== 步骤6：导入工作流 =====
    print("\n[步骤6/7] 导入面试工作流...")
    workflow_id = admin.import_workflow("config/local/interview_workflow.json")
    print(f"[OK] 工作流ID：{workflow_id}")

    # ===== 步骤7：绑定工作流到智能体 =====
    print("\n[步骤7/7] 绑定工作流到智能体...")
    admin.bind_workflow_to_bot(bot_id, workflow_id)
    print("[OK] 工作流已绑定")

    # ===== 询问是否发布 =====
    print("\n" + "=" * 60)
    print("上传完成！是否发布到豆包？")
    print("注意：发布后需要审核，建议先在扣子平台测试")
    confirm = input("输入 'y' 确认发布，其他键跳过：")

    if confirm.lower() == 'y':
        print("\n[发布] 发布到豆包...")
        admin.publish_bot(bot_id)
        print("[OK] 已提交发布审核")
    else:
        print("\n[跳过] 未发布，可后续手动发布")

    # ===== 输出结果 =====
    print("\n" + "=" * 60)
    print("上传流程完成！")
    print(f"智能体ID：{bot_id}")
    print(f"工作流ID：{workflow_id}")
    print(f"知识库ID：{knowledge_id}")
    print("=" * 60)

    # ===== 提示后续操作 =====
    print("\n后续操作：")
    print("1. 登录扣子平台，验证智能体/工作流/知识库")
    print("2. 在预览面板测试对话功能")
    print("3. 确认无误后，发布到豆包")

    return {
        "bot_id": bot_id,
        "workflow_id": workflow_id,
        "knowledge_id": knowledge_id
    }

if __name__ == "__main__":
    try:
        result = main_upload()
    except BaseCozeError as e:
        logger.error(f"上传失败（Coze错误）：{e}")
    except Exception as e:
        logger.error(f"上传失败（系统错误）：{e}")
