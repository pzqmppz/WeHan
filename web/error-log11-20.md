## 011
点击发布新岗位，弹出红色报错：enterpriseId is not defined
后端报错：
Create job error: ReferenceError: enterpriseId is not defined
    at POST (src\app\api\jobs\route.ts:87:7)
  85 |     const validated = CreateJobSchema.parse({
  86 |       ...body,
> 87 |       enterpriseId, // 覆盖客户端传递的值，防止伪造
     |       ^
  88 |     })
  89 |
  90 |     // 调用 Service 创建岗位
 POST /api/jobs 500 in 292ms (compile: 2ms, proxy.ts: 3ms, render: 287ms)

 岗位下架功能正常，点击下架后岗位消失

 点击人才库依旧会弹 500 的报错，后端报错信息如下：
 Get talents error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:999:177

  996     where.status = filter.status;
  997 }
  998 // 先查询所有符合条件的投递，然后按用户去重
→ 999 const applications = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany({
        where: {
          Job: {
            enterpriseId: "cmm4tbpes0002s306wwevxeni"
          }
        },
        include: {
          user: {
          ~~~~
            include: {
              resume: {
                select: {
                  id: true,
                  phone: true,
                  education: true,
                  experiences: true,
                  projects: true,
                  skills: true,
                  certifications: true,
                  awards: true,
                  profile: true
                }
              }
            }
          },
          job: {
            select: {
              id: true,
              title: true
            }
          },
          interview: {
            select: {
              id: true,
              totalScore: true,
              status: true
            }
          },
      ?   Job?: true,
      ?   User?: true,
      ?   Interview?: true
        },
        orderBy: {
          createdAt: "desc"
        }
      })

Unknown field `user` for include statement on model `Application`. Available options are marked with ?.
    at <unknown> (src\repositories\talent.repository.ts:75:51)
    at async Object.findMany (src\repositories\talent.repository.ts:75:26)
    at async Object.getTalents (src\services\talent.service.ts:41:32)
    at async GET (src\app\api\talent\route.ts:50:20)
  73 |
  74 |     // 先查询所有符合条件的投递，然后按用户去重
> 75 |     const applications = await prisma.application.findMany({
     |                                                   ^
  76 |       where,
  77 |       include: {
  78 |         user: { {
  clientVersion: '5.22.0'
}
 GET /api/talent?page=1&pageSize=10 500 in 425ms (compile: 40ms, proxy.ts: 2ms, render: 383ms)
Get talent statistics error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:1160:177

  1157 const oneWeekAgo = new Date();
  1158 oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  1159 // 获取所有投递
→ 1160 const applications = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany({
         where: {
           job: {
           ~~~
             enterpriseId: "cmm4tbpes0002s306wwevxeni"
           },
       ?   AND?: ApplicationWhereInput | ApplicationWhereInput[],
       ?   OR?: ApplicationWhereInput[],
       ?   NOT?: ApplicationWhereInput | ApplicationWhereInput[],
       ?   id?: StringFilter | String,
       ?   userId?: StringFilter | String,
       ?   jobId?: StringFilter | String,
       ?   resumeId?: StringNullableFilter | String | Null,
       ?   interviewId?: StringNullableFilter | String | Null,
       ?   matchScore?: FloatNullableFilter | Float | Null,
       ?   status?: EnumApplicationStatusFilter | ApplicationStatus,
       ?   notes?: StringNullableFilter | String | Null,
       ?   createdAt?: DateTimeFilter | DateTime,
       ?   updatedAt?: DateTimeFilter | DateTime,
       ?   viewedAt?: DateTimeNullableFilter | DateTime | Null,
       ?   Job?: JobRelationFilter | JobWhereInput,
       ?   User?: UserRelationFilter | UserWhereInput,
       ?   Interview?: InterviewNullableRelationFilter | InterviewWhereInput | Null
         },
         select: {
           userId: true,
           createdAt: true,
           status: true
         }
       })

Unknown argument `job`. Did you mean `Job`? Available options are marked with ?.
    at <unknown> (src\repositories\talent.repository.ts:265:51)
    at async Object.getStatistics (src\repositories\talent.repository.ts:265:26)
    at async Object.getStatistics (src\services\talent.service.ts:71:19)
    at async GET (src\app\api\talent\statistics\route.ts:28:20)
  263 |
  264 |     // 获取所有投递
> 265 |     const applications = await prisma.application.findMany({
      |                                                   ^
  266 |       where: {
  267 |         job: { enterpriseId },
  268 |       }, {
  clientVersion: '5.22.0'
}
 GET /api/talent/statistics 500 in 504ms (compile: 22ms, proxy.ts: 3ms, render: 479ms)
Get talent statistics error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:1160:177

  1157 const oneWeekAgo = new Date();
  1158 oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  1159 // 获取所有投递
→ 1160 const applications = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany({
         where: {
           job: {
           ~~~
             enterpriseId: "cmm4tbpes0002s306wwevxeni"
           },
       ?   AND?: ApplicationWhereInput | ApplicationWhereInput[],
       ?   OR?: ApplicationWhereInput[],
       ?   NOT?: ApplicationWhereInput | ApplicationWhereInput[],
       ?   id?: StringFilter | String,
       ?   userId?: StringFilter | String,
       ?   jobId?: StringFilter | String,
       ?   resumeId?: StringNullableFilter | String | Null,
       ?   interviewId?: StringNullableFilter | String | Null,
       ?   matchScore?: FloatNullableFilter | Float | Null,
       ?   status?: EnumApplicationStatusFilter | ApplicationStatus,
       ?   notes?: StringNullableFilter | String | Null,
       ?   createdAt?: DateTimeFilter | DateTime,
       ?   updatedAt?: DateTimeFilter | DateTime,
       ?   viewedAt?: DateTimeNullableFilter | DateTime | Null,
       ?   Job?: JobRelationFilter | JobWhereInput,
       ?   User?: UserRelationFilter | UserWhereInput,
       ?   Interview?: InterviewNullableRelationFilter | InterviewWhereInput | Null
         },
         select: {
           userId: true,
           createdAt: true,
           status: true
         }
       })

Unknown argument `job`. Did you mean `Job`? Available options are marked with ?.
    at <unknown> (src\repositories\talent.repository.ts:265:51)
    at async Object.getStatistics (src\repositories\talent.repository.ts:265:26)
    at async Object.getStatistics (src\services\talent.service.ts:71:19)
    at async GET (src\app\api\talent\statistics\route.ts:28:20)
  263 |
  264 |     // 获取所有投递
> 265 |     const applications = await prisma.application.findMany({
      |                                                   ^
  266 |       where: {
  267 |         job: { enterpriseId },
  268 |       }, {
  clientVersion: '5.22.0'
}
 GET /api/talent/statistics 500 in 283ms (compile: 6ms, proxy.ts: 2ms, render: 275ms)
Get talents error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:999:177

  996     where.status = filter.status;
  997 }
  998 // 先查询所有符合条件的投递，然后按用户去重
→ 999 const applications = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].application.findMany({
        where: {
          Job: {
            enterpriseId: "cmm4tbpes0002s306wwevxeni"
          }
        },
        include: {
          user: {
          ~~~~
            include: {
              resume: {
                select: {
                  id: true,
                  phone: true,
                  education: true,
                  experiences: true,
                  projects: true,
                  skills: true,
                  certifications: true,
                  awards: true,
                  profile: true
                }
              }
            }
          },
          job: {
            select: {
              id: true,
              title: true
            }
          },
          interview: {
            select: {
              id: true,
              totalScore: true,
              status: true
            }
          },
      ?   Job?: true,
      ?   User?: true,
      ?   Interview?: true
        },
        orderBy: {
          createdAt: "desc"
        }
      })

Unknown field `user` for include statement on model `Application`. Available options are marked with ?.
    at <unknown> (src\repositories\talent.repository.ts:75:51)
    at async Object.findMany (src\repositories\talent.repository.ts:75:26)
    at async Object.getTalents (src\services\talent.service.ts:41:32)
    at async GET (src\app\api\talent\route.ts:50:20)
  73 |
  74 |     // 先查询所有符合条件的投递，然后按用户去重
> 75 |     const applications = await prisma.application.findMany({
     |                                                   ^
  76 |       where,
  77 |       include: {
  78 |         user: { {
  clientVersion: '5.22.0'
}
 GET /api/talent?page=1&pageSize=10 500 in 599ms (compile: 5ms, proxy.ts: 78ms, render: 515ms)

 投递管理功能里面是空的，没有数据，看起来像是正常的


 首页统计数据跟之前一样，除了有岗位信息罗列外，其他信息都是空的。然后上面一排数字全是 0

 点击企业信息功能，依旧报错：

GET /api/talent?page=1&pageSize=10 500 in 599ms (compile: 5ms, proxy.ts: 78ms, render: 515ms)
 GET /api/auth/session 200 in 37ms (compile: 27ms, proxy.ts: 3ms, render: 7ms)
 GET /api/auth/session 200 in 10ms (compile: 3ms, proxy.ts: 3ms, render: 5ms)
 GET /enterprise/applications 200 in 41ms (compile: 24ms, proxy.ts: 3ms, render: 14ms)
 GET /api/applications/statistics?enterpriseId=cmm4tbpes0002s306wwevxeni 200 in 927ms (compile: 44ms, proxy.ts: 3ms, render: 880ms)
 GET /api/applications?page=1&pageSize=10&enterpriseId=cmm4tbpes0002s306wwevxeni 200 in 1094ms (compile: 25ms, proxy.ts: 3ms, render: 1065ms)
 GET /api/applications/statistics?enterpriseId=cmm4tbpes0002s306wwevxeni 200 in 750ms (compile: 2ms, proxy.ts: 2ms, render: 746ms)
 GET /api/applications?page=1&pageSize=10&enterpriseId=cmm4tbpes0002s306wwevxeni 200 in 692ms (compile: 1834µs, proxy.ts: 1769µs, render: 689ms)
 GET /api/auth/session 200 in 34ms (compile: 26ms, proxy.ts: 2ms, render: 5ms)
 GET /api/auth/session 200 in 11ms (compile: 3ms, proxy.ts: 1805µs, render: 6ms)
 GET /api/auth/session 200 in 35ms (compile: 26ms, proxy.ts: 1849µs, render: 7ms)
 GET /api/auth/session 200 in 9ms (compile: 3ms, proxy.ts: 1744µs, render: 4ms)
⨯ ./src/app/(dashboard)/enterprise/profile/page.tsx:8:1
Export BuildingOutlined doesn't exist in target module
   6 |   Typography, Row, Col, Upload, Avatar, Tag, Divider
   7 | } from 'antd'
>  8 | import {
     | ^^^^^^^^
>  9 |   SaveOutlined, ReloadOutlined, BuildingOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 10 |   MailOutlined, PhoneOutlined, EnvironmentOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 11 |   UploadOutlined, CheckCircleOutlined, ClockCircleOutlined
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 12 | } from '@ant-design/icons'
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  13 | import DashboardLayout from '@/components/layout/DashboardLayout'
  14 | import { useSession } from 'next-auth/react'
  15 | import { useRouter } from 'next/navigation'

The export BuildingOutlined was not found in module [project]/node_modules/@ant-design/icons/es/index.js [app-client] (ecmascript).
Did you mean to import BuildOutlined?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component Browser]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component SSR]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]



./src/app/(dashboard)/enterprise/profile/page.tsx:8:1
Export BuildingOutlined doesn't exist in target module
   6 |   Typography, Row, Col, Upload, Avatar, Tag, Divider
   7 | } from 'antd'
>  8 | import {
     | ^^^^^^^^
>  9 |   SaveOutlined, ReloadOutlined, BuildingOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 10 |   MailOutlined, PhoneOutlined, EnvironmentOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 11 |   UploadOutlined, CheckCircleOutlined, ClockCircleOutlined
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 12 | } from '@ant-design/icons'
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  13 | import DashboardLayout from '@/components/layout/DashboardLayout'
  14 | import { useSession } from 'next-auth/react'
  15 | import { useRouter } from 'next/navigation'

The export BuildingOutlined was not found in module [project]/node_modules/@ant-design/icons/es/index.js [app-ssr] (ecmascript).
Did you mean to import BuildOutlined?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component Browser]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component SSR]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]


 GET /enterprise/profile 500 in 240ms (compile: 165ms, proxy.ts: 1740µs, render: 74ms)
⨯ ./src/app/(dashboard)/enterprise/profile/page.tsx:8:1
Export BuildingOutlined doesn't exist in target module
   6 |   Typography, Row, Col, Upload, Avatar, Tag, Divider
   7 | } from 'antd'
>  8 | import {
     | ^^^^^^^^
>  9 |   SaveOutlined, ReloadOutlined, BuildingOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 10 |   MailOutlined, PhoneOutlined, EnvironmentOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 11 |   UploadOutlined, CheckCircleOutlined, ClockCircleOutlined
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 12 | } from '@ant-design/icons'
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  13 | import DashboardLayout from '@/components/layout/DashboardLayout'
  14 | import { useSession } from 'next-auth/react'
  15 | import { useRouter } from 'next/navigation'

The export BuildingOutlined was not found in module [project]/node_modules/@ant-design/icons/es/index.js [app-client] (ecmascript).
Did you mean to import BuildOutlined?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component Browser]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component SSR]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]



./src/app/(dashboard)/enterprise/profile/page.tsx:8:1
Export BuildingOutlined doesn't exist in target module
   6 |   Typography, Row, Col, Upload, Avatar, Tag, Divider
   7 | } from 'antd'
>  8 | import {
     | ^^^^^^^^
>  9 |   SaveOutlined, ReloadOutlined, BuildingOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 10 |   MailOutlined, PhoneOutlined, EnvironmentOutlined,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 11 |   UploadOutlined, CheckCircleOutlined, ClockCircleOutlined
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 12 | } from '@ant-design/icons'
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  13 | import DashboardLayout from '@/components/layout/DashboardLayout'
  14 | import { useSession } from 'next-auth/react'
  15 | import { useRouter } from 'next/navigation'

The export BuildingOutlined was not found in module [project]/node_modules/@ant-design/icons/es/index.js [app-ssr] (ecmascript).
Did you mean to import BuildOutlined?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component Browser]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Client Component SSR]
    ./src/app/(dashboard)/enterprise/profile/page.tsx [Server Component]


 GET /enterprise/profile 500 in 35ms (compile: 25ms, proxy.ts: 3ms, render: 8ms)


## 012
其他的都没问题，就到发布岗位时报错了：
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create()` invocation in E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:154:149 151 /** 152 * 创建岗位 153 */ async create (data) { → 154 return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create({ data: { title: "111", enterprise: { connect: { id: "cmm4tbpes0002s306wwevxeni" } }, industry: undefined, category: undefined, salaryMin: undefined, salaryMax: undefined, location: undefined, address: undefined, description: "111", requirements: undefined, benefits: undefined, skills: [], educationLevel: undefined, experienceYears: undefined, freshGraduate: true, headcount: 1, status: "DRAFT", + id: String } }) Argument `id` is missing.

后端报错信息为：
Create job error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__c73ce571._.js:154:149

  151  /**
  152 * 创建岗位
  153 */ async create (data) {
→ 154      return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create({
             data: {
               title: "111",
               enterprise: {
                 connect: {
                   id: "cmm4tbpes0002s306wwevxeni"
                 }
               },
               industry: undefined,
               category: undefined,
               salaryMin: undefined,
               salaryMax: undefined,
               location: undefined,
               address: undefined,
               description: "111",
               requirements: undefined,
               benefits: undefined,
               skills: [],
               educationLevel: undefined,
               experienceYears: undefined,
               freshGraduate: true,
               headcount: 1,
               status: "DRAFT",
           +   id: String
             }
           })

Argument `id` is missing.
    at <unknown> (src\repositories\job.repository.ts:108:23)
    at async Object.createJob (src\services\job.service.ts:63:17)
    at async POST (src\app\api\jobs\route.ts:91:20)
  106 |    */
  107 |   async create(data: Prisma.JobCreateInput): Promise<Job> {
> 108 |     return prisma.job.create({ data })
      |                       ^
  109 |   },
  110 |
  111 |   /** {
  clientVersion: '5.22.0'
}
 POST /api/jobs 500 in 300ms (compile: 2ms, proxy.ts: 3ms, render: 294ms)


 ## 013
 依旧是发布岗位时报错，这里你应该能够看到我填入的信息，我只是把你要求我必填的信息，岗位名称与岗位职责随便填个信息，然后点击发布
 Create job error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__398b9601._.js:154:149

  151  /**
  152 * 创建岗位
  153 */ async create (data) {
→ 154      return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create({
             data: {
               id: "cmm52qtr700001kuj5475dept",
               title: "123123",
               enterprise: {
                 connect: {
                   id: "cmm4tbpes0002s306wwevxeni"
                 }
               },
               industry: undefined,
               category: undefined,
               salaryMin: undefined,
               salaryMax: undefined,
               location: undefined,
               address: undefined,
               description: "3123123213",
               requirements: undefined,
               benefits: undefined,
               skills: [],
               educationLevel: undefined,
               experienceYears: undefined,
               freshGraduate: true,
               headcount: 1,
               status: "DRAFT",
           +   updatedAt: DateTime
             }
           })

Argument `updatedAt` is missing.
    at <unknown> (src\repositories\job.repository.ts:108:23)
    at async Object.createJob (src\services\job.service.ts:64:17)
    at async POST (src\app\api\jobs\route.ts:91:20)
  106 |    */
  107 |   async create(data: Prisma.JobCreateInput): Promise<Job> {
> 108 |     return prisma.job.create({ data })
      |                       ^
  109 |   },
  110 |
  111 |   /** {
  clientVersion: '5.22.0'
}
 POST /api/jobs 500 in 333ms (compile: 1821µs, proxy.ts: 2ms, render: 329ms)

 ## 014
 发布时报错，前端报错：
 page.tsx:44 Warning: [antd: message] Static function can not consume context like dynamic theme. Please use 'App' component instead.
handleSubmit	@	page.tsx:44
await in handleSubmit		
handleSubmit	@	JobForm.tsx:43
终端报错：
Create job error: Error [PrismaClientValidationError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create()` invocation in
E:\文档\code\WeHan\web\.next\dev\server\chunks\[root-of-the-server]__fc6bca03._.js:154:149

  151  /**
  152 * 创建岗位
  153 */ async create (data) {
→ 154      return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].job.create({
             data: {
               id: "cmm52v1jc00003wuj5mlubj3u",
               title: "123123",
               enterprise: {
                 connect: {
                   id: "cmm4tbpes0002s306wwevxeni"
                 }
               },
               industry: undefined,
               category: undefined,
               salaryMin: undefined,
               salaryMax: undefined,
               location: undefined,
               address: undefined,
               description: "312313",
               requirements: undefined,
               benefits: undefined,
               skills: [],
               educationLevel: undefined,
               experienceYears: undefined,
               freshGraduate: true,
               headcount: 1,
               status: "DRAFT",
               updatedAt: new Date("2026-02-27T15:59:19.944Z"),
           +   Enterprise: {
           +     create: EnterpriseCreateWithoutJobInput | EnterpriseUncheckedCreateWithoutJobInput,
           +     connectOrCreate: EnterpriseCreateOrConnectWithoutJobInput,
           +     connect: EnterpriseWhereUniqueInput
           +   }
             }
           })

Argument `Enterprise` is missing.
    at <unknown> (src\repositories\job.repository.ts:108:23)
    at async Object.createJob (src\services\job.service.ts:66:17)
    at async POST (src\app\api\jobs\route.ts:91:20)
  106 |    */
  107 |   async create(data: Prisma.JobCreateInput): Promise<Job> {
> 108 |     return prisma.job.create({ data })
      |                       ^
  109 |   },
  110 |
  111 |   /** {
  clientVersion: '5.22.0'
}
 POST /api/jobs 500 in 573ms (compile: 1836µs, proxy.ts: 2ms, render: 569ms)


 ## 015
 这次成功完成了岗位创建，没有报错。但是岗位信息，在首页的热门岗位里能看到，排在第 4 位。在岗位管理里面却看不到我新建的岗位，还是只有原来的那两个。
 额外再提醒你，又发现一个 Bug。就是首页热门岗位里，现在能看到 4 个岗位。我之前删掉一个了，在岗位管理里已经看不到了，但在首页热门岗位里依然能看见。
 这个是正确的逻辑吗

 ## 016
 我给你叙述一下现在的岗位管理，里面岗位列表的内容，首先就是有 4 条岗位信息。其中第一条是我刚刚创建的名为 13123 的岗位名称

我的薪资没有填写，所以它自动给我选择了面议。行业、地点都没写，自动是横杠。招聘艺人、投递数是一个点，状态是草稿，后面有 4 个操作，分别是查看、修改、发布和删除。我认为这个是比较合理的。
接下来继续是后端开发工程师和前端开发工程师。这是原来你帮我输入的数据，里面的信息都没变。

然后看后面的操作，操作是看见、修改跟下架。这 3 个，但是没有删除。
然后就是最下面的 AI 算法工程师，这个是我之前点过关闭的，所以它的 AI 算法工程师状态是已关闭。但是它只有两个按钮，一个是“看见”，一个是“修改”。
接下来我继续测试算法，AI 算法工程师就是已关闭岗位的这些操作
我又完整测试了一下，它的这个功能是完全没有问题的。我是可以通过对已关闭的岗位进行修改内容，然后修改确认完内容后，它会问我是否再次发布，还是说要删除

再次发布和删除这两个功能全都是正常的。我就是比较诧异，为什么我们的前端对于岗位的操作按钮不能一直保持 4 个呢？就是查看、修改、第三个按钮是下架或者是重新发布，第四个按钮是删除。
你不觉得这样很统一吗
