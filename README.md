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
[ApplyCode] [int] IDENTITY(1,1) NOT NULL,
[OrderCode] [int] NULL,
[ApplyStatus] [int] NULL,
[ApplyUser] [nvarchar](10) NULL,
[ApplyDate] [varchar](8) NULL,
[ApplyNum] [nvarchar](20) NULL
```

输出示例

```bash
| 字段 | 类型 | 是否为空 | 默认值 | 说明 |
| :--: | :--: | :--: | :--: | :--: |
| ApplyCode | int | 否 |  | [自增] |
| OrderCode | int | 是 |  |  |
| ApplyStatus | int | 是 |  |  |
| ApplyUser | nvarchar(10) | 是 |  |  |
| ApplyDate | varchar(8) | 是 |  |  |
| ApplyNum | nvarchar(20) | 是 |  |  |
```
## 需要手动填写信息

* 默认值
* 字段说明，包括是否是主键，约束等
