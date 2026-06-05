import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Initialize Gemini conditionally
let genAI;
let model;
const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key';

if (hasApiKey) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are Chef AI, a friendly, professional chef, kitchen assistant, and the virtual guide for the RecipeFinder & Collection Manager application.

Your capabilities:
1. Help users with recipes, cooking tips, techniques, ingredient substitutions, and kitchen advice.
2. Help users navigate and use the RecipeFinder website by answering questions about its features and pages.

RecipeFinder Navigation Guide:
- **Recipes / Search** (Home Page): Search for public recipes by name or ingredients. Save recipes to your wishlist by clicking the heart (❤️) icon.
- **Saved Recipes (Wishlist)**: View favorited recipes. Click the heart (❤️) icon on any recipe to add or remove it from this list.
- **Meal Planner**: Schedule daily/weekly meals (breakfast, lunch, dinner, snack) and automatically generate shopping lists from your planned meals.
- **My Collection**: Create, upload, edit, and delete your own recipes. Toggle recipe visibility between Public (shared with the community) and Private.
- **Profile & Settings**: Update name, email, phone, profile avatar, password, or set dietary preferences (e.g., Vegetarian, Vegan, Gluten-Free, Dairy-Free).

Keep your answers warm, friendly, clear, and concise. If asked questions completely unrelated to food, cooking, or the website's functionality (like general history, math, coding, etc.), politely guide the user back to cooking or RecipeFinder website features.`
    });
  } catch (err) {
    logger.error('Failed to initialize Gemini model:', err);
  }
}

// Fallback response when GEMINI_API_KEY is not configured
function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  // Define topics with keywords and responses
  const topics = [
    {
      id: 'greeting',
      keywords: ['hello', 'hi', 'hey', 'greetings', 'sup', 'yo', 'howdy', 'chef'],
      response: "Hi! I'm Chef AI, your virtual kitchen assistant and RecipeFinder guide. How can I help you today? 🍳"
    },
    {
      id: 'guide',
      keywords: ['introduce', 'intro', 'web', 'site', 'website', 'guide', 'tutorial', 'navigate', 'features', 'how do i use', 'what can i do', 'about this', 'help', 'navigation', 'how to use'],
      response: "Welcome to RecipeFinder! 🍳 Here is a quick guide to what you can do:\n\n- 🔍 **Browse & Search Recipes**: Go to the Home/Recipes page to search for dishes by name or ingredients. Click any recipe to see ingredients, steps, and nutrition info. Save it using the ❤️ heart icon.\n- 📅 **Plan Meals**: Go to the 'Planner' page to schedule your daily and weekly meals.\n- 🛒 **Shopping List**: Automatically generate a grocery list from your active weekly meal plan.\n- 📖 **My Collection**: Go to the 'Collection' page to create, upload, edit, and manage your own custom recipes.\n- ⚙️ **Profile & Settings**: View and edit your personal details, change your password, and set dietary preferences.\n\nWhat would you like to explore?"
    },
    {
      id: 'profile_settings',
      keywords: ['profile', 'settings', 'account', 'dietary', 'preferences', 'avatar', 'password', 'change name', 'change email', 'change phone', 'update password', 'preference', 'vegan', 'vegetarian', 'gluten'],
      response: "You can manage your personal profile and preferences on the **Profile Settings** page! Here is what you can do:\n\n- 👤 **Update Info**: Change your name, email, phone number, and profile picture/avatar.\n- 🔑 **Change Password**: Update your login credentials securely.\n- 🥗 **Dietary Preferences**: Set preferences like Vegetarian, Vegan, Gluten-Free, etc. These settings help filter recipe search results.\n\nTo access this page, click on your profile picture/icon in the navigation bar."
    },
    {
      id: 'edit_delete_recipe',
      keywords: ['edit recipe', 'delete recipe', 'update recipe', 'remove recipe', 'change recipe', 'modify recipe', 'how to edit', 'how to delete', 'edit my', 'delete my'],
      response: "To edit or delete any recipe you created:\n\n1. Go to the **Collection** page (click 'My Collection' in the navigation bar).\n2. Under the **My Recipes** tab, find the recipe card you want to modify.\n3. Click ✏️ **Edit** to open the recipe form with your existing details, or 🗑️ **Delete** to remove it permanently.\n\nNote: You can only edit or delete recipes that you have created yourself!"
    },
    {
      id: 'tips',
      keywords: ['tip', 'tips', 'advice', 'secret', 'cook better', 'seasoning', 'technique', 'season', 'salt', 'acid'],
      response: "Here are some pro cooking tips to elevate your dishes:\n\n1. **Season in layers**: Salt your food at every stage of cooking, not just at the end. This builds deeper flavor.\n2. **Taste as you cook**: Keep tasting your food to adjust seasoning (salt, acid, heat).\n3. **Acid is magic**: If your food tastes flat but is already salty, add a squeeze of lemon/lime or a splash of vinegar. Acid wakes up flavors!\n4. **Mise en Place**: Prep all your ingredients (chop, measure) before you turn on the stove to avoid burning things while rushing.\n5. **Don't crowd the pan**: Crowding causes food to steam instead of sear. Give ingredients space to brown nicely."
    },
    {
      id: 'substitutes',
      keywords: ['substitute', 'instead of', 'replace', 'alternative', 'substitutions'],
      response: "Great cooking question! Here are some common ingredient substitutes:\n\n- **Egg**: Use 1/4 cup applesauce or mashed banana for baking, or 1 tbsp ground flaxseed mixed with 3 tbsp water.\n- **Butter**: Use coconut oil, olive oil, or Greek yogurt.\n- **Buttermilk**: Mix 1 cup of milk with 1 tbsp lemon juice or white vinegar and let it sit for 5 minutes.\n- **Soy sauce**: Use Tamari or coconut aminos.\n\nLet me know if you need any other substitutions!"
    },
    {
      id: 'planner',
      keywords: ['plan', 'planner', 'meal', 'schedule', 'weekly', 'calendar'],
      response: "You can plan your daily and weekly meals on the **Planner** page! Simply head over there to schedule recipes for each day of the week. 📅"
    },
    {
      id: 'wishlist',
      keywords: ['save', 'wishlist', 'saved', 'favorite', 'heart', 'bookmark'],
      response: "You can view all your saved recipes on the **Saved Recipes** page! Simply click the heart icon on any recipe card to save it. ❤️"
    },
    {
      id: 'shopping',
      keywords: ['shopping', 'list', 'buy', 'groceries', 'grocery', 'market'],
      response: "You can automatically generate a shopping list from your weekly plan! Go to the **Planner** page, schedule some meals, and then click on the shopping list section to view all the ingredients you need to buy. 🛒"
    },
    {
      id: 'collection',
      keywords: ['add recipe', 'upload', 'create recipe', 'my recipe', 'new recipe', 'own recipe', 'collection'],
      response: "To add your own custom recipes, go to the **Collection** page and click 'Create Recipe'. You can upload a photo, write instructions, list ingredients, and save it to your personal digital cookbook! 📖"
    },
    {
      id: 'methods',
      keywords: ['fry', 'sauté', 'saute', 'boil', 'roast', 'bake', 'grill', 'braise', 'simmer'],
      response: "Here is a quick chef guide to cooking methods:\n\n- **Sauté**: Cook quickly in a small amount of fat over high heat.\n- **Roast**: Cook with dry heat in the oven, perfect for caramelizing veggies and meats.\n- **Simmer**: Cook liquid just below boiling point (gentle bubbles). Great for broth and sauces.\n- **Braising**: Sear first, then simmer slowly in liquid until meltingly tender."
    },
    {
      id: 'safety',
      keywords: ['knife', 'cut', 'chop', 'safety', 'store', 'keep', 'spoil', 'freeze', 'refrigerator'],
      response: "Kitchen safety & storage tips:\n\n- **Knife safety**: Keep knives sharp (dull knives slip!) and curl your fingers like a bear claw to protect your fingertips.\n- **Food storage**: Let hot food cool before refrigerating. Store raw meat on the bottom shelf of your fridge to prevent dripping onto other foods."
    },
    {
      id: 'pho',
      keywords: ['pho', 'phở', 'ramen', 'soup', 'broth'],
      response: "Pho is a comforting Vietnamese noodle soup! A key chef tip is to char your onions and ginger, and toast your whole spices (star anise, cloves, cinnamon) before simmering the broth to get that authentic aroma. You can find detailed Pho recipes on the **Recipes** page! 🍜"
    },
    {
      id: 'pasta',
      keywords: ['pasta', 'spaghetti', 'noodle', 'noodles', 'lasagna'],
      response: "For perfect pasta, always boil it in heavily salted water (like the sea) until al dente. Remember to save a splash of starchy pasta water to emulsify and thicken your sauce! Check out the **Recipes** page for delicious pasta ideas. 🍝"
    },
    {
      id: 'pizza',
      keywords: ['pizza', 'dough', 'crust'],
      response: "To get a crispy homemade pizza crust, heat your oven as high as it goes and preheat a baking stone or sheet. Also, keep your sauce and cheese toppings light to prevent soggy crusts. Search for pizza recipes on the **Recipes** page! 🍕"
    },
    {
      id: 'baking',
      keywords: ['cake', 'bake', 'dessert', 'cookie', 'bread', 'pastry', 'sweet'],
      response: "Baking is a precise science! Always measure ingredients carefully (use a kitchen scale if possible) and ensure eggs and butter are at room temperature. Browse our sweet creations on the **Recipes** page! 🍰"
    },
    {
      id: 'meat',
      keywords: ['chicken', 'beef', 'pork', 'meat', 'steak', 'patties'],
      response: "To keep meat juicy, let it rest for 5-10 minutes after cooking so the juices redistribute. For chicken breast, brine it in salt water for 20 minutes before cooking to keep it tender. Find great meat recipes on the **Recipes** page! 🍗"
    },
    {
      id: 'rice',
      keywords: ['rice', 'grain', 'quinoa', 'grains'],
      response: "For perfect white rice, wash it under cold water until the water runs clear to remove excess starch. Use a 1:1.5 ratio of rice to water, bring to a boil, cover, simmer for 15 minutes, and let it steam covered off the heat for 10 minutes! 🍚"
    },
    {
      id: 'salad',
      keywords: ['salad', 'vegetable', 'veggie', 'greens', 'dressing'],
      response: "A great salad is all about balance! Combine fresh greens with something crunchy (nuts/croutons), something sweet (fruit/honey), and a vinaigrette (usually 3 parts oil to 1 part acid). Browse salads on the **Recipes** page! 🥗"
    },
    {
      id: 'general_recipe',
      keywords: ['recipe', 'cook', 'make', 'dish', 'food', 'ingredients', 'fridge', 'pantry'],
      response: "I'd love to help you cook! You can browse the **Recipes** page to search for dishes (or filter by ingredients you have on hand!), or save your own custom creations under **Collection**. Let me know what you want to cook! 🥕"
    }
  ];

  // Calculate matching scores for each topic
  let bestTopic = null;
  let maxScore = 0;

  for (const topic of topics) {
    let score = 0;
    for (const keyword of topic.keywords) {
      // Use regex to match as a whole word/phrase, allowing optional plural (s/es)
      // Escaping keyword for regex just in case, though keywords are mostly alphanumeric
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\W)${escapedKeyword}(s|es)?(\\W|$)`, 'i');
      
      if (regex.test(msg)) {
        // Higher weight for multi-word phrases to avoid false matches
        const weight = keyword.split(' ').length;
        score += weight;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && maxScore > 0) {
    return bestTopic.response;
  }

  // Default Redirection
  return "As Chef AI, I'd love to help you cook or navigate RecipeFinder! I can help you with recipe searches, meal planning, saved wishlists, creating custom recipes, editing profile details, or cooking/tip questions. Let me know what you need! 👩‍🍳";
}

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!hasApiKey || !model) {
      const reply = getFallbackResponse(message);
      return sendSuccess(res, { reply });
    }

    const chat = model.startChat({
      history: (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    sendSuccess(res, { reply: text });
  } catch (error) {
    logger.error('Gemini AI Error:', error);
    res.status(500).json({ message: "Chef is busy right now. Please try again later." });
  }
});

export default router;
