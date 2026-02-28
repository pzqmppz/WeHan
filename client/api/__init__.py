# API module for WeHan C端 B端API对接
from .jobs import get_job_list, get_job_detail
from .applications import submit_application, get_applications
from .interviews import save_interview_report, get_interview_report
from .resumes import save_resume_to_cloud, get_resume_from_cloud
from .policies import get_policies
from .conversations import (
    save_conversation,
    update_conversation,
    get_user_conversations,
    get_conversation_detail
)

__all__ = [
    'get_job_list',
    'get_job_detail',
    'submit_application',
    'get_applications',
    'save_interview_report',
    'get_interview_report',
    'save_resume_to_cloud',
    'get_resume_from_cloud',
    'get_policies',
    'save_conversation',
    'update_conversation',
    'get_user_conversations',
    'get_conversation_detail'
]
