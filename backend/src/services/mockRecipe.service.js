const MOCK_RECIPES = [
  {
    id: 900001,
    title: "Pho Bo Ha Noi",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80",
    readyInMinutes: 120,
    servings: 4,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    cuisine: "vietnamese",
    type: "main course",
    summary:
      "A rich Vietnamese beef noodle soup with aromatic broth, rice noodles, and fresh herbs.",
    instructions:
      "Simmer beef bones with onion, ginger, cinnamon, and star anise. Season the broth, cook rice noodles, slice the beef thinly, then serve with herbs, lime, and chili.",
    sourceUrl: "https://example.com/mock-recipes/pho-bo-ha-noi",
    extendedIngredients: [
      { id: 1, name: "beef bones", amount: 1.5, unit: "kg" },
      { id: 2, name: "rice noodles", amount: 500, unit: "g" },
      { id: 3, name: "ginger", amount: 1, unit: "piece" },
      { id: 4, name: "star anise", amount: 3, unit: "pods" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 520, unit: "kcal" }],
    },
  },
  {
    id: 900002,
    title: "Banh Mi Ga Nuong",
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=1200&q=80",
    readyInMinutes: 35,
    servings: 2,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    cuisine: "vietnamese",
    type: "lunch",
    summary:
      "Crispy baguette filled with grilled chicken, pickled vegetables, cucumber, and fresh cilantro.",
    instructions:
      "Marinate the chicken, grill until charred, toast the baguette, then layer with mayo, pickles, cucumber, herbs, and sliced chicken.",
    sourceUrl: "https://example.com/mock-recipes/banh-mi-ga-nuong",
    extendedIngredients: [
      { id: 5, name: "baguette", amount: 2, unit: "pieces" },
      { id: 6, name: "chicken thigh", amount: 300, unit: "g" },
      { id: 7, name: "pickled carrot", amount: 100, unit: "g" },
      { id: 8, name: "cucumber", amount: 1, unit: "piece" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 480, unit: "kcal" }],
    },
  },
  {
    id: 900003,
    title: "Bun Cha Ha Noi",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    readyInMinutes: 45,
    servings: 4,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    cuisine: "vietnamese",
    type: "dinner",
    summary:
      "Grilled pork patties and slices served with rice noodles, nuoc cham, and fresh herbs.",
    instructions:
      "Season and shape the pork, grill until caramelized, mix a sweet-sour fish sauce dip, and serve with noodles and herbs.",
    sourceUrl: "https://example.com/mock-recipes/bun-cha-ha-noi",
    extendedIngredients: [
      { id: 9, name: "ground pork", amount: 500, unit: "g" },
      { id: 10, name: "rice vermicelli", amount: 400, unit: "g" },
      { id: 11, name: "fish sauce", amount: 80, unit: "ml" },
      { id: 12, name: "lettuce", amount: 1, unit: "head" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 610, unit: "kcal" }],
    },
  },
  {
    id: 900004,
    title: "Fresh Spring Rolls",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    readyInMinutes: 25,
    servings: 3,
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    cuisine: "asian",
    type: "appetizer",
    summary:
      "Rice paper rolls packed with shrimp, herbs, vermicelli, and crunchy vegetables.",
    instructions:
      "Soften rice papers, add fillings, roll tightly, and serve with hoisin-peanut dipping sauce.",
    sourceUrl: "https://example.com/mock-recipes/fresh-spring-rolls",
    extendedIngredients: [
      { id: 13, name: "rice paper", amount: 12, unit: "sheets" },
      { id: 14, name: "shrimp", amount: 250, unit: "g" },
      { id: 15, name: "lettuce", amount: 6, unit: "leaves" },
      { id: 16, name: "rice vermicelli", amount: 150, unit: "g" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 260, unit: "kcal" }],
    },
  },
  {
    id: 900005,
    title: "Creamy Garlic Pasta",
    image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
    readyInMinutes: 30,
    servings: 2,
    vegetarian: true,
    vegan: false,
    glutenFree: false,
    cuisine: "italian",
    type: "main course",
    summary:
      "Quick creamy pasta with roasted garlic, parmesan, and cracked black pepper.",
    instructions:
      "Cook the pasta, make a creamy garlic sauce in a skillet, then toss together and finish with parmesan.",
    sourceUrl: "https://example.com/mock-recipes/creamy-garlic-pasta",
    extendedIngredients: [
      { id: 17, name: "pasta", amount: 250, unit: "g" },
      { id: 18, name: "garlic", amount: 6, unit: "cloves" },
      { id: 19, name: "cream", amount: 200, unit: "ml" },
      { id: 20, name: "parmesan", amount: 50, unit: "g" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 540, unit: "kcal" }],
    },
  },
  {
    id: 900006,
    title: "Red Lentil Soup with Spinach",
    image: "https://spoonacular.com/recipeImages/715415-556x370.jpg",
    readyInMinutes: 40,
    servings: 4,
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    cuisine: "mediterranean",
    type: "soup",
    summary:
      "A hearty red lentil soup with warming spices, tomatoes, and fresh spinach.",
    instructions:
      "Saute aromatics, simmer lentils with stock and tomatoes until tender, then fold in spinach before serving.",
    sourceUrl: "https://example.com/mock-recipes/red-lentil-soup",
    extendedIngredients: [
      { id: 21, name: "red lentils", amount: 300, unit: "g" },
      { id: 22, name: "spinach", amount: 150, unit: "g" },
      { id: 23, name: "onion", amount: 1, unit: "piece" },
      { id: 24, name: "vegetable stock", amount: 1, unit: "liter" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 330, unit: "kcal" }],
    },
  },
];

function includesText(value, query) {
  return String(value || "").toLowerCase().includes(String(query || "").toLowerCase());
}

function filterRecipes(recipes, { query, ingredients, cuisine, diet, type }) {
  let filtered = [...recipes];

  if (query) {
    filtered = filtered.filter(
      (recipe) =>
        includesText(recipe.title, query) ||
        includesText(recipe.summary, query) ||
        recipe.extendedIngredients.some((ingredient) => includesText(ingredient.name, query))
    );
  }

  if (ingredients) {
    const requested = String(ingredients)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    filtered = filtered.filter((recipe) =>
      requested.every((wanted) =>
        recipe.extendedIngredients.some((ingredient) => ingredient.name.toLowerCase().includes(wanted))
      )
    );
  }

  if (cuisine) {
    filtered = filtered.filter((recipe) => includesText(recipe.cuisine, cuisine));
  }

  if (type) {
    filtered = filtered.filter((recipe) => includesText(recipe.type, type));
  }

  if (diet) {
    const normalized = String(diet).toLowerCase();
    filtered = filtered.filter((recipe) => {
      if (normalized === "vegetarian") return recipe.vegetarian;
      if (normalized === "vegan") return recipe.vegan;
      if (normalized === "gluten free") return recipe.glutenFree;
      return true;
    });
  }

  return filtered;
}

export const MockRecipeService = {
  search({ query, ingredients, cuisine, diet, type, page = 1, limit = 12 }) {
    const filtered = filterRecipes(MOCK_RECIPES, { query, ingredients, cuisine, diet, type });
    const offset = (page - 1) * limit;
    const results = filtered.slice(offset, offset + limit);

    return {
      results,
      totalResults: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      source: "mock",
    };
  },

  getById(id) {
    const recipe = MOCK_RECIPES.find((item) => String(item.id) === String(id));
    if (!recipe) return null;
    return { ...recipe, source: "mock" };
  },

  getSimilar(id) {
    return MOCK_RECIPES.filter((item) => String(item.id) !== String(id)).slice(0, 3);
  },

  getIngredients(id) {
    const recipe = MOCK_RECIPES.find((item) => String(item.id) === String(id));
    return recipe?.extendedIngredients || [];
  },

  getStatus() {
    return {
      mode: "mock",
      recipeCount: MOCK_RECIPES.length,
      reason: "Using bundled sample recipes",
    };
  },
};
