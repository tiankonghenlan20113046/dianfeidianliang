# dianfeidianliang

家庭电费电量数据可视化看板，支持月度概览、每日明细与截图 OCR 录入。

## 在线访问

**GitHub Pages**: <https://tiankonghenlan20113046.github.io/dianfeidianliang/>

| 页面 | 说明 |
|------|------|
| [月度概览](https://tiankonghenlan20113046.github.io/dianfeidianliang/) | 按年份切换，查看每月电量/电费柱状图、折线图与数据表 |
| [每日用电量](https://tiankonghenlan20113046.github.io/dianfeidianliang/daily.html) | 按月份切换，查看日历热力图、每日用电趋势与明细表 |
| [截图录入](https://tiankonghenlan20113046.github.io/dianfeidianliang/upload.html) | 上传截图自动 OCR 识别，编辑后导出 JSON 或直接推送 GitHub |

## 功能特性

### 月度概览（index.html）
- **年份切换标签** — 全部 / 2024年 / 2025年 / 2026年 一键切换
- **KPI 卡片** — 本月电量、本月电费、年度累计电量、年度累计电费
- **双图表** — 月度电费柱状图 + 月度电量折线面积图
- **可点击跳转** — 点击图表柱子或表格行，跳转到对应月份的每日用电量页面
- **数据表格** — 逐月展示电量、电费，hover 高亮

### 每日用电量（daily.html）
- **月份切换标签** — 4月 / 5月 / 6月 / 7月（按数据自动生成）
- **KPI 卡片** — 合计电量、日均电量、单日最高、单日最低
- **日历热力图** — 四色分级显示每日用电量
  - 绿色 0-10 kWh | 蓝色 11-20 kWh | 橙色 21-30 kWh | 红色 31+ kWh
- **趋势柱状图** — 带颜色分级 + 日均参考线 + 趋势曲线
- **用电明细表** — 每日数值 + 等级标签
- **URL 参数** — 支持 `daily.html?m=2026-06` 直接定位到指定月份

### 截图录入（upload.html）
- **OCR 自动识别** — 基于 Tesseract.js，纯浏览器端运行，无需服务器
- **双模式** — 支持月度账单截图和每日用电截图两种数据类型
- **多种上传方式** — 拖拽、点击选择、Ctrl+V 粘贴
- **智能解析** — 自动提取年月、电量、电费，支持多种截图格式
- **可编辑结果** — 识别后可在表格中直接修改、添加、删除
- **三种导出方式**：
  - 下载 JSON 文件（单独）
  - 合并现有数据并下载（自动去重排序）
  - 直接推送到 GitHub（需输入 Token，仅本会话使用）
- **原始文本查看** — 可查看和编辑 OCR 原始文本，修改后重新解析

## 数据结构

### 月度数据（data.json）

每月一条记录，按时间升序排列：

```json
{
  "year": 2026,
  "month": 6,
  "kwh": 139,
  "cost": 68,
  "note": ""
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| year | int | 年份 |
| month | int | 月份 (1-12) |
| kwh | number | 当月总电量 (kWh) |
| cost | number | 当月电费 (元) |
| note | string | 备注（可空） |

### 每日数据（daily.json）

每天一条记录：

```json
{
  "date": "2026-06-13",
  "kwh": 9.88
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| date | string | 日期，格式 YYYY-MM-DD |
| kwh | number | 当日用电量 (kWh) |

## 项目结构

```
dianfeidianliang/
├── index.html              # 月度概览页面
├── daily.html              # 每日用电量页面
├── upload.html             # 截图 OCR 录入页面
├── data.json               # 月度电费电量数据
├── daily.json              # 每日用电量数据
├── assets/
│   ├── charts.js           # 月度图表逻辑（ECharts）
│   ├── daily-charts.js     # 每日图表逻辑（ECharts）
│   └── ocr-parser.js       # OCR 文本解析逻辑
├── _shared/
│   └── js/
│       └── echarts.min.js  # ECharts 库（本地引用）
├── update.bat              # 一键更新月度数据脚本
└── README.md
```

## 更新数据

### 方式一：截图 OCR 录入（推荐）

访问 [截图录入页面](https://tiankonghenlan20113046.github.io/dianfeidianliang/upload.html)：

1. 选择数据类型（月度 / 每日）
2. 上传或粘贴"网上国网"App 截图
3. OCR 自动识别，在表格中核对修改
4. 点击「合并现有数据并下载」或直接推送到 GitHub

### 方式二：使用 update.bat（月度数据）

双击运行 `update.bat`，按提示输入年份、月份、电量、电费，脚本会自动更新 `data.json` 并推送到 GitHub。

### 方式三：手动编辑

直接编辑 `data.json` 或 `daily.json`，然后提交：

```bash
git add data.json
git commit -m "update: 2026-06 data"
git push github master
```

## 技术栈

- HTML + CSS + 原生 JavaScript（无框架依赖）
- [ECharts](https://echarts.apache.org/) 数据可视化
- [Tesseract.js](https://tesseract.projectnaptha.com/) 浏览器端 OCR 文字识别
- GitHub Pages 静态托管
- 数据与展示分离：JSON 文件 + 前端 fetch 动态渲染

## 数据来源

手动录入，数据来源于"网上国网"App 月度账单和每日用电情况截图。
