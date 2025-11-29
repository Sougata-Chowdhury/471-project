# Deployment & DevOps Guide

## Environment-Specific Builds

### Development
```bash
cd bracunet/infra
docker-compose -f docker-compose.dev.yml up
```

### Local Full Stack (Development)
```bash
cd bracunet/infra
docker-compose up
```

### Production
```bash
cd bracunet/infra
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

- **Development**: Use `.env.development`
- **Production**: Use `.env.production` (set via secrets/vault, never commit)

### Setting Production Secrets
```bash
# Using .env.prod file (don't commit this)
export $(cat .env.production | xargs)
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Images

### Backend
- Multi-stage build using Node 20 Alpine (small footprint)
- Non-root user (`nestjs`) for security
- Health check endpoint: `GET /health`
- Production build output: `dist/main.js`

### Frontend
- Multi-stage build: Node 20 Alpine → Nginx Alpine
- Optimized Nginx static file serving
- Health check: HTTP GET `/`
- Production build output: React SPA served via Nginx

## Kubernetes Deployment

Manifests are in `k8s/` directory:
- `backend-deployment.yaml` - NestJS deployment with replicas
- `frontend-deployment.yaml` - Nginx deployment with replicas
- `services.yaml` - Service definitions and ingress

Deploy to K8s:
```bash
kubectl apply -f infra/k8s/
```

## Database Backups

### MongoDB Local Development
Data is persisted in Docker volume: `mongo_data`

### MongoDB Production
- Use managed MongoDB Atlas or Enterprise backups
- Connection string: `mongodb+srv://user:pass@cluster/bracunet`
- Set `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` in production secrets

## CI/CD Integration

GitHub Actions workflows should:
1. Build and tag Docker images
2. Push to registry (Docker Hub, ECR, etc.)
3. Deploy to staging/production environment

Example GitHub Actions workflow in `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push
        run: |
          docker build -f backend/Dockerfile -t bracunet-backend:latest .
          docker push bracunet-backend:latest
```

## Scaling & Performance

- **Frontend**: Nginx serves static assets with gzip compression
- **Backend**: NestJS scales horizontally; use load balancer
- **Database**: MongoDB Atlas auto-scaling or enterprise setup
- **Caching**: Add Redis for session management if needed
- **CDN**: Serve frontend assets via CDN (CloudFlare, AWS CloudFront)

## Monitoring & Logging

Add monitoring tools:
- **Logs**: ELK stack or cloud provider logging (CloudWatch, Stackdriver)
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger or DataDog
- **Error tracking**: Sentry

## Security Best Practices

✅ Non-root Docker users
✅ Health checks configured
✅ Environment secrets via vault (not in code)
✅ CORS configured in NestJS
✅ Input validation via NestJS ValidationPipe
✅ MongoDB auth with username/password

TODO:
- [ ] Enable HTTPS/TLS (use Let's Encrypt)
- [ ] Add API rate limiting
- [ ] Implement request logging
- [ ] Add authentication guards on all endpoints
- [ ] Regular security audits
