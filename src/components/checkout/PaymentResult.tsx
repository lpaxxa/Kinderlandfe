import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!status) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(status === 'success' ? '/' : '/cart');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex justify-center">
          {isSuccess ? (
            <div className="p-4 bg-green-100 rounded-full text-green-600">
              <CheckCircle className="size-20" />
            </div>
          ) : (
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <XCircle className="size-20" />
            </div>
          )}
        </div>

        <h1 className={`text-3xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          {isSuccess 
            ? 'Cảm ơn bạn đã mua sắm tại Kinderland. Đơn hàng của bạn đang được xử lý.' 
            : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại giỏ hàng và thử lại.'}
        </p>

        <div className="space-y-4">
          {isSuccess ? (
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#AF140B] text-white py-4 rounded-2xl hover:bg-[#8D0F08] transition-all shadow-lg font-bold text-lg flex items-center justify-center gap-2 group"
            >
              Tiếp tục mua sắm
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-[#AF140B] text-white py-4 rounded-2xl hover:bg-[#8D0F08] transition-all shadow-lg font-bold text-lg flex items-center justify-center gap-2 group"
            >
              Về giỏ hàng
              <ShoppingBag className="size-5 group-hover:shake transition-transform" />
            </button>
          )}

          <div className="pt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Tự động chuyển hướng sau {countdown} giây...
          </div>
        </div>
      </div>
    </div>
  );
}
