import { Link } from "react-router-dom";

export default function Navbar() {
    return (
    <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
        <h2>
            🍳 Recipe App
        </h2>
        <div>
            <Link to="/">Home</Link> |{" "}
            <Link to="/search">Search</Link> |{" "}
            <Link to="/wishlist">Wishlist</Link>
        </div>
    </nav>
    );
}