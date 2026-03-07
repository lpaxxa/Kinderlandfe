import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import api from "../../services/api";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  ArrowLeft,
  Shield,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function CustomerProfile() {
  const { user } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    dateOfBirth: "",
  });

  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    street: "",
    provinceId: "",
    provinceName: "",
    districtId: "",
    districtName: "",
    wardId: "",
    wardName: "",
  });

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };
  const startEditAddress = (addr) => {
    setEditingAddressId(addr.addressId);

    setAddressForm({
      street: addr.street || "",
      provinceId: addr.provinceId || "",
      provinceName: addr.provinceName || "",
      districtId: addr.districtId || "",
      districtName: addr.districtName || "",
      wardId: addr.wardId || "",
      wardName: addr.wardName || "",
    });
  };

  const updateAddress = async () => {
    try {
      await api.put(
        `/api/v1/address/update/${editingAddressId}`,
        addressForm
      );

      toast.success("Cập nhật địa chỉ thành công");

      setEditingAddressId(null);

      // reload address
      const res = await api.get("/api/v1/address/my-addresses");
      setAddresses(res.data);

    } catch (error) {
      console.error(error);
      toast.error("Cập nhật địa chỉ thất bại");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {

      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts.slice(0, -1).join(" ");
      const lastName = nameParts.slice(-1).join("");

      const payload = {
        phone: formData.phone,
        firstName: firstName,
        lastName: lastName
      };

      await api.post("/api/v1/account/update-profile", payload);

      toast.success("Cập nhật thông tin thành công!");

      setIsEditing(false);

    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      dateOfBirth: "1990-05-15",
      gender: "female",
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get("/api/v1/address/my-addresses");

        console.log("Address response:", res);

        setAddresses(res.data);
      } catch (error) {
        console.error("Fetch address error:", error);
      }
    };

    fetchAddresses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* PROFILE HEADER */}
        <Card className="mb-8 overflow-hidden border border-gray-200 shadow-xl">
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 h-28 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <CardContent className="flex items-center gap-5 -mt-12 pb-6">

            <div className="w-20 h-20 rounded-full bg-white shadow-xl border-4 border-white flex items-center justify-center text-2xl font-bold text-red-500">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name}
              </h2>

              <p className="text-gray-600 text-sm">
                {user?.email}
              </p>
            </div>

            <Badge className="bg-yellow-400 text-white font-semibold shadow-sm">
              👑 Gold Member
            </Badge>

          </CardContent>
        </Card>

        {/* HEADER */}
        <div className="mb-8">

          <Link to="/account">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại tài khoản
            </Button>
          </Link>

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Thông tin tài khoản
              </h1>

              <p className="text-gray-700 text-sm">
                Quản lý thông tin cá nhân của bạn
              </p>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT CONTENT */}

          <div className="md:col-span-2 space-y-6">

            {/* PROFILE */}

            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">

              <CardHeader>
                <CardTitle className="text-gray-900 text-lg font-semibold">
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">

                {/* NAME */}

                <div>
                  <Label className="text-gray-800 font-medium text-sm">
                    Họ và tên *
                  </Label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />

                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Nhập họ và tên"
                    />

                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <Label className="text-gray-800 font-medium text-sm">
                    Email *
                  </Label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                    <Input
                      value={formData.email}
                      disabled
                      className="pl-10 bg-gray-100 border-gray-200"
                    />

                  </div>

                  <p className="text-xs text-gray-600 mt-1">
                    Email không thể thay đổi
                  </p>

                </div>

                {/* PHONE */}

                <div>
                  <Label className="text-gray-800 font-medium text-sm">
                    Số điện thoại
                  </Label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Nhập số điện thoại"
                    />

                  </div>
                </div>




                {/* ADDRESS */}

                <div>
                  <Label className="text-gray-800 font-medium text-sm">
                    Địa chỉ
                  </Label>

                  <div className="relative">

                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                    <div className="space-y-2">
                      {addresses.length === 0 ? (
                        <p className="text-sm text-gray-500">Chưa có địa chỉ</p>
                      ) : (
                        addresses.map((addr) => (
                          <div
                            key={addr.addressId}
                            className="p-3 border rounded-lg text-sm bg-gray-50 space-y-2"
                          >
                            <p>{addr.fullAddress}</p>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditAddress(addr)}
                            >
                              Sửa
                            </Button>

                            {editingAddressId === addr.addressId && (
                              <div className="mt-3 space-y-2 bg-white p-3 rounded border">

                                <Input
                                  name="street"
                                  placeholder="Street"
                                  value={addressForm.street}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="provinceName"
                                  placeholder="Province Name"
                                  value={addressForm.provinceName}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="provinceId"
                                  placeholder="Province ID"
                                  value={addressForm.provinceId}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="districtName"
                                  placeholder="District Name"
                                  value={addressForm.districtName}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="districtId"
                                  placeholder="District ID"
                                  value={addressForm.districtId}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="wardName"
                                  placeholder="Ward Name"
                                  value={addressForm.wardName}
                                  onChange={handleAddressChange}
                                />

                                <Input
                                  name="wardId"
                                  placeholder="Ward ID"
                                  value={addressForm.wardId}
                                  onChange={handleAddressChange}
                                />

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-red-500 text-white"
                                    onClick={updateAddress}
                                  >
                                    Update
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingAddressId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>

                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">

                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </Button>

                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>

                  </div>
                )}

              </CardContent>
            </Card>

            {/* SECURITY */}

            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
                  <Shield className="w-5 h-5 text-red-500" />
                  Bảo mật tài khoản
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="flex justify-between items-center p-4 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition">

                  <div>
                    <p className="font-semibold text-gray-900">
                      Mật khẩu
                    </p>
                    <p className="text-sm text-gray-600">
                      ••••••••
                    </p>
                  </div>

                  <Button variant="outline" size="sm">
                    Đổi mật khẩu
                  </Button>

                </div>

                <div className="flex justify-between items-center p-4 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition">

                  <div>
                    <p className="font-semibold text-gray-900">
                      Xác thực 2 bước
                    </p>
                    <p className="text-sm text-gray-600">
                      Tăng cường bảo mật tài khoản
                    </p>
                  </div>

                  <Badge className="bg-gray-200 text-gray-700">
                    Chưa kích hoạt
                  </Badge>

                </div>

              </CardContent>
            </Card>

          </div>

          {/* SIDEBAR */}

          <div className="space-y-6">

            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">

              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold">
                  Trạng thái tài khoản
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Trạng thái
                  </span>

                  <Badge className="bg-green-100 text-green-700">
                    Đã xác thực
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Hạng thành viên
                  </span>

                  <Badge className="bg-yellow-400 text-white font-semibold shadow-sm">
                    👑 Gold
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Tham gia
                  </span>

                  <span className="font-semibold text-gray-900">
                    01/2024
                  </span>
                </div>

              </CardContent>

            </Card>

            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">

              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold">
                  Hoạt động
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Đơn hàng
                  </span>
                  <span className="font-bold text-red-500 text-lg">
                    12
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Đánh giá
                  </span>
                  <span className="font-bold text-red-500 text-lg">
                    8
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm font-medium">
                    Yêu thích
                  </span>
                  <span className="font-bold text-red-500 text-lg">
                    15
                  </span>
                </div>

              </CardContent>

            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}