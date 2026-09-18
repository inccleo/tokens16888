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

## 3.1 自己改代码并部署

用 GitHub Actions 自动构建，不要在本机 `docker build`。

官方 `sub2api/.github/workflows/release.yml` 现在不会跑：GitHub 只认仓库根目录的 `.github/workflows`。本仓库用根目录的 `Build image`：推 `main` 且改了 `sub2api/`，就会构建并推到 GHCR。

镜像：

```text
ghcr.io/inccleo/tokens16888:latest
```

改代码流程：

1. 在 `sub2api/` 里改（后端 `backend/`，前端 `frontend/`）
2. 提交并推到 `main`
3. 等 Actions 的 **Build image** 成功
4. 服务器拉新镜像重启：

```bash
ssh -i ~/.ssh/tokens16888.pem ubuntu@54.151.248.175
cd /opt/tokens16888
sudo docker compose pull
sudo docker compose up -d
```

第一次改成自己的镜像时，先把 compose 里的镜像从官方换成 GHCR：

```bash
cd /opt/tokens16888
sudo sed -i 's|image:.*sub2api.*|image: ghcr.io/inccleo/tokens16888:latest|' docker-compose.yml
grep image docker-compose.yml
```

如果 `docker pull` 提示 private package，把 GitHub Package `tokens16888` 设成 Public，或在服务器登录 GHCR：

```bash
echo YOUR_GITHUB_TOKEN | sudo docker login ghcr.io -u inccleo --password-stdin
```

不要再拉 `weishaw/sub2api:latest`，那会覆盖你的改动。数据在 `/opt/tokens16888/data`、`postgres_data`、`redis_data`，重建应用容器不会清库。

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

Cloudflare 可以继续用橙色云（已代理）。`tokens16888.com` 只保留这一条 A 记录：

| 名称 | 类型 | 内容 | 代理 |
|---|---|---|---|
| `tokens16888.com` | A | `54.151.248.175` | 已代理 |

不要再挂 `54.149.79.189`、`34.216.117.25` 这些旧 IP，否则会轮询到停车页。

源站 80/443 都已开。Cloudflare SSL/TLS 用 **Full** 即可（不要用 Full (strict)，源站现在是自签证书）。

浏览器打开 `https://tokens16888.com`。如果还看到 521，硬刷新或清缓存后再试。

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
| 域名还是停车页 | Cloudflare 同一域名挂了多条 A 记录，删掉旧 IP，只留 `54.151.248.175` |
| `Error 521 Web server is down` | Cloudflare 在回源 443，源站当时没开 HTTPS。现在已开。SSL 用 Full，不要 Full (strict) |
| `IP:8080` 打不开 | 正常。8080 只绑 `127.0.0.1`，公网已关闭 |
