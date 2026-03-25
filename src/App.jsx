import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* PUT LOGIN ROUTE HERE */}
        <Route path="/login" element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;