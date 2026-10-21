# 询盘表单（contact.html）上线说明

> 目标：TikTok 主页 / 邮件推广 / Google 流量 进来的访客，**不用唤起邮件客户端**，直接在站上填表，询盘自动发到 **bob@ssmug.com** 你的邮箱。
> 状态：**代码已完工并上线**。只差你 1 分钟操作（注册一个表单服务拿 key）就能真正收到询盘。

---

## 一、现在是什么样

| 能力 | 状态 |
|---|---|
| 访客在站内填表，不用开邮件客户端 | 已做好（`assets/js/inquiry.js` 接管提交） |
| 询盘直达 bob@ssmug.com 邮箱 | **待你填 key**（下面一节，1 分钟） |
| 提交成功/失败都有明确提示，不静默失败 | 已做好 |
| 知道询盘来自哪个渠道（TikTok/Google/邮件） | 已做好，每封询盘邮件带 `Channel:` 字段 |
| 防垃圾提交（隐藏蜜罐 + 提交速度检测） | 已做好 |
| 手机端自适应 | 已做好 |
| 表单没配好时的兜底（唤起邮件客户端） | 已做好，不会白屏 |

**为什么原来那个 mailto 表单不能用**：访客点"发送"会跳到自己电脑的邮件客户端——在手机上大概率直接放弃（这一步流失 70% 以上），而且询盘内容取决于对方客户端是否正常。

---

## 二、你要做的（1 分钟，免费）

**推荐：Web3Forms**（免费、不限条数、不用绑卡）

1. 打开 https://web3forms.com ，用 **bob@ssmug.com** 注册
2. 它会给你发一封邮件，邮件里有 **access key**（一串字符）
3. 把 key 填进 `assets/js/inquiry.js` 顶部的 `FORM_CONFIG.web3forms`：

```js
var FORM_CONFIG = {
    web3forms: '把这里换成你的access key',   // <- 改这一处
    formspree: '',
    ...
};
```

4. 告诉我一声，我帮你提交推送（或者你自己 `git add -A && git commit -m "..." && git push`）

**备选：Formspree**（免费 50 条/月）
在 formspree.io 建表单拿 form id，填进 `FORM_CONFIG.formspree`（形如 `abcdwxyz`）。

> 两个都填的话，Web3Forms 优先；一个都不填，表单仍然能提交，只是退回旧的邮件客户端方式。

---

## 三、每个渠道用哪个链接（带来源标记）

同一张表单，但链接不同，邮箱里就能看出询盘来源：

| 渠道 | 链接 |
|---|---|
| **TikTok 主页 bio** | `https://ssmug.com/contact.html?utm_source=tiktok&utm_medium=social&utm_campaign=bio` |
| **邮件推广（EDM）** | `https://ssmug.com/contact.html?utm_source=email&utm_medium=edm&utm_campaign=oct26`（campaign 每次换个名，方便分辨是第几批发信） |
| **Google 自然流量** | 不用加参数，脚本自动识别为 `google` |
| **工厂视频挂机导流** | `https://ssmug.com/contact.html?utm_source=tiktok&utm_medium=social&utm_campaign=video01`（video01、video02… 对应脚本编号） |

收到询盘时，邮件里会有一行 `Channel: tiktok` / `google` / `email` / `direct`，还有 `Landing`、`Referrer`、`Utm Campaign` —— 哪条视频、哪次发信带来的询盘，一目了然。**这就是不用装统计代码也能做渠道归因的办法。**

---

## 四、进阶（以后想做自持版再动，现在别碰）

自建方案 = Cloudflare Workers + Email Routing（询盘直接落邮箱 + KV 留档，零第三方）。

**门槛**：ssmug.com 的 DNS 现在挂在 GoDaddy（ns31/ns32.domaincontrol.com），要自建 Worker 得把 NS 迁到 Cloudflare，迁移期间有断站/断邮箱风险。

**建议**：先跑 Web3Forms 三个月，等询盘量稳定（>50 条/月）再考虑迁移，把精力留给内容和 SEO。

如果你要走这条，随时找我，我按顺序做：① 备份 DNS 记录 → ② 迁 NS → ③ 建 Worker + 配 Email Routing（DKIM 记录） → ④ 换 `FORM_CONFIG.worker` 留档 + `FORM_CONFIG.web3forms` 保留双写 → ⑤ 回滚预案。

---

## 五、代码位置

| 文件 | 作用 |
|---|---|
| `contact.html` | 表单页面（字段、隐藏路由字段、成功卡片） |
| `assets/js/inquiry.js` | 投递逻辑 + 来源追踪 + 防垃圾（**要填 key 就改这里顶部**） |
| `assets/css/style.css` | 表单相关样式（末尾 `.form-status` / `.form-done` / `.chk-grid` 段） |

表单字段：姓名*、公司*、邮箱*、国家、WhatsApp/Telegram、电话、产品、**数量 pcs**、**目标单价 USD**、**要求交期**、定制项多选（logo/颜色/包装/从零设计/认证文件）、留言 —— 都是 B2B 买家真正会给的信息，够你判断单子大小和优先级。
