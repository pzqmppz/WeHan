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


## 017 完整测试
1.登录| 企业HR | hr1@enterprise.com | enterprise123 |
各项功能测试正常，在登出时，点击右上角头像，其中的个人设置和退出登录功能均无效

2.直接手动返回登录页面，登录| 学校 | whu@school.com | school123 |
跳转进了http://localhost:3000/enterprise
进入首页，显示企业信息不存在。
调试台报错信息：
useDashboardData.ts:73 
 GET http://localhost:3000/api/dashboard/enterprise 404 (Not Found)
useDashboardData.useEffect.fetchData	@	useDashboardData.ts:73
useDashboardData.useEffect	@	useDashboardData.ts:88
"use client"		
Promise.all	@	VM218 <anonymous>:1
Promise.all	@	VM218 <anonymous>:1
Promise.all	@	VM218 <anonymous>:1
Promise.then		
handleSubmit	@	page.tsx:53
<Form>		
LoginForm	@	page.tsx:89
<LoginForm>		
LoginPage	@	page.tsx:155
"use client"		
Promise.all	@	VM218 <anonymous>:1
Promise.all	@	VM218 <anonymous>:1
<LinkComponent>		
PortalHeader	@	PortalHeader.tsx:32
<PortalHeader>		
HomePage	@	page.tsx:59
"use client"		
Promise.all	@	VM218 <anonymous>:1

3.重新打开无痕浏览器，登录| 学校 | whu@school.com | school123 |
依旧跳转http://localhost:3000/enterprise

4.重新打开无痕浏览器，登录 管理员 | admin@wehan.com | admin123
跳转http://localhost:3000/enterprise

5.重新打开无痕浏览器，登录 | 政府 | gov@wuhan.gov.cn | government123 |
依旧跳转http://localhost:3000/enterprise


## 018 完整测试

1.登录 学校 | whu@school.com | school123 |
正确跳转http://localhost:3000/school
进入首页后，就业看板、岗位推送、学生管理页面都能正常跳转，无报错。
首页展示了毕业生总数、已就业数、就业率、有焊率，这些都有真实的数字。但在学生管理里面没有真实的信息，这个数字是否是前端填入的
且首页提示有最近的岗位推送，给出了 3 个岗位。然后点击“推送岗位”，点击“岗位推送”跳转到岗位推送页面，岗位推送页面为空。
学生管理页面信息也为空。
还有就是学校页面、登录页面似乎没有这个验证学校信息的逻辑。因为账号是你直接给我注册好的，我不确定这个逻辑是否存在。
我尝试点击右上角头像，个人信息跳转到http://localhost:3000/school/profile
该页面报错 404
然后测试退出登录功能，成功退出账号


2.登录 | 政府 | gov@wuhan.gov.cn | government123 |
跳转http://localhost:3000/government
首页展示留汉指数，其中有 4 个仪表盘，前两个仪表盘为完全空白，第三个仪表盘为流汗率，第四个仪表盘为参加企业，这两个是有数据的
下面是热门行业分布，依次排列的是互联网、金融、制造、教育、医疗
右侧是由高校排名，分别是武汉大学、华中科技大学、武汉理工、华中师范、中国地质

点击左侧政策管理，会有提示获取政策列表失败

点击数据统计，里面有总投递数、今日投递、面试总数、留汉率，当前这些信息均为 0

底下有留汉趋势图，目前也都是 0，都是在 X 轴上，是以月度为统计的

然后在右边是行业分布，目前能看到互联网、云计算、智能制造这 3 个行业

在数据统计这个页面停留时http://localhost:3000/government/statistics
我每次切到其他的页面，比如说我现在进入了 VS Code，我在切回到这个网页中时，它就会对这个页面的信息进行一次刷新。希望你确认一下这个刷新的节点是什么，而且它当前这个刷新是否正常，也是需要判断的
。
我尝试点击右上角头像，个人信息跳转到http://localhost:3000/government/profile
该页面报错 404
然后测试退出登录功能，成功退出账号

3.针对以上两种登录方式，它的一个通病就是右上角头像的个人信息页是没有完成的。我们先要讨论规划好个人信息页，它承载的信息是什么，我的想法是在账号进行注册时，它会填入一些信息，比如政府机关是什么、学校是什么。那么我们就把这些信息展示在他的个人信息页里，同时需要界定哪些信息是他可以修改的，哪些信息是不允许他修改的


4.登录 | 管理员 | admin@wehan.com | admin123 |
跳转http://localhost:3000/admin
缺少个人信息页面功能http://localhost:3000/admin/profile
缺少政策管理页面功能http://localhost:3000/admin/policies
缺少岗位管理页面功能http://localhost:3000/admin/jobs
访问均是404
其他页面访问都正常，各页面下的功能点还没有进行测试


## 019 
出现了严重bug，我先登录了管理员账号，进行了页面测试，当测试完成后，我点击右上角的退出。然后我登录了企业端账号。
依旧进入了http://localhost:3000/admin
且右上角身份为武汉市人才服务中心 
进入个人中心 http://localhost:3000/admin/profile 
展示武汉市人才服务中心 为系统管理员
你在同一个页面下登录不同账号，它们的缓存信息是否会影响你下一次的登录？为什么会出现这种情况，登录账号跳转到不同的页面，它的逻辑是怎样的，如果我拿一个公司账号登录学校页面，是否应该直接不允许他登录，是不是要增加一个兜底的逻辑？

## 020
登录报错
hot-reloader-pages.ts:136 控制台数据已被清除
pages-dev-overlay-setup.tsx:85 ./src/components/layout/DashboardLayout.tsx:38:3
Parsing ecmascript source code failed
  36 |   }
  37 |
> 38 |   return (
     |   ^^^^^^^^
> 39 |     <Layout className="min-h-screen">
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 40 |       {/* 侧边栏 */}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 41 |       <DashboardSider
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 42 |         role={role}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 43 |         collapsed={collapsed}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 44 |       />
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 45 |
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 46 |       {/* 主内容区 */}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 47 |       <Layout>
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 48 |         {/* 头部 */}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 49 |         <DashboardHeader
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 50 |           role={role}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 51 |           collapsed={collapsed}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 52 |           onToggle={() => setCollapsed(!collapsed)}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 53 |           userName={userName}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 54 |         />
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 55 |
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 56 |         {/* 内容 */}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 57 |         <Content
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 58 |           className="m-6 p-6"
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 59 |           style={{
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 60 |             background: colorBgContainer,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 61 |             borderRadius: borderRadiusLG,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 62 |             minHeight: 280,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 63 |           }}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 64 |         >
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 65 |           {children}
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 66 |         </Content>
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 67 |       </Layout>
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 68 |     </Layout>
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 69 |   )
     | ^^^^
  70 | }
  71 |

Return statement is not allowed here

Import traces:
  Client Component Browser:
    ./src/components/layout/DashboardLayout.tsx [Client Component Browser]
    ./src/app/(dashboard)/admin/page.tsx [Client Component Browser]
    ./src/app/(dashboard)/admin/page.tsx [Server Component]

  Client Component SSR:
    ./src/components/layout/DashboardLayout.tsx [Client Component SSR]
    ./src/app/(dashboard)/admin/page.tsx [Client Component SSR]
    ./src/app/(dashboard)/admin/page.tsx [Server Component]
nextJsHandleConsoleError @ pages-dev-overlay-setup.tsx:85
handleErrors @ hot-reloader-pages.ts:229
processMessage @ hot-reloader-pages.ts:318
（匿名） @ hot-reloader-pages.ts:100
handleMessage @ websocket.ts:68
