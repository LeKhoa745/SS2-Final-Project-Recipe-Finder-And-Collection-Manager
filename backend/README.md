# Recipe Finder Backend

Node.js + Express + MySQL backend with JWT auth, Spoonacular & NewsAPI integration.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env with your DB credentials and API keys

# 3. Create DB & run schema
mysql -u root -p -e "CREATE DATABASE recipe_finder;"
mysql -u root -p recipe_finder < schema.sql

# 4. Start development server
npm run dev

# 5. Test health endpoint
curl http://localhost:5000/health
```

## Architecture
```
Request → Express Router → Middleware (auth, validate, rateLimit)
        → Controller (parse req/res)
        → Service (business logic)
        → Model (DB queries) / External API (Spoonacular, NewsAPI)
        → Response
```

## Key Design Decisions
- **Dual-token auth**: 15m access token in memory + 7d refresh token in httpOnly cookie
- **API caching**: node-cache with per-resource TTL prevents Spoonacular quota exhaustion
- **Retry logic**: exponential backoff on 429/5xx from external APIs
- **Ingredient consolidation**: shopping list merges duplicate ingredients by name+unit
- **Error hierarchy**: AppError → ValidationError/NotFoundError/etc for clean HTTP codes
- **Google OAuth merges accounts** by email, so email+password users can later add Google

## Environment Variables
See `.env.example` for all required keys.

## API Reference
See `API_DOCS.md` for full request/response examples.
