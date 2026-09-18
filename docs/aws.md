# AWS 操作说明

买服务器、查实例、SSH 登录，一律用 **`other`** 账号，区域 **新加坡 `ap-southeast-1`**。

不要覆盖本机 `default` 账号。

## 1. 账号

| Profile | 账号 ID | 用途 | 区域 |
|---|---|---|---|
| `default` | `469244221514` | 原来的账号，别动 | `ap-southeast-1` |
| **`other`** | **`427762493364`** | **本项目用这个** | **`ap-southeast-1`** |

确认连的是哪个账号：

```bash
aws sts get-caller-identity --profile other
```

必须看到 `Account: 427762493364`。

当前终端一直用这个账号：

```bash
export AWS_PROFILE=other
aws sts get-caller-identity
```

切回原来的账号：

```bash
unset AWS_PROFILE
```

`AWS_PROFILE` 只对当前终端有效。新开终端会回到 `default`。

### 浏览器登录过期后

`other` 是 `aws login` 临时会话，大约 12 小时过期。过期后：

```bash
aws login --profile other
aws sts get-caller-identity --profile other
```

退出这次登录：

```bash
aws logout --profile other
```

注意：

- 不要把新账号 Access Key 写进 `default`
- 如果设了 `AWS_ACCESS_KEY_ID`，会盖过 profile。先 `unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY`
- 命令打到错误区域时，显式加 `--region ap-southeast-1`

本机配置在 `~/.aws/config`：

```ini
[profile other]
login_session = arn:aws:iam::427762493364:root
region = ap-southeast-1
output = json
```

## 2. 当前服务器

已在 Lightsail 开好一台 Ubuntu 24.04，2 vCPU / 4 GB / 80 GB SSD。

| 项 | 值 |
|---|---|
| AWS 账号 | `427762493364`（profile `other`） |
| 区域 | `ap-southeast-1`（新加坡） |
| 可用区 | `ap-southeast-1a` |
| 产品 | Lightsail |
| 实例名 | `tokens16888-web` |
| 套餐 | `medium_3_0`（2C4G，公网 IPv4） |
| 系统 | Ubuntu 24.04 LTS |
| SSH 用户 | `ubuntu` |
| 公网静态 IP | `54.151.248.175` |
| 静态 IP 名 | `tokens16888-ip` |
| 内网 IP | `172.26.8.104` |
| SSH 私钥 | `~/.ssh/tokens16888.pem` |
| Lightsail 密钥名 | `tokens16888` |
| 开放端口 | 22 / 80 / 443（**不要开 8080**） |
| 域名 | `tokens16888.com` |

登录：

```bash
ssh -i ~/.ssh/tokens16888.pem ubuntu@54.151.248.175
```

私钥权限必须是 `400`，不要提交到 Git。

## 3. 代码仓库

源码来自官方仓库，不是 `inccleo/sub2api`。本仓库根目录只放运维文档，官方代码在 `sub2api/`。

| 项 | 地址 |
|---|---|
| 官方源码 | https://github.com/Wei-Shaw/sub2api |
| 本项目仓库 | https://github.com/inccleo/tokens16888 |
| 本地源码目录 | `sub2api/` |

`inccleo/tokens16888` 是独立仓库（官方源码拷贝），**不要改、不要当成** 原来的 `inccleo/sub2api`。

## 4. 应用部署

已用官方 `Wei-Shaw/sub2api` 的 Docker Compose 部署。应用只监听本机 `127.0.0.1:8080`，公网 **不要开 8080**。对外只走域名 `tokens16888.com`（Nginx 80 反代）。

| 项 | 值 |
|---|---|
| 访问地址 | http://tokens16888.com |
| 健康检查 | http://tokens16888.com/health |
| Nginx | `/etc/nginx/sites-available/tokens16888.com` |
| 应用绑定 | `127.0.0.1:8080`（不对外开放） |
| 服务器目录 | `/opt/tokens16888` |
| Compose 文件 | `/opt/tokens16888/docker-compose.yml`（来自官方 `deploy/docker-compose.local.yml`） |
| 管理员邮箱 | `admin@tokens16888.local` |
| 管理员密码 | 在服务器 `/opt/tokens16888/.admin_password`，不要提交 Git |

登录后台：

```bash
ssh -i ~/.ssh/tokens16888.pem ubuntu@54.151.248.175
cat /opt/tokens16888/.admin_password
```

然后浏览器打开 http://tokens16888.com ，用上面的邮箱和密码登录。不要用 `IP:8080`。

DNS 必须解析到这台机器的静态 IP `54.151.248.175`。如果走 Cloudflare 橙色云（代理），公网看到的是 Cloudflare IP，不是源站；源站证书也申请不了。需要二选一：

- Cloudflare 记录改成 **仅 DNS**（灰色云），A 记录指向 `54.151.248.175`
- 或者继续用 Cloudflare 代理，SSL 选 Flexible，源站仍走 HTTP 80

常用命令（SSH 到服务器后）：

```bash
cd /opt/tokens16888
sudo docker compose ps
sudo docker compose logs -f sub2api
sudo docker compose restart
sudo docker compose pull && sudo docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
```

## 5. 常用操作

先切到 `other`：

```bash
export AWS_PROFILE=other
```

```bash
# 看这台机器
aws lightsail get-instance --region ap-southeast-1 --instance-name tokens16888-web

# 关机（停计算费；静态 IP 绑着不另收）
aws lightsail stop-instance --region ap-southeast-1 --instance-name tokens16888-web

# 开机
aws lightsail start-instance --region ap-southeast-1 --instance-name tokens16888-web

# 重启
aws lightsail reboot-instance --region ap-southeast-1 --instance-name tokens16888-web

# 删除实例（不可恢复）
aws lightsail delete-instance --region ap-southeast-1 --instance-name tokens16888-web

# 静态 IP 没绑实例时会收费，不用了就删掉
aws lightsail release-static-ip --region ap-southeast-1 --static-ip-name tokens16888-ip
```

开放端口：

```bash
aws lightsail open-instance-public-ports \
  --region ap-southeast-1 \
  --instance-name tokens16888-web \
  --port-info fromPort=80,toPort=80,protocol=tcp,cidrs=0.0.0.0/0
```

## 6. 排错

| 现象 | 处理 |
|---|---|
| `ExpiredToken` / 凭证失效 | `aws login --profile other` |
| 账号不对 | `aws sts get-caller-identity --profile other`，必须是 `427762493364` |
| 切了 profile 仍是旧账号 | `unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY` |
| SSH `Permission denied` | 用户是 `ubuntu`，私钥 `~/.ssh/tokens16888.pem`，权限 `400` |
| SSH 超时 | 实例是否 `running`，22 端口是否开放 |
| 命令打到错误区域 | `--region ap-southeast-1` |
| 网页打不开 | 确认实例 `running`，80 端口已开，DNS 指向 `54.151.248.175`，`sudo docker compose ps` 三个容器都是 healthy |
| 域名还是停车页 | Cloudflare 仍在代理或没指到这台源站。把 A 记录改成 `54.151.248.175`，代理关掉后再试 |
| `IP:8080` 打不开 | 正常。8080 只绑 `127.0.0.1`，公网已关闭 |
