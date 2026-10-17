# SSMug — ssmug.com 官网（GitHub Pages 部署指南）

纯静态站，无构建步骤。文件结构：

```
ssmug-site/
├── index.html          首页（认证栏/产品矩阵/OEM流程/CTA）
├── products.html       产品目录（5大类，锚点 #bottles #tumblers #flasks #plastic #lunch）
├── about.html          工厂页（认证/展会/验厂邀约）
├── contact.html        询盘表单（默认 mailto，可换 Formspree）
├── blog.html           博客列表
├── blog/               3 篇 SEO 文章
├── assets/css/style.css
├── CNAME               固定域名 ssmug.com
├── robots.txt / sitemap.xml
```

## 一、部署到 GitHub Pages（10 分钟）

1. 在 GitHub 账号（chinaselection-01）下新建仓库，名字建议 `ssmug-site`，Public。
2. 把本目录所有文件推上去：
   ```bash
   cd ssmug-site
   git init && git add . && git commit -m "SSMug site launch"
   git branch -M main
   git remote add origin https://github.com/chinaselection-01/ssmug-site.git
   git push -u origin main
   ```
3. 仓库 → Settings → Pages → Source 选 **Deploy from a branch**，Branch 选 `main` / `(root)`，Save。
4. 等几分钟，先确认 `https://chinaselection-01.github.io/ssmug-site/` 能打开。

## 二、绑定 ssmug.com 域名

1. Settings → Pages → Custom domain 填 `ssmug.com`，勾 Enforce HTTPS（等证书签发）。
2. 到你的域名注册商（在哪家买的 ssmug.com 就在哪家）加 DNS 解析：
   - **A 记录**（根域 ssmug.com）→ GitHub Pages 四个 IP：
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - **CNAME 记录**（www）→ `chinaselection-01.github.io`
3. DNS 生效后（几分钟到几小时）站点就在 ssmug.com 上线。

## 三、询盘表单接真实邮箱（可选，5 分钟）

现在表单是 mailto 兜底。要直接收进邮箱：
1. 注册 https://formspree.io （免费档每月 50 封），建表单拿到 ID。
2. 把 contact.html 里 `action="mailto:bob@ssmug.com"` 改成 `action="https://formspree.io/f/你的ID"`，method 改 `POST`（目前为 mailto 兜底，会拉起访客邮件客户端发往 bob@ssmug.com，即 bob@stwadd.com 的域别名、同一邮箱）。
3. 建议收件邮箱用恒定可靠的（如 hengdacup@foxmail.com 或网易企业邮箱）。

## 四、上线后 SEO 三件事

1. **Google Search Console**：添加资源 ssmug.com，提交 sitemap.xml，验证 DNS。
2. **Bing Webmaster Tools**：可从 GSC 一键导入，覆盖 Bing/部分 AI 引擎抓取。
3. **51.la 或 GA4**：装统计，看询盘从哪篇文章来。

## 五、每周内容节奏（Everich 打法）

- 每周 2 篇博客，选题按 everich-teardown-ssmugs-plan.html 里的 30 篇清单。
- 每篇文章尾部内链一个产品分类 + 询盘按钮（现有 3 篇即模板）。
- 产品图到位后替换各卡片 emoji 占位为真实白底图。

## 备注

- ssmugs.com（旧域名）已决定放弃（赎回成本 ¥880 且无在用邮箱），不再续费。
- 博客文章里的数字（MOQ、交期、产能）按 stwadd.com 现有宣传口径写的，上线前可按实际微调。
