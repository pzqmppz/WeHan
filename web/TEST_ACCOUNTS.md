# 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 企业HR | 
hr1@enterprise.com
enterprise123
| 企业HR | hr2@enterprise.com | enterprise123 |
| 企业HR | hr3@enterprise.com | enterprise123 |
| 管理员 | admin@wehan.com | admin123 |
| 政府 | gov@wuhan.gov.cn | government123 |

## 说明

- `hr1@enterprise.com` 关联 "武汉光谷科技有限公司"，有 3 个已发布岗位
- `hr2@enterprise.com` 关联 "长江智能制造有限公司"，有 2 个岗位
- `hr3@enterprise.com` 关联 "楚天云计算服务有限公司"，有 2 个岗位

## 重置测试数据

```bash
cd web
npx prisma db seed
```
