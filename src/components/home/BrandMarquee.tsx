import React from 'react';
import { brands } from '../../data/products';

export function BrandMarquee() {
  // Brand logos with emoji/icon representation
  const brandLogos = [
    { name: 'Hasbro', emoji: '🎲', color: 'from-purple-500/10 to-purple-600/20' },
    { name: 'LEGO', emoji: '🧱', color: 'from-red-500/10 to-yellow-600/20' },
    { name: 'Mattel', emoji: '🎪', color: 'from-pink-500/10 to-rose-600/20' },
    { name: 'Bandai', emoji: '🤖', color: 'from-blue-500/10 to-cyan-600/20' },
    { name: 'Disney', emoji: '🏰', color: 'from-indigo-500/10 to-purple-600/20' },
    { name: 'Marvel', emoji: '⚡', color: 'from-red-500/10 to-orange-600/20' },
    { name: 'Hot Wheels', emoji: '🏎️', color: 'from-orange-500/10 to-red-600/20' },
    { name: 'NERF', emoji: '🎯', color: 'from-blue-500/10 to-indigo-600/20' },
    { name: 'Play-Doh', emoji: '🎨', color: 'from-teal-500/10 to-green-600/20' },
    { name: 'Fisher-Price', emoji: '👶', color: 'from-pink-500/10 to-purple-600/20' },
    { name: 'Melissa & Doug', emoji: '🧩', color: 'from-green-500/10 to-teal-600/20' },
    { name: 'Little Tikes', emoji: '🎡', color: 'from-yellow-500/10 to-orange-600/20' },
    { name: 'Crayola', emoji: '🖍️', color: 'from-rainbow-500/10 to-pink-600/20' },
    { name: 'Build-A-Bear', emoji: '🧸', color: 'from-brown-500/10 to-amber-600/20' },
    { name: 'Pokemon', emoji: '⚡', color: 'from-yellow-500/10 to-red-600/20' },
    { name: 'National Geographic', emoji: '🌍', color: 'from-green-500/10 to-blue-600/20' },
    { name: 'Robocar Poli', emoji: '🚓', color: 'from-blue-500/10 to-cyan-600/20' },
    { name: 'MGA Entertainment', emoji: '🎭', color: 'from-purple-500/10 to-pink-600/20' },
    { name: 'Nintendo', emoji: '🎮', color: 'from-red-500/10 to-gray-600/20' },
    { name: 'DJI', emoji: '🚁', color: 'from-gray-500/10 to-slate-600/20' },
  ];

  // Duplicate the array for seamless loop
  const duplicatedBrands = [...brandLogos, ...brandLogos];

  return (
    <section className="py-12 bg-gradient-to-r from-[#FFE5E3] via-white to-[#FFE5E3] overflow-hidden border-y-2 border-[#AF140B]/10">
      <div className="container mx-auto px-4 mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            🏆 Thương Hiệu Hàng Đầu
          </h2>
          <p className="text-gray-600">
            Đối tác tin cậy của Kinderland
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FFE5E3] via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FFE5E3] via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Sliding Track */}
        <div className="flex">
          <div className="flex animate-marquee">
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex-shrink-0 mx-4 group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-[#AF140B] w-48 h-32 flex flex-col items-center justify-center group-hover:scale-105 transform">
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                    {brand.emoji}
                  </div>
                  <p className="font-bold text-gray-800 text-center group-hover:text-[#AF140B] transition-colors">
                    {brand.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-[#AF140B] text-xl">✓</span>
            <span className="font-semibold">100% Hàng chính hãng</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#AF140B] text-xl">✓</span>
            <span className="font-semibold">Bảo hành toàn cầu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#AF140B] text-xl">✓</span>
            <span className="font-semibold">20+ thương hiệu nổi tiếng</span>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}