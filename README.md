# SQL属性生成Markdown表格

## 项目设置
项目克隆下来，先执行一下命令
```
npm install
```

## 在线演示

[在线演示](https://luoyuant.github.io/pages/tools-page/SQLToMarkdownTable/index.html)

## 示例

输入SQL代码示例

```SQL
USE [YiyCits]
GO

/****** Object:  Table [dbo].[Approvals]    Script Date: 2021-06-09 星期三 18:06:00 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Approvals](
	[Code] [int] IDENTITY(1,1) NOT NULL,
	[TableName] [varchar](60) NULL,
	[TableCode] [int] NULL,
	[LinkName] [varchar](60) NULL,
	[UserName] [varchar](20) NULL,
	[CreateTime] [varchar](14) NULL,
	[Reason] [text] NULL,
	[CommitUserName] [varchar](20) NULL,
	[CommitTime] [varchar](14) NULL,
	[No] [int] NULL,
	[Invalid] [int] NULL,
	[Result] [varchar](60) NULL,
	[Memo] [varchar](40) NULL,
	[CheckNumber] [varchar](20) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'审核备注' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Approvals', @level2type=N'COLUMN',@level2name=N'Memo'
GO



```

输出示例

```bash
数据表说明：...

| 字段 | 类型 | 是否为空 | 默认值 | 说明 |
| :--: | :--: | :--: | :--: | :--: |
| Code | int | 否 |  | [自增] |
| TableName | varchar(60) | 是 |  |  |
| TableCode | int | 是 |  |  |
| LinkName | varchar(60) | 是 |  |  |
| UserName | varchar(20) | 是 |  |  |
| CreateTime | varchar(14) | 是 |  |  |
| Reason | text | 是 |  |  |
| CommitUserName | varchar(20) | 是 |  |  |
| CommitTime | varchar(14) | 是 |  |  |
| No | int | 是 |  |  |
| Invalid | int | 是 |  |  |
| Result | varchar(60) | 是 |  |  |
| Memo | varchar(40) | 是 |  | 审核备注 |
| CheckNumber | varchar(20) | 是 |  |  |

数据表更新日志

| 修改内容 | 修改时间 | 修订人 |
| :--: | :--: | :--: |
| 修改了xxx | 2021-6-8 | 张三 |
```
## 需要手动填写信息

* 字段说明，如果数据库定义里边没有说明则需要手动填写
