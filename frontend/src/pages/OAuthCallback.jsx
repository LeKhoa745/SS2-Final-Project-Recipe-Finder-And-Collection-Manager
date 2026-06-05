import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setSession } from "../utils/session";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      alert("Khong nhan duoc token");
      navigate("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.user) {
          setSession({
            accessToken: token,
            user: data.data.user,
          });
          navigate("/");
          return;
        }

        alert("Loi lay thong tin user");
        navigate("/login");
      })
      .catch(() => {
        alert("Loi ket noi");
        navigate("/login");
      });
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white/90 p-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500">
          <span className="text-3xl">Loading</span>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Dang dang nhap Google...</h2>
        <p className="text-gray-600">Vui long cho vai giay</p>
      </div>
    </div>
  );
}
