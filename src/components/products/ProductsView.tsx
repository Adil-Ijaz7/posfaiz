import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Product, ProductUnit } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const ProductsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [categories] = useState(() => storage.getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productNotice, setProductNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    urduName: '',
    sku: '',
    barcode: '',
    categoryId: 'cat_beverages',
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    currentStock: 50,
    minStock: 10,
    unit: 'Piece',
    description: '',
    imageUrl: '',
    status: 'active',
  });

  const refreshProducts = () => {
    setProducts(storage.getProducts());
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      urduName: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `896${Math.floor(1000000 + Math.random() * 9000000)}`,
      categoryId: categories[0]?.id || 'cat_grocery',
      brand: '',
      purchasePrice: 100,
      sellingPrice: 130,
      wholesalePrice: 120,
      currentStock: 50,
      minStock: 10,
      unit: 'Piece',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=60',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    storage.deleteProduct(id, currentUser);
    refreshProducts();
    setProductNotice(`Product "${name}" was deleted.`);
    setTimeout(() => setProductNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const finalProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      name: formData.name.trim(),
      urduName: formData.urduName?.trim() || '',
      sku: formData.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      barcode: formData.barcode?.trim() || `${Date.now()}`,
      categoryId: formData.categoryId || categories[0]?.id || 'cat_beverages',
      brand: formData.brand?.trim() || 'General',
      purchasePrice: Number(formData.purchasePrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || Number(formData.sellingPrice) || 0,
      currentStock: Number(formData.currentStock) || 0,
      minStock: Number(formData.minStock) || 10,
      unit: (formData.unit as ProductUnit) || 'Piece',
      description: formData.description?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || '',
      status: formData.status || 'active',
      totalSold: editingProduct?.totalSold || 0,
    };

    storage.saveProduct(finalProduct, currentUser);
    refreshProducts();
    setIsModalOpen(false);
  };

  const filtered = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.urduName && p.urduName.includes(q)) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.brand.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Cost Price (PKR)', 'Selling Price (PKR)', 'Stock', 'Unit'];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.categoryId}"`,
      p.purchasePrice,
      p.sellingPrice,
      p.currentStock,
      p.unit,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Products_Catalog_${formatDatePK(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unitsList: ProductUnit[] = [
    'Piece',
    'Box',
    'Pack',
    'Kg',
    'Gram',
    'Liter',
    'Meter',
    'Dozen',
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Product Catalog & Pricing (پروڈکٹس فہرست)
            </h2>
            <p className="text-xs text-slate-400">
              Manage retail prices, wholesale rates, barcodes, and inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product (نیا آئٹم)</span>
          </button>
        </div>
      </div>

      {productNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-fadeIn">
          {productNotice}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, Urdu Name, SKU, Barcode..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Product Info</th>
              <th className="py-3.5 px-4">SKU / Barcode</th>
              <th className="py-3.5 px-4 text-right">Cost Price (PKR)</th>
              <th className="py-3.5 px-4 text-right">Selling Price (PKR)</th>
              <th className="py-3.5 px-4 text-right">Wholesale (PKR)</th>
              <th className="py-3.5 px-4 text-center">Stock Level</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No products matched your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const isLowStock = prod.currentStock <= prod.minStock && prod.currentStock > 0;
                const isOutOfStock = prod.currentStock <= 0;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Tag className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{prod.name}</div>
                          {prod.urduName && (
                            <div className="text-[11px] text-slate-400 font-sans">{prod.urduName}</div>
                          )}
                          <div className="text-[10px] text-slate-400">{prod.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>{prod.sku}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        <span>{prod.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-300">
                      {formatPKR(prod.purchasePrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatPKR(prod.sellingPrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-cyan-400">
                      {formatPKR(prod.wholesalePrice || prod.sellingPrice)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOutOfStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isLowStock
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Out of Stock'
                          : `${prod.currentStock} ${prod.unit}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Coca Cola 500ml"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Urdu Name (نام اردو میں)
                </label>
                <input
                  type="text"
                  value={formData.urduName || ''}
                  onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                  placeholder="مثلاً کوکا کولا 500 ملی لیٹر"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">SKU Code</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. CC-500"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="e.g. 8964000101"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Coca Cola / Shan"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Purchase / Cost Price (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.purchasePrice ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Selling Price (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.sellingPrice ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Wholesale Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.wholesalePrice ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Unit of Measure</label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value as ProductUnit })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {unitsList.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Initial / Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStock ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">
                  Image URL (Web image preview)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
