export default function RecipeCard({ title, image }) {
    return (
    <div style={{ border: "1px solid gray", padding: "10px" }}>
        <img
        src={image || "https://via.placeholder.com/150"}
        width="100%"
        />
        <h3>{title || "Recipe"}</h3>
        <button>❤️ Wishlist</button>
    </div>
    );
}