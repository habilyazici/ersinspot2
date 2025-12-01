import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react@0.487.0';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import logo from 'figma:asset/355ff2021d31b6f59d280dc2fdf15900e1bcd0b0.png';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn, checkAdminStatus, user, isAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Check if already logged in as admin
  useEffect(() => {
    if (user && isAdmin) {
      console.log('[ADMIN-LOGIN] Already logged in as admin, redirecting...');
      navigate('/admin/hizli-erisim', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      console.log('[LOGIN] 🔑 Giriş denemesi:', loginData.email);
      
      // Giriş yap
      const result = await signIn(loginData.email, loginData.password);
      
      if (!result.success) {
        console.error('[LOGIN] ❌ Giriş başarısız:', result.error);
        toast.error('Giriş Başarısız!', {
          description: result.error || 'E-posta veya şifre hatalı.',
          duration: 6000,
        });
        return;
      }
      
      console.log('[LOGIN] ✅ Giriş başarılı, admin kontrolü yapılıyor...');
      
      // Admin yetkisini kontrol et
      const adminStatus = await checkAdminStatus();
      console.log('[LOGIN] Admin durumu:', adminStatus);
      
      if (!adminStatus) {
        console.error('[LOGIN] ❌ Admin yetkisi yok!');
        toast.error('Yetkisiz Erişim!', {
          description: `Bu hesap (${loginData.email}) müşteri hesabıdır, admin değil!`,
          duration: 8000,
        });
        
        // Admin setup sayfasına yönlendirme önerisi
        setTimeout(() => {
          toast.info('Admin Hesabı Gerekli', {
            description: 'Lütfen /admin/setup sayfasından yeni bir admin hesabı oluşturun veya mevcut admin hesabınızla giriş yapın.',
            duration: 10000,
            action: {
              label: 'Setup Sayfası',
              onClick: () => navigate('/admin/setup')
            }
          });
        }, 1500);
        return;
      }
      
      console.log('[LOGIN] ✅ Admin yetkisi onaylandı!');
      toast.success('Giriş Başarılı!', {
        description: 'Admin paneline yönlendiriliyorsunuz...',
      });
      
      setTimeout(() => {
        navigate('/admin/hizli-erisim');
      }, 500);
      
    } catch (error: any) {
      console.error('[LOGIN] ❌ Exception:', error);
      toast.error('Giriş Hatası!', {
        description: error.message || 'Bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#7c3aed] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#f97316]/20 to-[#ea580c]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#8b5cf6]/20 to-[#7c3aed]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-[#3b82f6]/15 to-[#1e3a8a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-[#f97316]/40 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#8b5cf6]/40 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl mb-6 hover:scale-110 transition-transform duration-300">
            <img src={logo} alt="Ersin Spot" className="h-16 w-auto drop-shadow-lg" />
          </div>
          <h1 className="text-white mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
            <Shield className="w-8 h-8 text-[#f97316] animate-pulse" />
            Ersin Spot Yönetim Sistemi
          </h1>
          <p className="text-gray-200 text-sm drop-shadow-md">Güvenli Admin Paneli</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <h2 className="text-gray-900 mb-1 font-bold">Hoş Geldiniz</h2>
            <p className="text-gray-500 text-sm">Devam etmek için giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="mb-2 block text-gray-700">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ersinspot.com"
                  className="pl-10 h-12 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed] bg-gray-50 focus:bg-white transition-colors"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="mb-2 block text-gray-700">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed] bg-gray-50 focus:bg-white transition-colors"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#1e3a8a] border-gray-300 rounded focus:ring-[#1e3a8a]"
                />
                <span className="text-sm text-gray-600">Beni Hatırla</span>
              </label>
              <a
                href="#"
                className="text-sm text-[#f97316] hover:text-[#ea580c] font-medium"
              >
                Şifremi Unuttum
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#1e3a8a] via-[#7c3aed] to-[#f97316] hover:from-[#1e3a8a]/90 hover:via-[#7c3aed]/90 hover:to-[#f97316]/90 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              size="lg"
              disabled={loading}
            >
              <Shield className="w-5 h-5 mr-2" />
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-200 text-sm drop-shadow-lg">
            © 2025 Ersin Spot. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}