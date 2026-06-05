# Recipe Finder API — Full Documentation

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <accessToken>` header for protected routes

---

## 1. AUTH

### POST /auth/register
```json
// Request
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "securePass123"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "role": "user",
      "avatar": null,
      "created_at": "2024-01-15T08:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
// refreshToken is set as httpOnly cookie automatically
```

### POST /auth/login
```json
// Request
{ "email": "user@example.com", "password": "securePass123" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Nguyen Van A", "role": "user" },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/refresh
```
// No body needed — reads refreshToken from httpOnly cookie
// Response: new accessToken + rotated refreshToken cookie
```

### POST /auth/logout
```
// No body — clears the refreshToken cookie
// Response 200: { "success": true, "message": "Logged out successfully" }
```

### GET /auth/google
```
// Redirects to Google consent screen
// On success → redirects to: CLIENT_URL/oauth/callback?token=<accessToken>
```

### GET /auth/me  🔒
```json
// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "role": "user",
      "dietary_prefs": { "vegan": false, "glutenFree": true }
    }
  }
}
```

---

## 2. RECIPES

### GET /recipes/status
```json
// Response 200
{
  "success": true,
  "data": {
    "mode": "mock",
    "usingFallback": true,
    "provider": "bundled-sample-data"
  }
}
```

### GET /recipes/search
Query params: `q`, `ingredients`, `cuisine`, `diet`, `type`, `page`, `limit`

```
GET /recipes/search?q=pasta&cuisine=italian&diet=vegetarian&page=1&limit=12
```
```json
// Response 200
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 716429,
        "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
        "image": "https://spoonacular.com/recipeImages/716429-312x231.jpg",
        "readyInMinutes": 45,
        "servings": 2,
        "vegetarian": true,
        "vegan": false,
        "glutenFree": false
      }
    ],
    "totalResults": 82,
    "page": 1,
    "limit": 12,
    "totalPages": 7,
    "source": "live"
  }
}
```

### GET /recipes/:id
```
GET /recipes/716429
```
```json
// Response 200
{
  "success": true,
  "data": {
    "recipe": {
      "id": 716429,
      "title": "Pasta with Garlic, Scallions...",
      "image": "https://...",
      "readyInMinutes": 45,
      "servings": 2,
      "sourceUrl": "https://...",
      "summary": "...",
      "instructions": "...",
      "extendedIngredients": [
        { "id": 20420, "name": "pasta", "amount": 2, "unit": "cups" }
      ],
      "nutrition": {
        "nutrients": [
          { "name": "Calories", "amount": 584.49, "unit": "kcal" }
        ]
      }
    }
  }
}
```

---

## 3. WISHLIST 🔒

### GET /wishlist
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "recipe_id": "716429",
        "recipe_title": "Pasta with Garlic...",
        "recipe_image": "https://...",
        "ready_in_min": 45,
        "servings": 2,
        "saved_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### POST /wishlist
```json
// Request
{
  "recipeId": "716429",
  "recipeTitle": "Pasta with Garlic, Scallions...",
  "recipeImage": "https://spoonacular.com/recipeImages/716429-312x231.jpg",
  "readyInMinutes": 45,
  "servings": 2,
  "sourceUrl": "https://..."
}

// Response 201
{
  "success": true,
  "message": "Added to wishlist",
  "data": { "item": { "id": 1, "recipe_id": "716429", ... } }
}
```

### DELETE /wishlist/:recipeId
```
DELETE /wishlist/716429
// Response 200: { "success": true, "message": "Removed from wishlist" }
```

### GET /wishlist/check/:recipeId
```json
// Response 200
{ "success": true, "data": { "saved": true, "item": { ... } } }
```

---

## 4. MEAL PLANNER 🔒

### GET /planner?week=2024-01-15
```json
// Response 200
{
  "success": true,
  "data": {
    "plan": {
      "id": 1,
      "user_id": 1,
      "week_start": "2024-01-15",
      "entries": [
        {
          "id": 1,
          "day_of_week": "Monday",
          "meal_type": "breakfast",
          "recipe_id": "715594",
          "recipe_title": "Homemade Granola",
          "recipe_image": "https://...",
          "servings": 2
        },
        {
          "id": 2,
          "day_of_week": "Monday",
          "meal_type": "dinner",
          "recipe_id": "716429",
          "recipe_title": "Pasta with Garlic...",
          "recipe_image": "https://...",
          "servings": 2
        }
      ]
    }
  }
}
```

### POST /planner/entry
```json
// Request
{
  "weekStart": "2024-01-15",
  "dayOfWeek": "Monday",
  "mealType": "dinner",
  "recipeId": "716429",
  "recipeTitle": "Pasta with Garlic, Scallions...",
  "recipeImage": "https://...",
  "servings": 2
}

// Response 201
{
  "success": true,
  "message": "Meal plan updated",
  "data": {
    "entry": { "id": 2, "day_of_week": "Monday", "meal_type": "dinner", ... },
    "planId": 1
  }
}
```

### DELETE /planner/entry/:entryId?planId=1
```
// Response 200: { "success": true, "message": "Entry removed" }
```

---

## 5. SHOPPING LIST 🔒

### POST /shopping/generate/:planId
```json
// Response 201
{
  "success": true,
  "message": "Shopping list generated",
  "data": {
    "list": {
      "id": 1,
      "plan_id": 1,
      "name": "Weekly Shopping List",
      "generated_at": "2024-01-15T12:00:00.000Z",
      "items": [
        {
          "id": 1,
          "ingredient_name": "pasta",
          "amount": 3.5,
          "unit": "cups",
          "aisle": "Pasta and Rice",
          "is_checked": 0
        },
        {
          "id": 2,
          "ingredient_name": "garlic",
          "amount": 6,
          "unit": "cloves",
          "aisle": "Produce",
          "is_checked": 0
        }
      ]
    }
  }
}
```

### PATCH /shopping/item/:itemId
```json
// Request: { "isChecked": true }
// Response 200: { "success": true, "data": { "itemId": "1", "isChecked": true } }
```

### GET /shopping/:listId
```json
// Returns list with all items (same structure as generate response)
```

### DELETE /shopping/:listId
```
// Response 200: { "success": true, "message": "Shopping list deleted" }
```

---

## 6. NEWS

### GET /news?category=health&page=1
Categories: `general`, `health`, `trends`, `restaurant`
```json
// Response 200
{
  "success": true,
  "data": {
    "articles": [
      {
        "source": { "id": "bbc-news", "name": "BBC News" },
        "title": "The best foods for gut health in 2024",
        "description": "Nutritionists share the top ingredients...",
        "url": "https://bbc.com/...",
        "urlToImage": "https://...",
        "publishedAt": "2024-01-15T09:00:00Z"
      }
    ],
    "totalResults": 38,
    "page": 1,
    "limit": 12,
    "category": "health"
  }
}
```

---

## 7. ADMIN 🔒👑

### GET /admin/stats
```json
// Response 200
{
  "success": true,
  "data": {
    "totalUsers": 240,
    "totalWishlists": 1842,
    "totalPlans": 318,
    "newToday": 7,
    "topRecipes": [
      { "recipe_id": "716429", "recipe_title": "Pasta with Garlic...", "save_count": 42 }
    ]
  }
}
```

### GET /admin/users?page=1&limit=20
```json
// Returns paginated user list with role, active status, created_at
```

### PATCH /admin/users/:id
```json
// Request: { "role": "admin" }  OR  { "isActive": false }
```

### DELETE /admin/users/:id
```
// Response 200: { "success": true, "message": "User deleted" }
```

---

## Error Response Format
All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [                         // only on validation errors (422)
    { "field": "email", "message": "Valid email required" }
  ],
  "stack": "..."                      // only in NODE_ENV=development
}
```

## HTTP Status Codes Used
| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad request (missing params) |
| 401  | Unauthorized (no/invalid token) |
| 403  | Forbidden (not your resource) |
| 404  | Not found |
| 409  | Conflict (duplicate) |
| 422  | Validation error |
| 429  | Rate limit exceeded |
| 500  | Server error |
