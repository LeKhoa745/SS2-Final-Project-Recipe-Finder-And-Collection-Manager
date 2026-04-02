import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Lưu token từ Google OAuth callback
      localStorage.setItem('accessToken', token);
      
      // Fetch user info từ /api/auth/me (refreshToken in cookie)
      fetch('http://localhost:5000/api/auth/me', { 
        credentials: 'include' 
      })
        .then(res => res.json())
        .then(data => {
          if (data.data?.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            alert(`🎉 Google login thành công! Chào ${data.data.user.name}`);
            navigate('/');
          } else {
            alert('❌ Lỗi lấy thông tin user');
            navigate('/login');
          }
        })
        .catch(() => {
          alert('⚠️ Lỗi kết nối');
          navigate('/login');
        });
    } else {
      alert('❌ Không nhận được token');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl">🔄</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang đăng nhập Google...</h2>
        <p className="text-gray-600 mb-8">Vui lòng chờ vài giây</p>
      </div>
    </div>
  );
}
