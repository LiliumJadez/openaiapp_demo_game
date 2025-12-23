# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码并构建
COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# 环境变量
ENV NODE_ENV=production
ENV PORT=3001
ENV MCP_PORT=3002

# 暴露端口
EXPOSE 3001 3002

# 启动命令
CMD ["npm", "run", "server"]

