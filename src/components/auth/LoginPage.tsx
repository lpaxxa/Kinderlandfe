import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Smile,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { DEMO_CUSTOMERS } from "../../data/users";
import { motion } from "motion/react";
import api from "../../services/api";
import GoogleAuthService from "../../services/googleAuth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  // common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register-only
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();
  const { login, register } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const foundCustomer = DEMO_CUSTOMERS.find(
        (c) => c.email === email && c.password === password,
      );

      login(email, password);
      toast.success(
        foundCustomer
          ? `Chào mừng trở lại, ${foundCustomer.name}!`
          : "Đăng nhập thành công!",
      );
      navigate("/");
    } else {
      const payload = {
        username,
        phone,
        email,
        firstName,
        lastName,
        password,
      };

      register(payload);
      toast.success("Đăng ký thành công!");
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      toast.info("Đang khởi tạo Google Sign-In...");

      // Initialize Google Auth Service
      const googleAuth = GoogleAuthService.getInstance();
      await googleAuth.initialize();

      // Get Google credential token
      const credential = await googleAuth.signIn();
      console.log('Google credential received:', credential ? 'Yes' : 'No');
      console.log('Credential length:', credential?.length || 0);

      toast.info("Đang xác thực với server...");

      // Send token to backend
      const response = await api.loginWithGoogle(credential);
      console.log('Backend response:', response);

      // Handle successful login — backend returns BaseResponse<AuthResponse>
      // with data: { accessToken, refreshToken, email, role }
      if (response.data?.accessToken) {
        login(response.data.email, ''); // Update context with user data
        toast.success(`Chào mừng ${response.data.email}!`);
        navigate("/");
      } else {
        console.log('Unexpected response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Google login failed:', error);

      if (error.message?.includes('popup')) {
        toast.error('Vui lòng cho phép popup để đăng nhập với Google');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Không thể kết nối tới server. Vui lòng thử lại sau.');
      } else if (error.message?.includes('origin')) {
        toast.error('Lỗi cấu hình Google OAuth. Liên hệ admin.');
      } else {
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFE5E3] via-white to-[#FFE5E3]">
      {/* Container */}
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Sliding Overlay Panel */}
        <motion.div
          className="absolute top-0 w-1/2 h-full bg-gradient-to-br from-[#AF140B] to-[#8D0F08] z-10 flex items-center justify-center text-white p-12"
          initial={false}
          animate={{
            left: isLogin ? "50%" : "0%",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 30,
          }}
        >
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div
              key={isLogin ? "smile" : "welcome"}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <Smile className="w-12 h-12" />
            </motion.div>

            {/* Text */}
            <motion.div
              key={isLogin ? "hello" : "welcome-back"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-3">
                {isLogin
                  ? "Xin chào, Bạn!"
                  : "Chào mừng trở lại!"}
              </h2>
              <p className="text-white/90 mb-6 leading-relaxed">
                {isLogin
                  ? "Nhập thông tin của bạn để bắt đầu hành trình kỳ diệu cùng KinderLand."
                  : "Để tiếp tục kết nối với chúng tôi, vui lòng đăng nhập với thông tin cá nhân."}
              </p>
            </motion.div>

            {/* Button */}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[#AF140B] transition-all duration-300"
            >
              {isLogin ? "Đăng Ký" : "Đăng Nhập"}
            </button>
          </div>
        </motion.div>

        {/* Login Form - Left Side */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-12 transition-opacity duration-300 ${isLogin
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
            }`}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Đăng Nhập KinderLand
            </h2>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold mb-4"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập với Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  HOẶC SỬ DỤNG EMAIL
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                icon={<Mail />}
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
              />

              <Input
                icon={<Lock />}
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={setPassword}
              />

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-[#AF140B] transition-colors"
                  onClick={() =>
                    toast.info("Tính năng đang được phát triển")
                  }
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-[#AF140B] text-white shadow-md hover:shadow-lg hover:bg-[#8D0F08] hover:-translate-y-[1px] active:translate-y-0 transition-all"
              >
                Đăng Nhập
              </button>
            </form>

            {/* Demo Account Info */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <AlertCircle className="size-3" />
                Tài khoản demo:
              </p>
              <div className="bg-[#FFE5E3] p-3 rounded-lg border border-[#AF140B]/20">
                <p className="text-xs font-medium">
                  👑 Thành viên Vàng
                </p>
                <p className="text-xs font-mono text-[#AF140B]">
                  customer@kinderland.vn / customer123
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Nguyễn Thị Lan – 1,500 điểm
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="text-xs text-[#AF140B] hover:underline font-medium"
              >
                Đăng nhập dành cho Admin/Nhân viên →
              </button>
            </div>
          </div>
        </div>

        {/* Register Form - Right Side */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-12 transition-opacity duration-300 ${!isLogin
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
            }`}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Tạo Tài Khoản
            </h2>

            {/* Social Login Buttons */}
            <div className="flex gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={() =>
                  toast.info("Tính năng đang được phát triển")
                }
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877F2"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.info("Tính năng đang được phát triển")
                }
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.info("Tính năng đang được phát triển")
                }
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="#0077B5"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  hoặc sử dụng email để đăng ký:
                </span>
              </div>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                icon={<User />}
                placeholder="Tên người dùng"
                value={username}
                onChange={setUsername}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Họ"
                  value={lastName}
                  onChange={setLastName}
                />
                <Input
                  placeholder="Tên"
                  value={firstName}
                  onChange={setFirstName}
                />
              </div>

              <Input
                icon={<Mail />}
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
              />

              <Input
                icon={<Phone />}
                placeholder="Số điện thoại"
                value={phone}
                onChange={setPhone}
              />

              <Input
                icon={<Lock />}
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={setPassword}
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-[#AF140B] text-white shadow-md hover:shadow-lg hover:bg-[#8D0F08] hover:-translate-y-[1px] active:translate-y-0 transition-all"
              >
                Đăng Ký
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="text-xs text-[#AF140B] hover:underline font-medium"
              >
                Đăng nhập dành cho Admin/Nhân viên →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== */
/* Reusable Input */
/* ===================== */

function Input({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon?: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {React.isValidElement(icon)
            ? React.cloneElement(icon, { size: 18 })
            : icon}
        </span>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className={`w-full px-4 py-3 rounded-xl text-sm border border-gray-300 placeholder-gray-400 bg-gray-50 transition-all focus:outline-none focus:border-[#AF140B] focus:ring-2 focus:ring-[#AF140B]/30 focus:bg-white hover:border-gray-400 ${icon ? "pl-12" : ""}`}
      />
    </div>
  );
}