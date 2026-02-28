"""
主流程入口：串接面试模拟全流程
你只需确认流程逻辑，无需修改核心结构
"""
import asyncio
from coze.agent import CozeAgent
from coze.workflow import CozeWorkflow
from coze.voice import CozeRealtimeVoice
from coze.file import CozeFile
from api.jobs import get_job_detail
from api.interviews import save_interview_report
from api.resumes import get_resume_from_cloud
from core.logger import logger
from core.exceptions import BaseCozeError

# 示例：面试模拟主流程
def run_interview_main(user_id: str, job_id: str, bot_id: str, workflow_id: str):
    """
    面试模拟全流程
    :param user_id: 用户ID
    :param job_id: 岗位ID
    :param bot_id: 智能体ID
    :param workflow_id: 工作流ID
    """
    try:
        # 1. 获取岗位详情（调用B端API）
        logger.info(f"开始面试模拟，用户{user_id}，岗位{job_id}")
        job_detail = get_job_detail(job_id)
        logger.info(f"获取岗位详情成功：{job_detail.get('data', {}).get('title')}")

        # 2. 获取用户简历（如果有）
        resume_data = get_resume_from_cloud(user_id)
        resume_text = resume_data.get("resumeText") if resume_data else ""

        # 3. 执行面试工作流（生成题目）
        workflow = CozeWorkflow()
        workflow_result = workflow.run_interview_workflow(
            job_id=job_id,
            user_id=user_id,
            workflow_id=workflow_id,
            resume_text=resume_text
        )
        interview_questions = workflow_result.get("data", {}).get("questions", [])
        logger.info(f"生成面试题{len(interview_questions)}道")

        # 4. 启动实时语音面试（异步）
        async def voice_interview():
            voice = CozeRealtimeVoice(user_id, bot_id)
            await voice.connect()
            # 此处仅示例，实际需循环发送题目+接收回答
            # for question in interview_questions:
            #     await voice.send_audio(question)  # 语音播报题目
            #     answer = await voice.receive_audio()  # 接收用户回答
            await voice.close()
            return {"total_score": 85, "report": "面试评估报告内容..."}

        # 运行语音面试
        voice_result = asyncio.run(voice_interview())

        # 5. 保存面试报告（调用B端API）
        save_interview_report({
            "userId": user_id,
            "jobId": job_id,
            "totalScore": voice_result["total_score"],
            "dimensions": voice_result.get("dimensions", []),
            "highlights": voice_result.get("highlights", []),
            "improvements": voice_result.get("improvements", []),
            "suggestions": voice_result["report"]
        })

        logger.info(f"面试模拟全流程完成，用户{user_id}")
        return {"status": "success", "data": voice_result}

    except BaseCozeError as e:
        logger.error(f"面试流程异常（Coze相关）：{e}")
        return {"status": "failed", "error": str(e)}
    except Exception as e:
        logger.error(f"面试流程异常：{e}")
        return {"status": "failed", "error": str(e)}

# 测试入口（运行此文件时执行）
if __name__ == "__main__":
    # 替换为测试用的user_id和job_id
    test_user_id = "user_123456"
    test_job_id = "cmm52v1jc00003wuj5mlubj3u"
    test_bot_id = "your_bot_id_here"
    test_workflow_id = "your_workflow_id_here"

    result = run_interview_main(test_user_id, test_job_id, test_bot_id, test_workflow_id)
    print(result)
