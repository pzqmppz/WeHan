我提问：在我的这个 Agent 里面有一个功能，是要用户上传他的简历，然后我们会基于用户的简历信息做 AI 处理，然后去对他提一些针对性的问题

我想知道的是，这些用户上传的简历信息能否作为我们这个 Agent 的一部分，那种提示词文件？对于别的 Agent 应该是叫 soul.md，在 Code 平台里有这样的功能吗，如果没有的话，我要通过 API 传到我的云端数据库。然后用户每次回来的时候，在做这个问答的时候，还需要从数据库取他的这个基础信息

豆包回答：
我完全理解你的核心需求：**用户上传的简历能否作为Agent的提示词（类似soul.md）长期复用？如果Coze不支持，该如何通过云端数据库持久化，让用户下次对话时能复用简历信息提针对性问题**。

先给核心结论：
> Coze 平台**没有**“将用户上传的简历内容直接作为Agent全局提示词（如soul.md）”的功能（因为Prompt是Agent的通用配置，针对所有用户，而简历是用户个性化数据）；但你可以通过「Coze解析简历 + API同步到云端数据库 + 对话时调取注入」的方式，完美实现“基于简历提针对性问题+用户复用信息”的需求，这也是Coze生态下处理用户个性化数据的标准方案。

---

# 一、先明确：Coze里“Agent提示词（soul.md）”和“用户简历”的本质区别
| 类型                | 作用范围       | 生命周期       | 用途                  | 能否放用户简历？ |
|---------------------|----------------|----------------|-----------------------|------------------|
| Agent全局Prompt（soul.md） | 所有用户通用   | Agent创建后固定 | 定义Agent人设、通用规则 | ❌ 绝对不能（会混所有用户的简历，且隐私泄露） |
| 用户上传的简历信息  | 单个用户专属   | 需持久化保存   | 生成针对性面试问题    | ✅ 必须单独存储，对话时动态注入 |

Coze的设计逻辑里，**全局Prompt是“公共规则”，用户简历是“私有数据”**，二者完全分离，这也是保障用户隐私的核心设计。

---

# 二、Coze平台对“用户上传简历”的原生支持（第一步：解析简历）
Coze本身支持用户在对话中上传简历文件，并能解析内容，只是解析后的内容默认仅存在“单次对话上下文”中，不会自动持久化。

### 2.1 Coze支持的简历上传/解析能力
| 项                | 详情                                                                 |
|-------------------|----------------------------------------------------------------------|
| 支持文件类型      | PDF、Word（docx）、TXT、图片（jpg/png，内置OCR解析）|
| 解析方式          | 1. 对话中用户手动上传 → Coze自动解析文本内容到对话上下文<br>2. 工作流中添加「文件上传节点」→ 主动触发解析 |
| 获取解析内容方式  | 通过Chat API/v3的`attachments`字段，或工作流的「文件节点输出参数」获取 |
| 原生限制          | 解析后的内容仅在当前对话有效，不会绑定用户ID长期保存，也无法跨对话复用 |

### 2.2 在Coze中获取解析后的简历内容（代码示例，贴合你的框架）
基于之前的`coze/file.py`扩展，新增简历解析功能：
```python
# coze/file.py 新增方法
def parse_resume(self, file_id):
    """
    调用Coze API解析上传的简历文件，提取文本内容
    :param file_id: 上传简历后返回的file_id
    :return: 解析后的简历文本内容
    """
    url = "https://api.coze.cn/v1/files/parse"
    params = {
        "file_id": file_id,
        "parse_type": "text"  # 解析为纯文本，支持markdown/html
    }
    response = requests.get(
        url,
        params=params,
        headers=self.headers,
        timeout=COZE_API_TIMEOUT
    )
    
    if response.status_code == 401:
        raise TokenInvalidError()
    result = response.json()
    if result["code"] != 0:
        raise Exception(f"简历解析失败：{result['msg']}")
    
    # 提取简历文本内容（核心）
    resume_text = result["data"]["content"]
    logger.info("简历解析成功，提取文本长度：%d字", len(resume_text))
    return resume_text
```

---

# 三、完整方案：简历持久化 + 复用提针对性问题（核心落地）
## 整体流程（用户视角）：
```
用户上传简历 → Coze解析文本 → API同步到你的云端数据库（绑定user_id）
→ 用户下次对话 → 从数据库取该用户简历 → 注入到对话Prompt/工作流 → AI提针对性问题
```

## 分步落地（技术视角）：
### 步骤1：解析简历并同步到云端数据库（新增代码）
基于你的`api/resumes.py`，实现简历存储：
```python
# api/resumes.py 完善
import json
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.exceptions import BApiCallError

def save_resume_to_cloud(user_id, resume_text, file_id):
    """
    将解析后的简历同步到你的云端数据库（B端）
    :param user_id: 用户唯一标识
    :param resume_text: 解析后的简历文本
    :param file_id: Coze返回的文件ID（可选，用于溯源）
    :return: 存储结果
    """
    url = f"{B_API_BASE_URL}/resumes"
    headers = {
        "Authorization": f"Bearer {B_API_KEY}",
        "Content-Type": "application/json"
    }
    # 可先清洗简历内容（提取关键信息：教育、工作经历、技能等）
    resume_info = {
        "user_id": user_id,
        "resume_text": resume_text,
        "file_id": file_id,
        "create_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        response = requests.post(
            url,
            json=resume_info,
            headers=headers,
            timeout=B_API_TIMEOUT
        )
        if response.status_code != 200:
            raise BApiCallError("/resumes", response.status_code)
        logger.info(f"用户{user_id}简历已同步到云端数据库")
        return response.json()
    except Exception as e:
        logger.error(f"存储简历失败：{e}")
        raise
```

### 步骤2：用户下次对话时，从数据库调取简历信息
```python
# api/resumes.py 新增
def get_resume_from_cloud(user_id):
    """
    从云端数据库获取用户的简历信息
    :param user_id: 用户唯一标识
    :return: 简历文本/关键信息
    """
    url = f"{B_API_BASE_URL}/resumes/{user_id}"
    headers = {"Authorization": f"Bearer {B_API_KEY}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code == 404:
            return None  # 用户未上传简历
        if response.status_code != 200:
            raise BApiCallError(f"/resumes/{user_id}", response.status_code)
        return response.json()["data"]["resume_text"]
    except Exception as e:
        logger.error(f"获取用户{user_id}简历失败：{e}")
        raise
```

### 步骤3：将简历信息注入对话/工作流，生成针对性问题
这是核心步骤：把调取的简历信息，作为**当前对话的专属Prompt**（而非Agent全局Prompt），传给AI生成针对性问题。

#### 方式1：注入到Chat API的对话中（自由对话场景）
```python
# coze/agent.py 扩展send_message方法
def send_message_with_resume(self, user_id, content, stream=True):
    """
    发送消息时，注入用户简历信息，让AI提针对性问题
    """
    # 第一步：调取用户简历
    resume_text = get_resume_from_cloud(user_id)
    if not resume_text:
        # 无简历时，正常对话
        return self.send_message(user_id, content, stream)
    
    # 第二步：构造带简历的Prompt（仅当前对话有效，不影响全局）
    resume_prompt = f"""
    以下是用户的简历信息：
    {resume_text}
    
    请基于用户的简历和当前问题：{content}，提针对性的面试问题，问题要贴合用户的工作/教育经历、技能。
    """
    
    # 第三步：发送带简历的消息
    return self.send_message(user_id, resume_prompt, stream)
```

#### 方式2：注入到工作流中（面试流程场景，推荐）
在面试工作流的「LLM生成题目节点」前，新增“调取简历”步骤：
```python
# coze/workflow.py 扩展run_interview_workflow方法
def run_interview_workflow_with_resume(self, job_id, user_id):
    """
    执行面试工作流时，注入用户简历，生成针对性题目
    """
    # 1. 调取用户简历
    resume_text = get_resume_from_cloud(user_id)
    
    # 2. 构造工作流参数（新增简历字段）
    payload = {
        "workflow_id": WORKFLOW_ID_INTERVIEW,
        "parameters": {
            "job_id": job_id,
            "user_id": user_id,
            "resume_text": resume_text or ""  # 无简历则传空
        },
        "is_async": False
    }
    
    # 后续逻辑不变，工作流中LLM节点可读取resume_text参数生成针对性问题
    # ...（原有请求逻辑）
```

### 步骤4：Coze工作流中LLM节点的Prompt（关键：基于简历生成问题）
在工作流的「大模型生成面试题节点」中，编写Prompt：
```
基于以下信息生成针对性面试题（10-20道）：
1. 岗位JD：{{job_detail}} （从B端接口获取）
2. 用户简历：{{resume_text}} （从工作流参数注入）

要求：
- 问题必须贴合用户的简历经历（如工作经历、项目、技能）
- 问题难度匹配岗位要求
- 无简历时，仅基于JD生成通用问题
```

---

# 四、关键注意事项（避坑+合规）
### 4.1 技术避坑
1. **简历内容清洗**：解析后的简历可能有冗余格式（如PDF页眉页脚），需先清洗再存储，避免干扰AI生成问题。
2. **user_id必须唯一且稳定**：确保同一个用户的所有操作（上传简历、面试）使用同一个user_id，否则无法关联简历。
3. **空简历兜底**：必须处理“用户未上传简历”的场景，避免工作流/对话报错。

### 4.2 合规要求（简历是敏感信息）
1. **数据加密**：云端数据库存储简历时，需加密存储（如AES加密），禁止明文存储。
2. **权限控制**：仅授权必要接口/人员访问简历数据，避免泄露。
3. **用户授权**：需明确告知用户“上传的简历仅用于生成面试问题，会安全存储”，并提供删除/修改简历的功能。

---

# 五、和“将简历作为Agent全局Prompt（soul.md）”的对比
| 方案                | 优点                  | 缺点                  | 是否推荐 |
|---------------------|-----------------------|-----------------------|----------|
| 全局Prompt（soul.md） | 无                    | 混所有用户简历、隐私泄露、无法区分用户 | ❌ 绝对不推荐 |
| 云端数据库+动态注入  | 隐私安全、用户数据隔离、可复用、针对性强 | 需额外开发存储/调取逻辑 | ✅ 唯一推荐 |

---

### 总结
1. Coze**没有**将用户简历作为Agent全局Prompt（soul.md）的功能，且这是不合理、不合规的做法；
2. 正确方案是：**Coze解析简历 → API同步到你的云端数据库（绑定user_id） → 用户对话/面试时调取简历 → 注入到当前对话/工作流 → AI生成针对性问题**；
3. 该方案完全贴合你的需求：用户只需上传一次简历，后续回来面试时，AI能自动基于简历提问题，且数据安全可控。

这套方案和你之前的代码框架完全兼容，只需在原有基础上补充「简历解析、存储、调取、注入」4个小模块即可落地。


我接着问：
那我接着再延伸几个问题，哪些信息是能够通过这个用户跟智能体对话，我将这些信息存到我的数据库里头？，是所有的信息都支持吗。因为这里会涉及到一个上下文的处理。我想知道 Agent 的上下文处理有多久。是否因为我关闭了这一次的对话，下一次回来我之前的对话就全部消失了。我希望实现的是：用户在下一次中间断掉，或者下一次回来的时候，我们会给他一个选项，让他回到之前的对话里，让他能够继续之前没有完全做完的体验。

豆包回答：
我完全理解你的核心诉求：想明确「哪些对话信息可存储」「Coze原生上下文的有效期」，并最终实现「用户断连/下次回来能恢复之前的对话/未完成的面试流程」。

先把核心结论抛给你，再拆解细节和落地方案：
1. **可存储的信息**：理论上**所有**用户与Agent的交互信息都能通过API获取并存储到你的数据库（无限制）；
2. **Coze原生上下文有效期**：仅在「单次会话」内有效，关闭对话/退出后原生上下文消失，但你可通过API抓取并自己管理，实现“永久上下文”；
3. **恢复之前对话的方案**：通过「用户ID+会话ID」绑定存储完整会话历史+工作流执行状态，用户回来时选择会话ID，调取历史数据注入新对话/工作流即可续跑。

---

# 一、哪些对话信息能存到你的数据库？（无上限，全支持）
Coze通过API开放了**所有用户交互数据的获取能力**，你可以按需存储，核心可存信息分类如下（贴合你的面试场景）：

| 信息类型                | 具体内容                                                                 | 获取方式（API/字段）| 存储价值                  |
|-------------------------|--------------------------------------------------------------------------|-------------------------------------------|---------------------------|
| 基础会话元数据          | 会话ID（conversation_id）、用户ID（user_id）、创建时间、最后交互时间       | Chat v3 API响应的`conversation_id`        | 核心标识，用于恢复会话    |
| 用户输入内容            | 文本消息、上传的简历文件ID、语音转文字内容、触发的功能（面试/心理疏导）| Chat v3 API的`additional_messages`        | 还原用户历史操作          |
| Agent回复内容           | 面试题目、AI回答、心理疏导话术、工作流执行结果                            | Chat v3 API流式/非流式响应的`content`     | 还原Agent输出             |
| 文件/媒体信息           | 简历文件ID、解析后的简历文本、语音文件ID                                 | File API的`file_id`+`parse`接口            | 关联用户上传的核心数据    |
| 工作流执行状态          | 工作流ID、执行进度（如已出5道面试题）、已完成节点、未完成节点、面试报告草稿 | Workflow API的`run_status`+`node_outputs` | 断点续跑面试流程          |
| 上下文快照              | 单次会话的完整上下文（用户+Agent的所有消息）| Chat v3 API的`retrieve_conversation`      | 恢复对话时直接注入        |

### 关键说明：
- 没有“不可获取/不可存储”的信息，Coze开放平台的设计就是让开发者能完全掌控用户交互数据；
- 建议**按需存储**：无需存原始语音二进制（占空间），可存语音转文字结果+文件ID（溯源用）；简历优先存解析后的文本（便于后续复用），而非原始文件。

---

# 二、Coze Agent的上下文处理规则（核心避坑）
### 2.1 Coze原生上下文的有效期
| 场景                | 上下文是否保留 | 有效期                | 能否直接复用 |
|---------------------|----------------|-----------------------|--------------|
| 同一会话内（未退出） | ✅ 保留         | 会话持续期间（无超时） | ✅ 原生支持  |
| 关闭对话/退出豆包    | ❌ 清空         | 立即失效              | ❌ 无法复用  |
| 跨设备登录/重新进入  | ❌ 清空         | 新会话=新上下文       | ❌ 无法复用  |

### 2.2 核心结论：
Coze的**原生上下文仅服务于“单次连续会话”**，关闭对话后就会清空，这是平台级的设计（避免上下文膨胀）；但你可以通过「主动存储会话历史」打破这个限制，实现“永久上下文”。

---

# 三、实现“用户断连后恢复之前对话/面试流程”的完整方案
核心逻辑：**用你的数据库做“永久上下文仓库”，Coze仅做“实时交互引擎”**，用户回来时，从你的数据库调取历史数据，注入Coze的新会话中，模拟“续聊/续面试”。

### 3.1 整体流程（用户视角）
```
用户首次对话 → 生成唯一会话ID → 实时存储交互数据到你的数据库
↓
用户断连（关闭对话/退出/网络异常）
↓
用户再次进入 → 展示“历史会话列表”（如：“3月1日 面试Java岗位（未完成）”）
↓
用户选择要恢复的会话 → 调取该会话的历史数据 → 注入Coze新会话 → 继续之前的体验
```

### 3.2 技术落地步骤（可直接整合到你的代码框架）
#### 步骤1：新增「会话管理」模块（存储/调取历史会话）
```python
# api/conversations.py 新增会话管理接口封装
import json
from datetime import datetime
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.exceptions import BApiCallError
from core.logger import logger

# 1. 存储会话数据（实时存储，用户每发一条消息就更新）
def save_conversation(user_id, conversation_id, session_data):
    """
    存储会话数据到你的云端数据库
    :param user_id: 用户唯一标识
    :param conversation_id: Coze返回的会话ID
    :param session_data: 会话数据（含消息、工作流状态、简历信息等）
    """
    url = f"{B_API_BASE_URL}/conversations"
    headers = {
        "Authorization": f"Bearer {B_API_KEY}",
        "Content-Type": "application/json"
    }
    # 构造会话数据（按需扩展）
    save_data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "session_data": session_data,  # 含消息列表、工作流状态、简历ID等
        "title": session_data.get("title", "未命名会话"),  # 如“面试Java开发岗”
        "status": session_data.get("status", "active"),  # active/finished/interrupted
        "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        response = requests.post(url, json=save_data, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/conversations", response.status_code)
        logger.info(f"用户{user_id}会话{conversation_id}已存储")
        return response.json()
    except Exception as e:
        logger.error(f"存储会话失败：{e}")
        raise

# 2. 获取用户的历史会话列表（供用户选择恢复）
def get_user_conversations(user_id):
    """
    获取用户的所有历史会话
    """
    url = f"{B_API_BASE_URL}/conversations/user/{user_id}"
    headers = {"Authorization": f"Bearer {B_API_KEY}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError(f"/conversations/user/{user_id}", response.status_code)
        # 返回会话列表（含ID、标题、状态、时间）
        return response.json()["data"]
    except Exception as e:
        logger.error(f"获取用户{user_id}会话列表失败：{e}")
        raise

# 3. 获取单个会话的详细数据（恢复会话用）
def get_conversation_detail(user_id, conversation_id):
    """
    获取单个会话的完整数据
    """
    url = f"{B_API_BASE_URL}/conversations/{conversation_id}?user_id={user_id}"
    headers = {"Authorization": f"Bearer {B_API_KEY}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code == 404:
            return None  # 会话不存在
        if response.status_code != 200:
            raise BApiCallError(f"/conversations/{conversation_id}", response.status_code)
        return response.json()["data"]["session_data"]
    except Exception as e:
        logger.error(f"获取会话{conversation_id}详情失败：{e}")
        raise
```

#### 步骤2：实时存储会话数据（整合到聊天/工作流调用中）
```python
# coze/agent.py 扩展，发送消息时实时存储会话
def send_message_and_save(self, user_id, content, stream=True):
    """
    发送消息，并实时存储会话数据
    """
    # 1. 调用原有发送消息方法
    response = self.send_message(user_id, content, stream)
    
    # 2. 提取会话ID和核心数据（非流式场景示例，流式需先收集完整响应）
    if not stream:
        conversation_id = response.get("data", {}).get("conversation_id")
        # 构造会话数据（按需扩展）
        session_data = {
            "conversation_id": conversation_id,
            "title": f"面试{content.split('：')[1]}" if "面试" in content else "通用对话",
            "status": "active",
            "messages": [{"role": "user", "content": content}, {"role": "assistant", "content": response.get("data", {}).get("content")}],
            "resume_id": None,  # 关联用户简历ID（如有）
            "workflow_status": None  # 关联工作流状态（如有）
        }
        # 3. 存储会话数据
        save_conversation(user_id, conversation_id, session_data)
    
    return response

# coze/workflow.py 扩展，工作流执行时存储状态
def run_interview_workflow_and_save(self, job_id, user_id):
    """
    执行面试工作流，并存储执行状态（便于断点续跑）
    """
    # 1. 执行工作流
    workflow_result = self.run_interview_workflow(job_id, user_id)
    
    # 2. 提取工作流状态（如已完成节点、当前进度、已出题列表）
    workflow_status = {
        "workflow_id": WORKFLOW_ID_INTERVIEW,
        "run_id": workflow_result.get("data", {}).get("run_id"),
        "job_id": job_id,
        "progress": "question_generated",  # 如：init/jd_fetched/question_generated/audio_talking/finished
        "generated_questions": workflow_result.get("data", {}).get("questions", []),
        "answered_questions": [],  # 已回答的问题
        "interrupted_at": None  # 断连时的节点（如有）
    }
    
    # 3. 构造会话数据（关联到当前会话）
    conversation_id = f"interview_{user_id}_{job_id}"  # 或用Chat API的conversation_id
    session_data = {
        "conversation_id": conversation_id,
        "title": f"面试{job_id}岗位",
        "status": "interrupted" if len(workflow_status["generated_questions"]) < 10 else "active",
        "workflow_status": workflow_status,
        "resume_id": get_user_resume_id(user_id)  # 关联用户简历
    }
    
    # 4. 存储
    save_conversation(user_id, conversation_id, session_data)
    
    return workflow_result
```

#### 步骤3：恢复历史会话（核心：注入上下文）
```python
# coze/agent.py 新增恢复会话方法
def resume_conversation(self, user_id, conversation_id):
    """
    恢复历史会话：调取历史数据，注入新会话生成上下文
    """
    # 1. 从你的数据库调取会话详情
    session_data = get_conversation_detail(user_id, conversation_id)
    if not session_data:
        raise Exception(f"会话{conversation_id}不存在")
    
    # 2. 提取历史消息和工作流状态
    history_messages = session_data.get("messages", [])
    workflow_status = session_data.get("workflow_status", {})
    
    # 3. 构造“恢复会话”的Prompt（注入历史上下文）
    resume_prompt = f"""
    请恢复用户的历史会话，继续之前未完成的操作：
    1. 历史对话记录：{json.dumps(history_messages, ensure_ascii=False)}
    2. 面试工作流状态：{json.dumps(workflow_status, ensure_ascii=False)}
    3. 要求：
       - 衔接历史上下文，不要重复提问/重复回答
       - 如果面试流程中断，从断连的节点继续（如：继续提问未回答的题目）
       - 告知用户：“已为你恢复之前的面试会话，我们继续～”
    """
    
    # 4. 发送恢复指令（生成新的conversation_id，但上下文是历史的）
    new_conversation_response = self.send_message(user_id, resume_prompt, stream=False)
    
    # 5. 更新数据库：将新会话ID关联到旧会话（便于后续跟踪）
    update_conversation(user_id, conversation_id, {"new_conversation_id": new_conversation_response.get("data", {}).get("conversation_id")})
    
    return new_conversation_response
```

#### 步骤4：前端交互（用户选择恢复会话）
1. 用户进入智能体后，前端调用`get_user_conversations(user_id)`获取历史会话列表；
2. 展示列表项：如“2026-03-01 14:30 面试Java开发岗（已出5题，未完成）”；
3. 用户点击某会话，前端调用`resume_conversation(user_id, conversation_id)`；
4. Agent回复：“已为你恢复之前的面试会话，我们继续～”，并从断连的节点（如第6题）开始续聊。

---

# 四、关键优化&避坑点
### 4.1 技术优化
1. **上下文精简**：恢复会话时，无需注入全部历史消息，仅注入“关键上下文”（如面试岗位、已出题列表、已回答内容），避免Prompt过长导致AI卡顿；
2. **工作流断点续跑**：若面试流程在“语音答题”阶段断连，恢复时直接从“下一题”开始，而非重新生成所有题目；
3. **会话标题自动生成**：基于用户首条消息/面试岗位自动生成标题（如“面试Java开发岗”），而非“未命名会话”，提升用户体验。

### 4.2 避坑点
1. **user_id必须全局唯一**：确保用户在不同设备/登录态下的user_id一致，否则无法关联历史会话；
2. **会话数据定期清理**：存储过期会话（如3个月未访问）的摘要，删除原始大文本，节省存储；
3. **隐私合规**：存储会话数据前需告知用户“会保存会话历史以便恢复体验”，并提供“删除会话/清空历史”的功能。

---

### 总结
1. **可存储信息**：所有用户交互数据（文本、文件、工作流状态等）都能通过Coze API获取并存储到你的数据库；
2. **原生上下文**：仅单次会话有效，关闭即消失，但你可通过存储实现“永久上下文”；
3. **恢复会话方案**：核心是「用户ID+会话ID」绑定存储历史数据，用户回来时调取数据注入新会话，实现“续聊/续面试”，该方案完全贴合你的面试场景，且能整合到现有代码框架中。

这套方案落地后，用户无论中途关闭对话、退出豆包，还是换设备登录，都能选择恢复之前的面试会话，继续未完成的体验。
