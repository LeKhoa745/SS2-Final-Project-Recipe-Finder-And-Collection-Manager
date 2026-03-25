import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  // Switch between Login and Register tabs
  const switchTab = (tab) => setIsLogin(tab === 0);

  // Reusable alert function (now actually used)
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    showAlert("success", "Đăng nhập thành công! Chào mừng trở lại bếp 🍳");
    setTimeout(() => navigate("/"), 1800);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    showAlert("success", "Đăng ký thành công! Đang chuyển hướng...");
    setTimeout(() => navigate("/"), 1800);
  };

  const togglePassword = (id) => {
    const input = document.getElementById(id);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBndTUJexQE2WLYFJthq5JyIet4n-7ioDma-nYwjcqov3MI2r-9oPRlt0INWG-3j6fIfkkqUIB6NGtXFDJoTH2tdKbMQoajdc0vkK8ncxYerpF6BPwbDt1lw5a9UYOZDpV-_4hOgKKY5lvvQ7uwbOwpzehm9Shuc4DTvXG6bL5C_XFRLxX-7jX5gehFUCuaE1O-1Z8eZBhcyn1M_LmcXlcw9B5cH6S1Vx4Q99H5l8lxtHg20blsjrWOwh-82yZyAuyfKnSbzXdN5QnF"
          className="w-full h-full object-cover"
          alt="Food background"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 text-white drop-shadow-lg">
              <span className="text-4xl">🍳</span>
              <span className="text-3xl font-bold tracking-tight">Recipe Finder</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl border border-white/50">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => switchTab(0)}
                className={`flex-1 pb-4 text-lg font-medium transition-all ${
                  isLogin ? "text-[#ad2c00] border-b-4 border-[#ad2c00]" : "text-gray-500"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => switchTab(1)}
                className={`flex-1 pb-4 text-lg font-medium transition-all ${
                  !isLogin ? "text-[#ad2c00] border-b-4 border-[#ad2c00]" : "text-gray-500"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Alert Message */}
            {alert.message && (
              <div
                className={`mb-6 p-4 rounded-2xl text-center font-medium ${
                  alert.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {alert.message}
              </div>
            )}

            {/* ==================== LOGIN FORM ==================== */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    🥗 Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad2c00]"
                    placeholder="customer123@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    🔑 Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      type="password"
                      required
                      className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad2c00]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword("loginPassword")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
                    >
                      👁️
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-[#ad2c00] to-[#d34011] hover:brightness-105 transition-all"
                >
                  Đăng nhập vào bếp
                </button>
              </form>
            )}

            {/* ==================== REGISTER FORM ==================== */}
            {!isLogin && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    👤 Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad2c00]"
                    placeholder="mychef123"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    🥗 Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad2c00]"
                    placeholder="customer123@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    🔑 Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="regPassword"
                      type="password"
                      required
                      className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad2c00]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword("regPassword")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
                    >
                      👁️
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="terms" className="w-5 h-5 accent-[#ad2c00]" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Tôi đồng ý với Điều khoản dịch vụ &amp; Chính sách bảo mật
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-[#ad2c00] to-[#d34011] hover:brightness-105 transition-all"
                >
                  Tạo tài khoản của tôi 🍳
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}