# dianfeidianliang

## 介绍

月度电费电量数据可视化看板。通过 Gitee Pages 实时展示每月用电数据。

## 数据结构

数据存储在 `data.json`，每月一条记录：

```json
{
  "year": 2026,
  "month": 7,
  "kwh": 320.5,
  "cost": 156.8,
  "peak_kwh": 200.0,
  "valley_kwh": 120.5,
  "note": ""
}
```

| 字段 | 说明 |
|------|------|
| year | 年份 |
| month | 月份 (1-12) |
| kwh | 当月总电量 (kWh) |
| cost | 当月电费 (元) |
| peak_kwh | 峰时电量 (kWh) |
| valley_kwh | 谷时电量 (kWh) |
| note | 备注 |

## 更新数据

**方式一：双击 `update.bat`**（推荐）

按提示输入年月、电量、电费，自动提交并推送到 Gitee。

**方式二：手动编辑 `data.json`**

直接编辑 JSON 文件，然后：

```bash
git add data.json
git commit -m "update: 2026-07 data"
git push origin master
```

## 在线查看

开启 Gitee Pages 后，访问 Gitee 提供的链接即可查看仪表盘。

## 技术栈

- HTML + CSS + JavaScript
- [ECharts](https://echarts.apache.org/) 图表
- Gitee Pages 托管