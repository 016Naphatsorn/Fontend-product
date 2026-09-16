import "./App.css";
import { useState, useEffect } from "react";
import {
  Package,
  Pencil,
  Trash2,
  PlusCircle,
  Clock,
  Phone,
} from "lucide-react";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [duration, setDuration] = useState("60");
  const [checkOut, setCheckOut] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // เวลาปัจจุบันสำหรับ Countdown
  const [currentTime, setCurrentTime] = useState(new Date());

  // --------------------------------------------------
  // Clock
  // --------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------
  // Fetch data
  // --------------------------------------------------
  const fetchProduct = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลได้");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // --------------------------------------------------
  // คำนวณเวลาออกจากเวลาเข้า + ระยะเวลาเล่น
  // --------------------------------------------------
  const calculateCheckOut = (time, minutes) => {
    if (!time || !minutes) return "";

    const [hours, mins] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(mins);
    date.setSeconds(0);
    date.setMilliseconds(0);

    date.setMinutes(date.getMinutes() + Number(minutes));

    return date.toTimeString().slice(0, 5);
  };

  // เมื่อกรอกเวลาเข้า
  const handleCheckInChange = (e) => {
    const time = e.target.value;

    setCheckIn(time);

    if (time && duration) {
      setCheckOut(calculateCheckOut(time, duration));
    }
  };

  // เมื่อเปลี่ยนระยะเวลาเล่น
  const handleDurationChange = (e) => {
    const value = e.target.value;

    setDuration(value);

    if (checkIn && value) {
      setCheckOut(calculateCheckOut(checkIn, value));
    }
  };

  // --------------------------------------------------
  // แปลงเวลาออกเป็น Date
  // --------------------------------------------------
  const getCheckOutDate = (item) => {
    if (!item.checkOut) return null;

    const [hours, minutes] = item.checkOut.split(":").map(Number);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };

  // --------------------------------------------------
  // Countdown
  // --------------------------------------------------
  const getRemainingTime = (item) => {
    const checkOutDate = getCheckOutDate(item);

    if (!checkOutDate) {
      return {
        totalSeconds: 0,
        text: "-",
      };
    }

    let diff = Math.floor(
      (checkOutDate.getTime() - currentTime.getTime()) / 1000,
    );

    // รองรับกรณีเวลาออกข้ามเที่ยงคืน
    if (diff < -12 * 60 * 60) {
      checkOutDate.setDate(checkOutDate.getDate() + 1);

      diff = Math.floor(
        (checkOutDate.getTime() - currentTime.getTime()) / 1000,
      );
    }

    if (diff <= 0) {
      return {
        totalSeconds: 0,
        text: "00:00:00",
      };
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return {
      totalSeconds: diff,
      text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`,
    };
  };

  // --------------------------------------------------
  // Status
  // --------------------------------------------------
  const getStatus = (item) => {
    const remaining = getRemainingTime(item);

    if (remaining.totalSeconds <= 0) {
      return "หมดเวลา";
    }

    return "กำลังเล่น";
  };

  // --------------------------------------------------
  // Create
  // --------------------------------------------------
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!name || !age || !checkIn || !duration || !parentPhone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const finalCheckOut = calculateCheckOut(checkIn, duration);

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age: Number(age),
          checkIn,
          checkOut: finalCheckOut,
          duration: Number(duration),
          parentPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      resetForm();
      fetchProduct();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Update
  // --------------------------------------------------
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!name || !age || !checkIn || !duration || !parentPhone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const finalCheckOut = calculateCheckOut(checkIn, duration);

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age: Number(age),
          checkIn,
          checkOut: finalCheckOut,
          duration: Number(duration),
          parentPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId
            ? {
                ...product,
                name,
                age: Number(age),
                checkIn,
                checkOut: finalCheckOut,
                duration: Number(duration),
                parentPhone,
              }
            : product,
        ),
      );

      resetForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------
  const startEditing = (item) => {
    setEditingId(item.id);
    setName(item.name || "");
    setAge(item.age || "");
    setCheckIn(item.checkIn || "");
    setCheckOut(item.checkOut || "");
    setDuration(item.duration || "60");
    setParentPhone(item.parentPhone || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------
  const handleDeleteProduct = async (id) => {
    if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------
  const resetForm = () => {
    setName("");
    setAge("");
    setCheckIn("");
    setCheckOut("");
    setDuration("60");
    setParentPhone("");
    setEditingId(null);
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="hero-panel rounded-box px-5 py-7 text-primary-content shadow-xl sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid place-items-center rounded-lg bg-white px-1 py-1 ring-2 ring-white/10">
                  <img src="img/logo1.png" className="size-7" alt="Brix Land" />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Brix Land Happy
              </h1>

              <p className="mt-2 max-w-xl rounded-lg bg-black/30 px-2 py-1 text-sm text-primary-content/75 ring-2 ring-white/15 sm:text-base">
                อาณาจักรสนามเด็กเล่นในร่ม (Creative Playland)
              </p>
            </div>
          </div>
        </header>

        {/* Form */}
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <PlusCircle className="size-5" />
              </div>

              <div>
                <h2 className="card-title text-xl">
                  {editingId ? "แก้ไขข้อมูลผู้ใช้บริการ" : "ลงทะเบียนเข้าเล่น"}
                </h2>

                <p className="text-sm text-base-content/60">
                  กรอกข้อมูลเด็กและเวลาที่เข้าใช้บริการ
                </p>
              </div>
            </div>

            <form
              className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={editingId ? handleUpdateProduct : handleCreateProduct}
            >
              {/* ชื่อ */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">ชื่อเด็ก</span>

                <input
                  className="input input-bordered w-full"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น น้องต้น"
                />
              </label>

              {/* อายุ */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">อายุ (ขวบ)</span>

                <input
                  className="input input-bordered w-full"
                  type="number"
                  min="1"
                  max="18"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="เช่น 5"
                />
              </label>

              {/* เบอร์ */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">
                  เบอร์ผู้ปกครอง
                </span>

                <input
                  className="input input-bordered w-full"
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="เช่น 0812345678"
                />
              </label>

              {/* เวลาเข้า */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">เวลาเข้า</span>

                <input
                  className="input input-bordered w-full"
                  type="time"
                  value={checkIn}
                  onChange={handleCheckInChange}
                />
              </label>

              {/* ระยะเวลา */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">
                  ระยะเวลาเล่น
                </span>

                <select
                  className="select select-bordered w-full"
                  value={duration}
                  onChange={handleDurationChange}
                >
                  <option value="30">30 นาที</option>
                  <option value="60">1 ชั่วโมง</option>
                  <option value="90">1 ชั่วโมง 30 นาที</option>
                  <option value="120">2 ชั่วโมง</option>
                  <option value="180">3 ชั่วโมง</option>
                </select>
              </label>

              {/* เวลาออก */}
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">เวลาออก</span>

                <input
                  className="input input-bordered w-full bg-base-200"
                  type="time"
                  value={checkOut}
                  readOnly
                />
              </label>

              {/* Preview */}
              {checkIn && checkOut && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:col-span-2 lg:col-span-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <div className="text-xs text-base-content/60">
                        เวลาเข้า
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {checkIn}
                      </div>
                    </div>

                    <div className="text-base-content/40">→</div>

                    <div>
                      <div className="text-xs text-base-content/60">
                        เวลาออก
                      </div>
                      <div className="text-xl font-bold text-error">
                        {checkOut}
                      </div>
                    </div>

                    <div className="divider divider-horizontal mx-0 hidden md:flex" />

                    <div>
                      <div className="text-xs text-base-content/60">
                        ระยะเวลา
                      </div>
                      <div className="text-xl font-bold">{duration} นาที</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3 sm:flex-row sm:justify-end">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <PlusCircle className="size-4" />
                  )}

                  {editingId ? "อัปเดตข้อมูล" : "บันทึกการเข้าเล่น"}
                </button>

                {editingId && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={resetForm}
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="alert alert-error shadow-sm">
            <span>เกิดข้อผิดพลาด: {error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="card border border-dashed border-base-300 bg-base-100 shadow-sm">
            <div className="card-body items-center py-14 text-center">
              <Package className="size-12 text-base-content/25" />

              <h2 className="card-title mt-2 rounded-lg bg-black/30 px-2 py-1 text-sm text-primary-content/75 ring-2 ring-white/15 sm:text-base">
                ยังไม่มีรายการเข้าเล่น
              </h2>

              <p className="text-sm text-base-content/60">
                เริ่มต้นด้วยการลงทะเบียนเด็กด้านบน
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-48 items-center justify-center rounded-box border border-base-300 bg-base-100 shadow-sm">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        )}

        {/* Table */}
        {!loading && products.length > 0 && (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-5 py-5 sm:px-6">
                <div>
                  <h2 className="card-title">รายการผู้ใช้บริการ</h2>

                  <p className="text-sm text-base-content/60">
                    มีผู้ใช้บริการ {products.length} รายการ
                  </p>
                </div>

                <span className="badge badge-primary badge-lg">
                  {products.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>รหัส</th>
                      <th>ชื่อ</th>
                      <th>อายุ</th>
                      <th>เวลาเข้า</th>
                      <th>เวลาออก</th>
                      <th>เวลาที่เหลือ</th>
                      <th>สถานะ</th>
                      <th>ผู้ปกครอง</th>
                      <th className="text-right">การจัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((item) => {
                      const remaining = getRemainingTime(item);
                      const status = getStatus(item);
                      const isPlaying = status === "กำลังเล่น";

                      return (
                        <tr key={item.id}>
                          {/* ID */}
                          <td className="font-mono text-xs text-base-content/50">
                            #{item.id}
                          </td>

                          {/* Name */}
                          <td className="font-semibold">{item.name}</td>

                          {/* Age */}
                          <td>{item.age} ขวบ</td>

                          {/* Check in */}
                          <td>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4 text-primary" />
                              {item.checkIn || "-"}
                            </div>
                          </td>

                          {/* Check out */}
                          <td className="font-medium text-error">
                            {item.checkOut || "-"}
                          </td>

                          {/* Countdown */}
                          <td>
                            <span
                              className={`font-mono text-lg font-bold ${
                                isPlaying ? "text-primary" : "text-error"
                              }`}
                            >
                              {remaining.text}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            {isPlaying ? (
                              <span className="badge badge-success gap-1 text-white">
                                <span className="size-2 animate-pulse rounded-full bg-white" />
                                กำลังเล่น
                              </span>
                            ) : (
                              <span className="badge badge-error gap-1 text-white">
                                หมดเวลา
                              </span>
                            )}
                          </td>

                          {/* Phone */}
                          <td>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Phone className="size-4 text-base-content/50" />
                              {item.parentPhone || "-"}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => startEditing(item)}
                                className="btn btn-square btn-ghost btn-sm text-primary hover:bg-primary/10"
                                title="แก้ไข"
                              >
                                <Pencil className="size-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(item.id)}
                                className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10"
                                title="ลบ"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
