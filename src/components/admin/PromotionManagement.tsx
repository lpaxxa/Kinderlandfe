import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../../context/AdminContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Calendar as CalendarIcon,
  Upload,
  Tag,
  Percent,
  DollarSign,
  Gift,
  Zap,
  ShoppingBag,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { categories } from "../../data/products";
import { products } from "../../data/products";
import {
  promotionApi,
  Promotion as ApiPromotion,
  CreatePromotionPayload,
} from "../../services/promotionApi";

// Types
type PromotionType =
  | "discount_code"
  | "automatic_sale"
  | "flash_sale"
  | "tiered_discount";
type DiscountValueType = "percentage" | "fixed";
type ScopeType =
  | "entire_catalog"
  | "specific_category"
  | "specific_skus";
type PromotionStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired";

interface Promotion {
  id: string;
  name: string;
  code?: string; // For discount codes
  type: PromotionType;
  discountType: DiscountValueType;
  discountValue: number;
  minimumSpend: number;
  usageLimit: number;
  usedCount: number;
  scope: ScopeType;
  categoryIds?: string[];
  productSkus?: string[];
  startDate: Date;
  endDate: Date;
  status: PromotionStatus;
  bannerUrl?: string;
  description?: string;
  tieredRules?: { quantity: number; discount: number }[];
  createdBy: string;
  createdAt: Date;
  modifiedAt?: Date;
}

// Map BE → local UI type
function fromApi(p: ApiPromotion): Promotion {
  const now = new Date();
  const start = new Date(p.startDate);
  const end = new Date(p.endDate);
  let status: PromotionStatus = "inactive";
  if (end < now) status = "expired";
  else if (start > now) status = "scheduled";
  else status = "active";
  return {
    id: String(p.promotionId),
    name: p.title,
    code: p.code,
    type: "discount_code",
    discountType: "percentage",
    discountValue: p.discountPercent,
    minimumSpend: 0,
    usageLimit: 0,
    usedCount: 0,
    scope: "entire_catalog",
    startDate: start,
    endDate: end,
    status,
    description: p.description,
    createdBy: "",
    createdAt: now,
  };
}

const mockPromotions: Promotion[] = [
  {
    id: "PROMO-001",
    name: "Giảm giá 20% cho LEGO",
    code: "LEGO20",
    type: "discount_code",
    discountType: "percentage",
    discountValue: 20,
    minimumSpend: 500000,
    usageLimit: 100,
    usedCount: 45,
    scope: "specific_category",
    categoryIds: ["lego"],
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-28"),
    status: "active",
    description: "Giảm giá 20% cho tất cả sản phẩm LEGO",
    createdBy: "admin@kinderland.vn",
    createdAt: new Date("2026-01-25"),
  },
  {
    id: "PROMO-002",
    name: "Flash Sale 50% - 2 giờ vàng",
    type: "flash_sale",
    discountType: "percentage",
    discountValue: 50,
    minimumSpend: 0,
    usageLimit: 1000,
    usedCount: 234,
    scope: "entire_catalog",
    startDate: new Date("2026-02-20T14:00:00"),
    endDate: new Date("2026-02-20T16:00:00"),
    status: "expired",
    description: "Flash Sale 2 giờ - Giảm 50% toàn bộ sản phẩm",
    createdBy: "admin@kinderland.vn",
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "PROMO-003",
    name: "Mua nhiều giảm nhiều",
    type: "tiered_discount",
    discountType: "percentage",
    discountValue: 10,
    minimumSpend: 0,
    usageLimit: 0,
    usedCount: 0,
    scope: "entire_catalog",
    tieredRules: [
      { quantity: 2, discount: 5 },
      { quantity: 3, discount: 10 },
      { quantity: 5, discount: 15 },
    ],
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-03-31"),
    status: "active",
    description:
      "Mua 2 giảm 5%, mua 3 giảm 10%, mua 5 giảm 15%",
    createdBy: "manager@kinderland.vn",
    createdAt: new Date("2026-01-28"),
  },
];

export default function PromotionManagement() {
  const navigate = useNavigate();
  const { adminUser } = useAdmin();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PromotionStatus>("all");
  const [showAuditLog, setShowAuditLog] = useState(false);

  const fetchPromotions = async (keyword?: string) => {
    setLoading(true); setApiError(null);
    try {
      const paged = await promotionApi.getPromotions({ keyword, size: 50 });
      setPromotions((paged.content ?? []).map(fromApi));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Không thể tải danh sách.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPromotions(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchPromotions(searchTerm || undefined), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Assign products state
  const [assignTarget, setAssignTarget] = useState<Promotion | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [assignSearch, setAssignSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const openAssignDialog = (promo: Promotion) => {
    setAssignTarget(promo);
    setSelectedProductIds(new Set());
    setAssignSearch("");
    setAssignError(null);
  };

  const handleAssignProducts = async () => {
    if (!assignTarget || selectedProductIds.size === 0) return;
    setAssigning(true); setAssignError(null);
    try {
      await promotionApi.assignProducts(Number(assignTarget.id), Array.from(selectedProductIds));
      toast.success(`Đã gán ${selectedProductIds.size} sản phẩm vào “${assignTarget.name}”`);
      setAssignTarget(null);
      await fetchPromotions();
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : "Gán thất bại.");
    } finally { setAssigning(false); }
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  // Form state
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    code: "",
    type: "discount_code",
    discountType: "percentage",
    discountValue: 0,
    minimumSpend: 0,
    usageLimit: 0,
    scope: "entire_catalog",
    startDate: new Date(),
    endDate: new Date(),
    status: "inactive",
    description: "",
  });

  const handleBack = () => {
    if (adminUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/manager/dashboard");
    }
  };

  const handleCreateNew = () => {
    setEditingPromotion(null);
    setFormData({
      name: "",
      code: "",
      type: "discount_code",
      discountType: "percentage",
      discountValue: 0,
      minimumSpend: 0,
      usageLimit: 0,
      scope: "entire_catalog",
      startDate: new Date(),
      endDate: new Date(),
      status: "inactive",
      description: "",
    });
    setShowCreateForm(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData(promotion);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Бạn có chắc muốn xóa khúyến mãi này?")) return;
    try {
      await promotionApi.deletePromotion(Number(id));
      toast.success("Đã xóa thành công");
      await fetchPromotions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại.");
    }
  };

  const handleDuplicate = (promotion: Promotion) => {
    const newPromotion = {
      ...promotion,
      id: `PROMO-${Date.now()}`,
      name: `${promotion.name} (Copy)`,
      code: promotion.code
        ? `${promotion.code}_COPY`
        : undefined,
      status: "inactive" as PromotionStatus,
      usedCount: 0,
      createdBy: adminUser?.email || "",
      createdAt: new Date(),
    };
    setPromotions([newPromotion, ...promotions]);
    toast.success("Đã sao chép khuyến mãi thành công");
  };

  const validateForm = (): boolean => {
    // BR-51: Check discount limit
    if (
      formData.discountType === "percentage" &&
      formData.discountValue! > 50 &&
      adminUser?.role !== "admin"
    ) {
      toast.error(
        "Giảm giá không được vượt quá 50%. Chỉ Super Admin mới có thể vượt qua giới hạn này.",
      );
      return false;
    }

    // Check end date
    if (formData.endDate! < new Date()) {
      toast.error("Ngày kết thúc không được ở quá khứ");
      return false;
    }

    // Check required fields
    if (!formData.name) {
      toast.error("Vui lòng nhập tên khuyến mãi");
      return false;
    }

    if (formData.type === "discount_code" && !formData.code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return false;
    }

    if (
      !formData.discountValue ||
      formData.discountValue <= 0
    ) {
      toast.error("Vui lòng nhập giá trị giảm giá hợp lệ");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const payload: CreatePromotionPayload = {
      title: formData.name ?? "",
      description: formData.description ?? "",
      code: formData.code ?? "",
      discountPercent: formData.discountValue ?? 0,
      startDate: (formData.startDate ?? new Date()).toISOString(),
      endDate: (formData.endDate ?? new Date()).toISOString(),
    };
    try {
      if (editingPromotion) {
        await promotionApi.updatePromotion(Number(editingPromotion.id), payload);
        toast.success("Cập nhật thành công");
      } else {
        await promotionApi.createPromotion(payload);
        toast.success("Tạo khuyến mãi thành công");
      }
      setShowCreateForm(false); setEditingPromotion(null);
      await fetchPromotions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại.");
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      promo.code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || promo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PromotionStatus) => {
    const variants = {
      active: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle2,
      },
      inactive: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: XCircle,
      },
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Clock,
      },
      expired: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
      },
    };
    const variant = variants[status];
    const Icon = variant.icon;
    return (
      <Badge
        className={`${variant.bg} ${variant.text} border-0`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status === "active"
          ? "Đang chạy"
          : status === "inactive"
            ? "Tạm dừng"
            : status === "scheduled"
              ? "Đã lên lịch"
              : "Đã hết hạn"}
      </Badge>
    );
  };

  const getTypeIcon = (type: PromotionType) => {
    switch (type) {
      case "discount_code":
        return Tag;
      case "automatic_sale":
        return ShoppingBag;
      case "flash_sale":
        return Zap;
      case "tiered_discount":
        return Package;
      default:
        return Gift;
    }
  };

  const getTypeLabel = (type: PromotionType) => {
    switch (type) {
      case "discount_code":
        return "Mã giảm giá";
      case "automatic_sale":
        return "Giảm giá tự động";
      case "flash_sale":
        return "Flash Sale";
      case "tiered_discount":
        return "Giảm theo bậc";
      default:
        return type;
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateForm(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-[#2C2C2C]">
                    {editingPromotion
                      ? "Chỉnh sửa khuyến mãi"
                      : "Tạo khuyến mãi mới"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    UC-21: Manage Promotions
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="bg-[#AF140B] hover:bg-[#8D0F08]"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu khuyến mãi
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  Thông tin cơ bản
                </CardTitle>
                <CardDescription>
                  Tên và loại chương trình khuyến mãi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên khuyến mãi *</Label>
                    <Input
                      placeholder="VD: Giảm giá 20% cho LEGO"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại khuyến mãi *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: PromotionType) =>
                        setFormData({
                          ...formData,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount_code">
                          Mã giảm giá (Discount Code)
                        </SelectItem>
                        <SelectItem value="automatic_sale">
                          Giảm giá tự động (Automatic Sale)
                        </SelectItem>
                        <SelectItem value="flash_sale">
                          Flash Sale
                        </SelectItem>
                        <SelectItem value="tiered_discount">
                          Giảm theo bậc (Tiered Discount)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === "discount_code" && (
                  <div className="space-y-2">
                    <Label>Mã giảm giá *</Label>
                    <Input
                      placeholder="VD: LEGO20"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      BR-49: Khách hàng chỉ được áp dụng 1 mã
                      giảm giá/đơn hàng
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Discount Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Cấu hình giảm giá
                </CardTitle>
                <CardDescription>
                  Thiết lập giá trị và điều kiện giảm giá
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.type === "tiered_discount" ? (
                  <div className="space-y-4">
                    <Label>Quy tắc giảm theo bậc</Label>
                    <div className="bg-[#FFE5E3] border border-[#AF140B]/30 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-sm font-medium text-gray-700">
                        <div>Số lượng</div>
                        <div>Giảm giá (%)</div>
                        <div></div>
                      </div>
                      {[
                        { qty: 2, discount: 5 },
                        { qty: 3, discount: 10 },
                        { qty: 5, discount: 15 },
                      ].map((rule, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-3 gap-3 items-center"
                        >
                          <Input
                            type="number"
                            value={rule.qty}
                            readOnly
                            className="bg-white"
                          />
                          <Input
                            type="number"
                            value={rule.discount}
                            readOnly
                            className="bg-white"
                          />
                          <span className="text-sm text-gray-600">
                            = Mua {rule.qty} giảm{" "}
                            {rule.discount}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Alternative Flow 3.1: Giảm giá tăng dần
                      theo số lượng mua
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loại giảm giá *</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(
                          value: DiscountValueType,
                        ) =>
                          setFormData({
                            ...formData,
                            discountType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            <div className="flex items-center gap-2">
                              <Percent className="w-4 h-4" />
                              Phần trăm (%)
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Số tiền cố định (₫)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Giá trị giảm *</Label>
                      <Input
                        type="number"
                        placeholder={
                          formData.discountType === "percentage"
                            ? "20"
                            : "100000"
                        }
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountValue: Number(
                              e.target.value,
                            ),
                          })
                        }
                      />
                      {formData.discountType === "percentage" &&
                        formData.discountValue! > 50 && (
                          <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                BR-51: Giới hạn giảm giá
                              </p>
                              <p>
                                Giảm giá vượt 50%. Chỉ Super
                                Admin mới được phép.
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Giá trị đơn hàng tối thiểu (₫)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.minimumSpend}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumSpend: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giới hạn số lần sử dụng</Label>
                    <Input
                      type="number"
                      placeholder="0 = Không giới hạn"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    Business Rules:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • BR-52: Điểm loyalty tính theo giá sau
                      khi đã áp dụng giảm giá
                    </li>
                    <li>
                      • BR-53: Không áp dụng voucher cho hàng
                      Clearance (đã giảm {">"} 70%)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Scope */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Phạm vi áp dụng
                </CardTitle>
                <CardDescription>
                  Chọn sản phẩm/danh mục được áp dụng khuyến mãi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phạm vi *</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value: ScopeType) =>
                      setFormData({ ...formData, scope: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entire_catalog">
                        Toàn bộ sản phẩm
                      </SelectItem>
                      <SelectItem value="specific_category">
                        Danh mục cụ thể
                      </SelectItem>
                      <SelectItem value="specific_skus">
                        Sản phẩm cụ thể (SKU)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.scope === "specific_category" && (
                  <div className="space-y-2">
                    <Label>Chọn danh mục</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.slice(0, 6).map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-2 p-3 border rounded-lg hover:border-[#AF140B] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded"
                          />
                          <span className="text-sm">
                            {cat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.scope === "specific_skus" && (
                  <div className="space-y-2">
                    <Label>Nhập SKU sản phẩm</Label>
                    <Textarea
                      placeholder="Nhập danh sách SKU, mỗi SKU trên 1 dòng&#10;VD:&#10;LEGO-001&#10;LEGO-002&#10;BARBIE-001"
                      rows={5}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 4: Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  Lịch chạy chương trình
                </CardTitle>
                <CardDescription>
                  Thiết lập thời gian bắt đầu và kết thúc
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate &&
                            "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? (
                            format(
                              formData.startDate,
                              "dd/MM/yyyy HH:mm",
                            )
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) =>
                            setFormData({
                              ...formData,
                              startDate: date || new Date(),
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate &&
                            "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? (
                            format(
                              formData.endDate,
                              "dd/MM/yyyy HH:mm",
                            )
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) =>
                            setFormData({
                              ...formData,
                              endDate: date || new Date(),
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {formData.type === "flash_sale" && (
                  <div className="bg-[#FFF9E5] border border-[#D4AF37] rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Zap className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-[#B8860B] mb-1">
                          Alternative Flow 5.1: Flash Sale
                        </p>
                        <p className="text-gray-700">
                          Flash Sale thường chạy trong thời gian
                          ngắn (2-4 giờ) với mức giảm giá cao.
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          BR-50: Giá sẽ tự động trở về giá gốc
                          khi hết thời gian.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 5: Upload Banner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  Banner quảng cáo
                </CardTitle>
                <CardDescription>
                  Upload hình ảnh banner hiển thị trên website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#AF140B] transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click để upload hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP (tối đa 2MB, kích thước
                    khuyến nghị: 1200x400px)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#AF140B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    6
                  </div>
                  Trạng thái
                </CardTitle>
                <CardDescription>
                  Kích hoạt hoặc tạm dừng khuyến mãi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2C2C2C]">
                      Kích hoạt ngay
                    </p>
                    <p className="text-sm text-gray-600">
                      Khuyến mãi sẽ có hiệu lực ngay sau khi lưu
                    </p>
                  </div>
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">
                  Quản lý Khuyến mãi
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuditLog(!showAuditLog)}
              >
                <History className="w-4 h-4 mr-2" />
                Lịch sử thay đổi
              </Button>
              <Button
                onClick={handleCreateNew}
                className="bg-[#AF140B] hover:bg-[#8D0F08]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo khuyến mãi mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Đang chạy
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {
                      promotions.filter(
                        (p) => p.status === "active",
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Đã lên lịch
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {
                      promotions.filter(
                        (p) => p.status === "scheduled",
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Tạm dừng
                  </p>
                  <p className="text-3xl font-bold text-gray-600">
                    {
                      promotions.filter(
                        (p) => p.status === "inactive",
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Đã hết hạn
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {
                      promotions.filter(
                        (p) => p.status === "expired",
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mã khuyến mãi..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filterStatus}
                onValueChange={(value: any) =>
                  setFilterStatus(value)
                }
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem value="active">
                    Đang chạy
                  </SelectItem>
                  <SelectItem value="scheduled">
                    Đã lên lịch
                  </SelectItem>
                  <SelectItem value="inactive">
                    Tạm dừng
                  </SelectItem>
                  <SelectItem value="expired">
                    Đã hết hạn
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Promotions List */}
        <div className="space-y-4">
          {filteredPromotions.map((promo) => {
            const TypeIcon = getTypeIcon(promo.type);
            const usagePercentage =
              promo.usageLimit > 0
                ? (promo.usedCount / promo.usageLimit) * 100
                : 0;

            return (
              <Card
                key={promo.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#AF140B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-[#AF140B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-[#2C2C2C]">
                            {promo.name}
                          </h3>
                          {getStatusBadge(promo.status)}
                          {promo.type === "flash_sale" && (
                            <Badge className="bg-[#FFF9E5] text-[#B8860B] border border-[#D4AF37]">
                              <Zap className="w-3 h-3 mr-1" />
                              Flash Sale
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {promo.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {getTypeLabel(promo.type)}
                            </span>
                          </div>
                          {promo.code && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">
                                Mã:
                              </span>
                              <code className="px-2 py-0.5 bg-gray-100 rounded font-mono text-[#AF140B] font-medium">
                                {promo.code}
                              </code>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {promo.discountType ===
                              "percentage" ? (
                              <Percent className="w-4 h-4 text-gray-400" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-semibold text-[#AF140B]">
                              {promo.discountType ===
                                "percentage"
                                ? `${promo.discountValue}%`
                                : `${promo.discountValue.toLocaleString()}đ`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {format(
                                promo.startDate,
                                "dd/MM/yyyy",
                              )}{" "}
                              -{" "}
                              {format(
                                promo.endDate,
                                "dd/MM/yyyy",
                              )}
                            </span>
                          </div>
                        </div>
                        {promo.usageLimit > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">
                                Đã sử dụng: {promo.usedCount}/
                                {promo.usageLimit}
                              </span>
                              <span className="text-gray-600">
                                {usagePercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#D4AF37] h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(usagePercentage, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon"
                        title="Gán sản phẩm"
                        onClick={() => openAssignDialog(promo)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Package className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(promo)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(promo)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredPromotions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Không tìm thấy khuyến mãi nào
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Thử thay đổi bộ lọc hoặc tạo khuyến mãi mới
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="bg-[#AF140B] hover:bg-[#8D0F08]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khuyến mãi mới
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Business Rules Info */}
        <Card className="mt-8 border-[#D4AF37]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D4AF37]" />
              Chú ý:{" "}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#AF140B] font-semibold">
                    BR-49:
                  </span>
                  <p>
                    Khách hàng chỉ được áp dụng 1 mã giảm
                    giá/đơn hàng
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#AF140B] font-semibold">
                    BR-50:
                  </span>
                  <p>
                    Flash Sale tự động kết thúc đúng thời gian
                    và giá trở về giá gốc
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#AF140B] font-semibold">
                    BR-51:
                  </span>
                  <p>
                    Giảm giá tối đa 50% MSRP (trừ khi Super
                    Admin cho phép)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#AF140B] font-semibold">
                    BR-52:
                  </span>
                  <p>
                    Điểm loyalty tính theo giá sau khi áp dụng
                    giảm giá
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#AF140B] font-semibold">
                    BR-53:
                  </span>
                  <p>
                    Không áp dụng voucher cho hàng Clearance (đã
                    giảm {">"} 70%)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

{/* Assign Products Modal */ }
{
    assignTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-[#2C2C2C] flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Gán sản phẩm vào khuyến mãi
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {assignTarget.name} · đã chọn {selectedProductIds.size} sản phẩm
                        </p>
                    </div>
                    <button onClick={() => setAssignTarget(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none">
                        ×
                    </button>
                </div>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-9 pr-3 h-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tìm sản phẩm theo tên..."
                            value={assignSearch}
                            onChange={(e) => setAssignSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {products
                        .filter((p) => p.name.toLowerCase().includes(assignSearch.toLowerCase()))
                        .map((p, idx) => {
                            const pid = idx + 1;
                            const checked = selectedProductIds.has(pid);
                            return (
                                <label key={p.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"
                                        }`}>
                                    <input type="checkbox" checked={checked}
                                        onChange={() => toggleProduct(pid)}
                                        className="w-4 h-4 accent-blue-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2C2C2C] truncate">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.price?.toLocaleString("vi-VN")}₫</p>
                                    </div>
                                </label>
                            );
                        })}
                </div>
                {assignError && (
                    <div className="mx-4 mb-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />{assignError}
                    </div>
                )}
                <div className="flex items-center justify-end gap-3 p-4 border-t">
                    <Button variant="outline" onClick={() => setAssignTarget(null)} disabled={assigning}>
                        Hủy
                    </Button>
                    <Button onClick={handleAssignProducts}
                        disabled={selectedProductIds.size === 0 || assigning}
                        className="bg-blue-600 hover:bg-blue-700 text-white">
                        {assigning
                            ? "Đang gán..."
                            : `Gán${selectedProductIds.size > 0 ? ` ${selectedProductIds.size}` : ""} sản phẩm`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
    </div>
  );
}