export const MOCK_SEARCH_RESULTS = [
  {
    id: 716429,
    title: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
    image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
    readyInMinutes: 45,
    servings: 2,
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    id: 633883,
    title: "Classic Beef Burger with Secret Sauce",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 25,
    servings: 4,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  },
  {
    id: 715415,
    title: "Red Lentil Soup with Chicken and Turnips",
    image: "https://spoonacular.com/recipeImages/715415-312x231.jpg",
    readyInMinutes: 55,
    servings: 8,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 644387,
    title: "Garlic Marinated Chicken",
    image: "https://spoonacular.com/recipeImages/644387-312x231.jpg",
    readyInMinutes: 45,
    servings: 2,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 642582,
    title: "Fresh Greek Salad with Feta",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 15,
    servings: 2,
    vegetarian: true,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 659109,
    title: "Salmon with Roasted Asparagus",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 30,
    servings: 2,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 663050,
    title: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 40,
    servings: 3,
    vegetarian: true,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 637942,
    title: "Chicken Tikka Masala",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 50,
    servings: 4,
    vegetarian: false,
    vegan: false,
    glutenFree: true,
  },
  {
    id: 662960,
    title: "Chocolate Lava Cake",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 20,
    servings: 2,
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    id: 632660,
    title: "Avocado Toast with Poached Egg",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
    readyInMinutes: 10,
    servings: 1,
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
];

export const MOCK_RECIPE_DETAILS = {
  716429: {
    id: 716429,
    title: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
    image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
    readyInMinutes: 45,
    servings: 2,
    sourceUrl: "http://fullbellysoup.blogspot.com/2012/06/pasta-with-garlic-scallions-cauliflower.html",
    summary: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs might be just the main course you are searching for.",
    instructions: "Cook pasta in a large pot of boiling salted water until al dente. Drain, reserving 1 cup pasta water. Meanwhile, heat oil in a large skillet over medium-high heat. Add cauliflower and cook, tossing often, until golden brown and tender, about 10 minutes. Add scallions, garlic, and red pepper flakes and cook, tossing often, until fragrant, about 2 minutes. Stir in pasta, pasta water, and 1/2 cup parmesan and cook, tossing often, until a light sauce forms, about 2 minutes. Season with salt and pepper. Serve topped with remaining 1/4 cup parmesan and breadcrumbs.",
    extendedIngredients: [
      { id: 20420, name: "pasta", amount: 2, unit: "cups", image: "fusilli.jpg" },
      { id: 11135, name: "cauliflower", amount: 1, unit: "head", image: "cauliflower.jpg" },
      { id: 11215, name: "garlic", amount: 3, unit: "cloves", image: "garlic.png" },
      { id: 11291, name: "scallions", amount: 4, unit: "", image: "spring-onions.jpg" },
    ],
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 584.49, unit: "kcal" },
        { name: "Fat", amount: 19.5, unit: "g" },
        { name: "Carbohydrates", amount: 84.6, unit: "g" },
        { name: "Protein", amount: 19.3, unit: "g" },
      ]
    }
  },
  633883: {
    id: 633883,
    title: "Classic Beef Burger with Secret Sauce",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200",
    readyInMinutes: 25,
    servings: 4,
    sourceUrl: "https://example.com/burger",
    summary: "A juicy beef burger topped with our special secret sauce.",
    instructions: "Form the beef into patties. Season with salt and pepper. Grill for 4-5 minutes per side. Toast the buns. Apply the secret sauce, add lettuce, tomato, and the patty.",
    extendedIngredients: [
      { id: 10011111, name: "ground beef", amount: 1, unit: "lb", image: "beef-ground.jpg" },
      { id: 18350, name: "burger buns", amount: 4, unit: "", image: "hamburger-bun.jpg" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 650, unit: "kcal" }]
    }
  },
  642582: {
    id: 642582,
    title: "Fresh Greek Salad with Feta",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1200",
    readyInMinutes: 15,
    servings: 2,
    instructions: "Chop the vegetables. Mix with olives and feta cheese. Drizzle with olive oil and oregano.",
    extendedIngredients: [
      { id: 11206, name: "cucumber", amount: 1, unit: "", image: "cucumber.jpg" },
      { id: 10111529, name: "cherry tomatoes", amount: 1, unit: "cup", image: "cherry-tomatoes.png" },
      { id: 1019, name: "feta cheese", amount: 100, unit: "g", image: "feta.png" },
    ],
    nutrition: { nutrients: [{ name: "Calories", amount: 280, unit: "kcal" }] }
  },
  662960: {
    id: 662960,
    title: "Chocolate Lava Cake",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=1200",
    readyInMinutes: 20,
    servings: 2,
    instructions: "Melt chocolate and butter. Whisk in eggs and sugar. Add flour. Bake at 400°F for 12 minutes until edges are set but center is soft.",
    extendedIngredients: [
      { id: 19081, name: "dark chocolate", amount: 100, unit: "g", image: "dark-chocolate.jpg" },
      { id: 1001, name: "butter", amount: 50, unit: "g", image: "butter.png" },
      { id: 1123, name: "eggs", amount: 2, unit: "", image: "egg.png" },
    ],
    nutrition: { nutrients: [{ name: "Calories", amount: 480, unit: "kcal" }] }
  }
};

export const MOCK_SIMILAR_RECIPES = [
  { id: 633883, title: "Classic Beef Burger", imageType: "jpg" },
  { id: 644387, title: "Garlic Marinated Chicken", imageType: "jpg" },
  { id: 642582, title: "Greek Salad", imageType: "jpg" },
];
