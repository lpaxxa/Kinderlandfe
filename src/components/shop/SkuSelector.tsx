interface SkuSelectorProps {
  skus: any[];
  selectedSku: any;
  onSelectSku: (sku: any) => void;
}

export default function SkuSelector({ skus, selectedSku, onSelectSku }: SkuSelectorProps) {
  // Extract unique colors
  const colors = [...new Set(skus.map((s: any) => s.color).filter(Boolean))];
  // Extract sizes filtered by selected color
  const sizes = [...new Set(
    skus
      .filter((s: any) => !selectedSku?.color || s.color === selectedSku.color)
      .map((s: any) => s.size)
      .filter(Boolean)
  )];
  const hasVariants = colors.length > 0 || sizes.length > 0;

  return (
    <div className="mt-4 space-y-4">
      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <p className="font-semibold mb-2 text-sm text-gray-700">
            Màu sắc: {selectedSku?.color && <span className="font-bold text-gray-900">{selectedSku.color}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color: any) => {
              const isSelected = selectedSku?.color === color;
              const matchingSku = skus.find((s: any) =>
                s.color === color && (!selectedSku?.size || s.size === selectedSku.size)
              ) || skus.find((s: any) => s.color === color);
              return (
                <button
                  key={color}
                  onClick={() => matchingSku && onSelectSku(matchingSku)}
                  title={color}
                  className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-full text-sm font-medium transition-all ${isSelected
                    ? 'border-[#AF140B] bg-[#FFE5E3] text-[#AF140B]'
                    : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                    }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="font-semibold mb-2 text-sm text-gray-700">
            Kích cỡ: {selectedSku?.size && <span className="font-bold text-gray-900">{selectedSku.size}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size: any) => {
              const isSelected = selectedSku?.size === size;
              const matchingSku = skus.find((s: any) =>
                s.size === size && (!selectedSku?.color || s.color === selectedSku.color)
              ) || skus.find((s: any) => s.size === size);
              return (
                <button
                  key={size}
                  onClick={() => matchingSku && onSelectSku(matchingSku)}
                  className={`px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all ${isSelected
                    ? 'bg-[#AF140B] text-white border-[#AF140B] shadow-md'
                    : 'bg-white border-gray-200 hover:border-[#AF140B]/40 text-gray-700'
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback: no color/size — show single SKU selector */}
      {!hasVariants && skus.length > 0 && (
        <div>
          <p className="font-semibold mb-2 text-sm text-gray-700">Chọn loại:</p>
          <div className="flex flex-wrap gap-2">
            {skus.map((sku: any) => (
              <button
                key={sku.id}
                onClick={() => onSelectSku(sku)}
                className={`px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all ${selectedSku?.id === sku.id
                  ? 'bg-[#AF140B] text-white border-[#AF140B]'
                  : 'bg-white border-gray-200 hover:border-gray-400'
                  }`}
              >
                Loại {sku.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
