import "./App.css";
import { useState, useEffect } from "react";
import { Package, Pencil, Trash2, PlusCircle } from "lucide-react";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    //fetch data from API
    fetchProduct();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, price: Number(price) }),
      });
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setName("");
      setPrice("");
      fetchProduct();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, price: Number(price) }),
      });
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId
            ? { ...product, name, price: Number(price) }
            : product,
        ),
      );
      setName("");
      setPrice("");
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการลบข้อมูล");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setEditingId(null);
  };

  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="hero-panel rounded-box px-5 py-7 text-primary-content shadow-xl sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:item-end sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/15">
                    <Package className="size-7" />
                  </div>
                  <span className="badge badge-outline border-white/40 text-white">
                    Product
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Product Management System
                </h1>
                <p className="mt-2 max-w-xl text-sm text-primary-content/75 sm:text-base">
                  จัดการสินค้าและราคาได้อย่างรวดเร็วในที่เดียว
                </p>
              </div>
            </div>
          </header>
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <PlusCircle className="size-5" />
                </div>
              </div>
              <h2 className="card-title text-xl">เพิ่มสินค้าใหม่</h2>
              <p className="text-sm text-base-content/60">
                กรอกข้อมูลเพื่อเพิ่มรายการเข้าสู่ระบบ
              </p>
            </div>
            <form
              className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.65fr_auto_auto] md:items-end"
              onSubmit={editingId ? handleUpdateProduct : handleCreateProduct}
            >
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">ชื่อสินค้า</span>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Gaming keyboard"
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">ราคา (บาท)</span>
                <input
                  className="input input-bordered w-full"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="เช่น 1500"
                />
              </label>

              <button
                className="btn btn-primary w-full md:w-auto"
                type="submit"
                disabled={submitting}
              >
                <Pencil className="size-4" />
                {editingId ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
              </button>

              {editingId && (
                <button
                  className="btn btn-ghost w-full md:w-auto"
                  type="button"
                  onClick={resetForm}
                >
                  ยกเลิก
                </button>
              )}
            </form>
          </section>
          {error && (
            <div className="alert alert-error shadow-sm">
              <span>เกิดข้อผิดพลาด: {error}</span>
            </div>
          )}
          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-box border border-base-300 bg-base-100 shadow-sm">
              <span className="loading loading-dots loading-lg text-primary" />
              <span className="sr-only">กำลังโหลดข้อมูล...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="card border border-dashed border-base-300 bg-base-100 shadow-sm">
              <div className="card-body items-center py-14 text-center">
                <Package className="size-12 text-base-content/25" />
                <h2 className="card-title mt-2">ยังไม่มีข้อมูลสินค้า</h2>
                <p className="text-sm text-base-content/60">
                  เริ่มต้นด้วยการเพิ่มสินค้าใหม่ด้านบน
                </p>
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-5 py-5 sm:px-6">
                <div>
                  <h2 className="card-title">รายการสินค้าทั้งหมด</h2>
                  <p className="text-sm text-base-content/60">
                    มีสินค้า {products.length} รายการ
                  </p>
                </div>
                <span className="badge badge-primary badge-lg">
                  {products.length}
                </span>
              </div>
              <div className="overflow-x-auto"></div>
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>รหัส</th>
                    <th>สินค้า</th>
                    <th>ราคา</th>
                    <th className="table-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs text-base-content/50">
                        #{item.id}
                      </td>
                      <td className="font-medium">{item.name}</td>
                      <td className="font-bold text-success">
                        {Number(item.price).toLocaleString()}฿
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => startEditing(item)}
                          className="btn btn-square btn-ghost btn-sm text-primary hover:bg-primary/10"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
