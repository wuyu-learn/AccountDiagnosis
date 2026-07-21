# 从本地推送更新到 GitHub

> 适用于本项目（`Account Diagnosis`）从 Windows 环境推送代码到 GitHub。  
> 命令在 CMD、PowerShell、Git Bash、VS Code 终端 中基本相同，唯一区别是 **路径写法**：CMD/PowerShell 用 `C:\Users\...`，Git Bash 用 `/c/Users/...`。

---

## 0. 前置条件

1. 已安装 [Git](https://git-scm.com/)。
2. 本地仓库已与 GitHub 仓库关联：
   ```bash
   git remote -v
   ```
   应看到类似输出：
   ```
   origin  git@github.com:你的用户名/仓库名.git (fetch)
   origin  git@github.com:你的用户名/仓库名.git (push)
   ```
   如果还没有 `origin`，先添加：
   ```bash
   git remote add origin git@github.com:你的用户名/仓库名.git
   # 或使用 HTTPS
   git remote add origin https://github.com/你的用户名/仓库名.git
   ```
3. 已完成 GitHub 身份验证：
   - **SSH 方式**：本地 `~/.ssh/id_rsa.pub` 已添加到 GitHub Settings → SSH and GPG keys。
   - **HTTPS 方式**：使用 GitHub 个人访问令牌（PAT）代替密码，或在浏览器中登录过 GitHub。

---

## 1. 查看当前改动

```bash
cd "C:\Users\EDY\Desktop\code\HTML\Account Diagnosis"
git status
```

> 如果你在 **Git Bash** 里使用，可以用：
> ```bash
> cd "/c/Users/EDY/Desktop/code/HTML/Account Diagnosis"
> git status
> ```

绿色 = 已暂存，红色 = 已修改但未暂存，未跟踪文件会单独列出。

---

## 2. 添加改动到暂存区

### 添加所有改动

```bash
git add .
```

### 只添加某个文件

```bash
git add 文件名
# 示例
git push modular-account-diagnosis/new/sections/acc01-total-asset.html
```

---

## 3. 提交改动

```bash
git commit -m "提交说明"
```

示例：

```bash
git commit -m "账户总资产卡：去掉今日收益和持仓收益下的收益率"
```

提交说明建议简洁、能直接看出改了什么。如果一次改动内容多，可以写多行：

```bash
git commit -m "标题" -m "详细说明第一行" -m "详细说明第二行"
```

---

## 4. 拉取远端最新代码（避免冲突）

```bash
git pull origin main
```

如果出现冲突，Git 会提示你解决。解决后重新 `git add .` 和 `git commit`。

---

## 5. 推送到 GitHub

```bash
git push origin main
```

如果你的本地分支名不是 `main`，替换成对应分支名，例如：

```bash
git push origin 你的分支名
```

如果是第一次推送本地新分支到远端：

```bash
git push -u origin 你的分支名
```

---

## 6. 验证是否推送成功

1. 命令行看到类似 `...done` / `...To github.com:...` 即成功。
2. 打开 GitHub 仓库页面，刷新即可看到最新提交。

---

## 7. 完整流程示例

```bash
cd "C:\Users\EDY\Desktop\code\HTML\Account Diagnosis"
git status
git add modular-account-diagnosis/new/sections/acc01-total-asset.html
git commit -m "账户总资产卡：去掉今日/持仓收益率"
git pull origin main
git push origin main
```

---

## 常见问题

### 提示 `Permission denied (publickey)`

说明 SSH 密钥没有配置好。可以换成 HTTPS：

```bash
git remote set-url origin https://github.com/你的用户名/仓库名.git
```

或者重新生成 SSH 密钥并添加到 GitHub。

### 提示 `Updates were rejected because the remote contains work that you do not have`

远端有本地没有的提交。先执行：

```bash
git pull origin main
```

解决冲突后再 `git push`。

### 不想提交某个文件的改动

```bash
git restore --staged 文件名   # 从暂存区移除
git restore 文件名            # 撤销工作区修改
```

---

## 附：只改了一个文件的最简命令

```bash
git add modular-account-diagnosis/new/sections/acc01-total-asset.html
git commit -m "更新账户总资产卡"
git push origin main
```
