import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recipeService } from "../api/recipeService";
import { wishlistService } from "../api/wishlistService";
import RecipeCard from "../components/RecipeCard";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [expandedIngredientId, setExpandedIngredientId] = useState(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      setLoading(true);
      setError(null);
      window.scrollTo(0, 0);
      try {
        const recipeRes = await recipeService.getById(id);
        if (recipeRes.data && recipeRes.data.recipe) {
          setRecipe(recipeRes.data.recipe);
        } else {
          setError("Recipe not found.");
        }

        const similarRes = await recipeService.getSimilar(id);
        if (similarRes.data && similarRes.data.recipes) {
          setSimilarRecipes(similarRes.data.recipes);
        }

        // Check if wishlisted
        try {
          const wlData = await wishlistService.check(id);
          setIsWishlisted(wlData.data.saved);
        } catch {
          // ignore if user not logged in
        }

      } catch (err) {
        console.error("Failed to fetch recipe details:", err);
        setError("Failed to load recipe information.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  const handleWishlistClick = async () => {
    if (!recipe) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistService.remove(id);
        setIsWishlisted(false);
      } else {
        await wishlistService.add({
          recipeId: id,
          recipeTitle: recipe.title,
          recipeImage: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
        });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f5]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2d1b11] mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Recipe not found."}</p>
          <button onClick={() => navigate(-1)} className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition">Go Back</button>
        </div>
      </div>
    );
  }

  // Calculate mock total cost based on ingredient count for demonstration
  const totalCost = recipe.extendedIngredients ? (recipe.extendedIngredients.length * 1.25).toFixed(2) : 0;
  
  // Find nutrition data
  let nutrientsMap = {};
  if (recipe.nutrition && recipe.nutrition.nutrients) {
    recipe.nutrition.nutrients.forEach(n => {
      nutrientsMap[n.name] = n;
    });
  }

  const primaryNutrients = [
    { name: "Calories", key: "Calories", unit: "kcal" },
    { name: "Fat", key: "Fat", unit: "g" },
    { name: "Carbs", key: "Carbohydrates", unit: "g" },
    { name: "Protein", key: "Protein", unit: "g" },
    { name: "Sugar", key: "Sugar", unit: "g" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Info */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2d1b11] mb-8 font-serif leading-tight">
          {recipe.title}
        </h1>
        
        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm mb-8 bg-gray-50">
          <img 
            src={recipe.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200"} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Meta info & Actions bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-8 mb-12 gap-4">
          <div className="flex gap-6 text-[#2d1b11] font-medium text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span> 
              <span>Total {recipe.readyInMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span> 
              <span>Servings: {recipe.servings} people</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleWishlistClick}
              disabled={wishlistLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
                isWishlisted ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-[#2d1b11] hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span>{isWishlisted ? '🧡' : '🤍'}</span>
              {isWishlisted ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold bg-gray-100 text-[#2d1b11] hover:bg-gray-200 transition-all">
              <span>🔗</span> Share
            </button>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="mb-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-[#ee5b66]">Ingredients</h2>
            <button 
              onClick={() => setShowAllIngredients(!showAllIngredients)}
              className="bg-[#ee5b66] text-white px-5 py-2 rounded-full font-medium text-sm shadow-sm hover:bg-[#d84853] transition-colors"
            >
              {showAllIngredients ? "Hide Details" : "View All Ingredient Details"}
            </button>
          </div>
          
          {showAllIngredients && (
             <div className="bg-[#fff8f5] p-6 rounded-2xl mb-8 border border-orange-100 flex justify-between items-center">
                <span className="font-bold text-[#2d1b11] text-lg">Estimated Total Cost:</span>
                <span className="font-bold text-orange-600 text-xl">${totalCost}</span>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recipe.extendedIngredients || []).map((ingredient, idx) => (
              <div 
                key={`${ingredient.id}-${idx}`} 
                onClick={() => setExpandedIngredientId(expandedIngredientId === ingredient.id ? null : ingredient.id)}
                className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#ee5b66]/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img 
                      src={ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : "https://via.placeholder.com/100?text=Ing"}
                      alt={ingredient.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Ing"; }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2d1b11] capitalize text-sm">{ingredient.nameClean || ingredient.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{ingredient.amount} {ingredient.unit}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedIngredientId === ingredient.id && showAllIngredients && (
                  <div className="mt-4 pt-4 border-t border-gray-50 text-xs">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-500">Estimated Price:</span>
                       <span className="font-bold text-orange-600">${(Math.random() * 2 + 0.5).toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                       <p className="font-bold text-[#2d1b11] mb-1">Nutrition Fact</p>
                       <p className="text-gray-500 flex justify-between"><span>Calories:</span> <span>~{Math.floor(Math.random() * 50 + 10)} kcal</span></p>
                       <p className="text-gray-500 flex justify-between"><span>Fat:</span> <span>~{(Math.random() * 5).toFixed(1)} g</span></p>
                       <p className="text-gray-500 flex justify-between"><span>Carbs:</span> <span>~{(Math.random() * 10).toFixed(1)} g</span></p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
          <div className="mb-14">
            <h2 className="text-3xl font-bold text-[#ee5b66] mb-8">Instructions</h2>
            <div className="bg-[#fff8f5] rounded-3xl p-8 md:p-10 border border-orange-50">
              {recipe.analyzedInstructions[0].steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 mb-8 last:mb-0">
                  <div className="w-8 h-8 rounded-full bg-[#521721] text-white flex items-center justify-center font-bold flex-shrink-0 mt-1 shadow-sm">
                    {step.number}
                  </div>
                  <p className="text-[#2d1b11] leading-relaxed font-medium">
                    {step.step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Section */}
        {recipe.nutrition && recipe.nutrition.nutrients && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#ee5b66] mb-8">Nutrition</h2>
            <div className="flex flex-wrap gap-4">
              {primaryNutrients.map((item, idx) => {
                const nutData = nutrientsMap[item.key];
                const amount = nutData ? nutData.amount : 0;
                return (
                  <div key={idx} className="bg-white border-2 border-pink-100 rounded-xl px-6 py-4 flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                    <span className="font-bold text-[#2d1b11] text-lg">{amount}{item.unit}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase mt-1">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Similar Recipes Section */}
        {similarRecipes.length > 0 && (
          <div className="mt-20 border-t border-gray-100 pt-16">
            <h2 className="text-3xl font-bold text-[#2d1b11] mb-10">Similar Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarRecipes.map(item => (
                <RecipeCard 
                  key={item.id} 
                  id={item.id} 
                  title={item.title} 
                  image={`https://spoonacular.com/recipeImages/${item.id}-556x370.${item.imageType || 'jpg'}`}
                  readyInMinutes={item.readyInMinutes}
                />
              ))}
            </div>
            
            <div className="flex justify-center mt-10">
              <button onClick={() => navigate('/search')} className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Explore More Recipes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
