import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { exportToCSV, exportToPDF, formatCurrency, formatDate, triggerPrint } from '../../utils/exportUtils';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Download,
  Edit,
  FileDown,
  Filter,
  Package,
  Plus,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    branches,
    visibleInventory,
    visibleBranches,
    addInventoryItem,
    updateInventoryStock,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId ? currentUser.branchId : 'ALL'
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stockModalItem, setStockModalItem] = useState<InventoryItem | null>(null);
  const [stockInDelta, setStockInDelta] = useState<number>(0);
  const [stockOutDelta, setStockOutDelta] = useState<number>(0);

  // Form State for Add Item
  const [newItemData, setNewItemData] = useState<Omit<InventoryItem, 'id' | 'tenantId' | 'currentStock'>>({
    branchId: visibleBranches[0]?.id || '',
    name: '',
    category: 'Dobok/Uniform',
    quantityIn: 10,
    quantityOut: 0,
    minStockAlert: 5,
    unitCost: 15,
    sellingPrice: 35,
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  const lowStockItems = visibleInventory.filter((i) => i.currentStock <= i.minStockAlert);
  const totalValuation = visibleInventory.reduce(
    (acc, i) => acc + i.currentStock * i.sellingPrice,
    0
  );

  const filteredItems = visibleInventory.filter((item) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesQuery =
      (item.name || '').toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || item.branchId === selectedBranchFilter;

    return matchesQuery && matchesCategory && matchesBranch;
  });

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name || newItemData.quantityIn < 0) {
      alert('Please provide valid item name and quantity in.');
      return;
    }

    addInventoryItem(newItemData);
    setIsAddModalOpen(false);
  };

  const handleApplyStockUpdate = () => {
    if (!stockModalItem) return;
    updateInventoryStock(stockModalItem.id, Number(stockInDelta), Number(stockOutDelta));
    setStockModalItem(null);
    setStockInDelta(0);
    setStockOutDelta(0);
  };

  const handleExportCSV = () => {
    const rows = filteredItems.map((i) => ({
      'Item Name': i.name,
      Category: i.category,
      Branch: visibleBranches.find((b) => b.id === i.branchId)?.name || i.branchId,
      'Qty In': i.quantityIn,
      'Qty Out': i.quantityOut,
      'Current Stock': i.currentStock,
      'Min Stock Alert': i.minStockAlert,
      'Unit Cost': i.unitCost,
      'Selling Price': i.sellingPrice,
      'Total Value': i.currentStock * i.sellingPrice,
      'Last Updated': i.lastUpdated,
    }));
    exportToCSV(`Inventory_Stock_Report_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            Inventory & Equipment Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track uniforms, belts, protective gear, breaking boards, low stock reorder alerts, and inventory stock valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToPDF('inventory-stock-printable', `Inventory_Stock_${new Date().toISOString().split('T')[0]}`)}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={triggerPrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            Print Stock Sheet
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Inventory Item
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Low Stock Threshold Alert ({lowStockItems.length} items below minimum alert level)
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Items requiring reorder:{' '}
                {lowStockItems.map((i) => `${i.name} (${i.currentStock} remaining)`).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Stock</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {visibleInventory.reduce((acc, i) => acc + i.currentStock, 0)} Units
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{visibleInventory.length} Unique SKUs</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Retail Value</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalValuation)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Calculated at selling price</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock SKUs</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {lowStockItems.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Below reorder alert limit</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment, dobok, belts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Dobok/Uniform">Dobok / Uniforms</option>
              <option value="Belts">Belts</option>
              <option value="Protective Gear">Protective Gear</option>
              <option value="Training Equipment">Training Equipment</option>
              <option value="Merchandise">Merchandise</option>
            </select>
          </div>

          {/* Branch Filter */}
          {currentUser.role !== 'BRANCH_MANAGER' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                {visibleBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Quantity In</th>
                <th className="p-3.5">Quantity Out</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Unit Cost / Price</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No equipment or inventory items recorded.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  const branchName =
                    visibleBranches.find((b) => b.id === item.branchId)?.name || item.branchId;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium">{branchName}</td>

                      <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        +{item.quantityIn}
                      </td>

                      <td className="p-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                        -{item.quantityOut}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs inline-flex items-center gap-1 ${
                            isLow
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {item.currentStock} Units
                        </span>
                      </td>

                      <td className="p-3.5 font-medium">
                        <div>Cost: ${item.unitCost}</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">Price: ${item.sellingPrice}</div>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setStockModalItem(item);
                            setStockInDelta(0);
                            setStockOutDelta(0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" /> Add Inventory Item
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WTF Approved Chest Guard (Size 3)"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newItemData.category}
                  onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="Dobok/Uniform">Dobok / Uniforms</option>
                  <option value="Belts">Belts</option>
                  <option value="Protective Gear">Protective Gear</option>
                  <option value="Training Equipment">Training Equipment</option>
                  <option value="Merchandise">Merchandise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Branch
                </label>
                <select
                  value={newItemData.branchId}
                  disabled={currentUser.role === 'BRANCH_MANAGER'}
                  onChange={(e) => setNewItemData({ ...newItemData, branchId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {visibleBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Qty In
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemData.quantityIn}
                    onChange={(e) => setNewItemData({ ...newItemData, quantityIn: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Low Stock Alert Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newItemData.minStockAlert}
                    onChange={(e) => setNewItemData({ ...newItemData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemData.unitCost}
                    onChange={(e) => setNewItemData({ ...newItemData, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Retail Selling Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemData.sellingPrice}
                    onChange={(e) => setNewItemData({ ...newItemData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {stockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Adjust Stock: {stockModalItem.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current Stock: <span className="font-bold font-mono text-amber-500">{stockModalItem.currentStock}</span> (In: {stockModalItem.quantityIn}, Out: {stockModalItem.quantityOut})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Add New Shipments (Stock In +)
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockInDelta}
                  onChange={(e) => setStockInDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch / Sold Units (Stock Out -)
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockOutDelta}
                  onChange={(e) => setStockOutDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setStockModalItem(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStockUpdate}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 shadow-sm cursor-pointer"
              >
                Apply Stock Delta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE STOCK SHEET WITH SCHOOL LOGO */}
      <div id="inventory-stock-printable" className="hidden print:block p-8 bg-white text-slate-950 font-sans">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80'}
              alt="School Logo"
              className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
            />
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider">{currentTenant?.name || 'ETHIOPIAN TAEKWONDO ACADEMY'}</h1>
              <p className="text-xs text-slate-600">Official Equipment & Stock Audit Report — Date: {new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900">
              <th className="border border-slate-900 p-2 text-left">Item Name</th>
              <th className="border border-slate-900 p-2 text-left">Category</th>
              <th className="border border-slate-900 p-2 text-right">In Stock</th>
              <th className="border border-slate-900 p-2 text-right">Unit Price</th>
              <th className="border border-slate-900 p-2 text-right">Valuation</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-300">
                <td className="border border-slate-900 p-2 font-bold">{item.name}</td>
                <td className="border border-slate-900 p-2">{item.category}</td>
                <td className="border border-slate-900 p-2 text-right font-mono font-bold">{item.currentStock}</td>
                <td className="border border-slate-900 p-2 text-right font-mono">{formatCurrency(item.sellingPrice)}</td>
                <td className="border border-slate-900 p-2 text-right font-mono font-bold">{formatCurrency(item.currentStock * item.sellingPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex justify-between items-end text-xs pt-4 border-t border-slate-900">
          <div>
            <div>Generated by: {currentUser.name}</div>
            <div className="mt-4 flex items-center gap-2">
              <span>Master / Manager Signature:</span>
              {(() => {
                const activeSig = currentUser?.signature || (currentUser?.branchId ? branches.find(b => b.id === currentUser.branchId)?.signature : undefined) || currentTenant?.signature;
                return activeSig ? (
                  <img
                    src={activeSig}
                    alt="Signature"
                    className="h-8 max-w-[140px] object-contain"
                  />
                ) : (
                  <span>______________________</span>
                );
              })()}
            </div>
          </div>
          <div className="text-center">
            {currentTenant?.stampSeal ? (
              <img src={currentTenant.stampSeal} alt="Official Stamp" className="w-16 h-16 object-contain mx-auto mb-1 opacity-90 rotate-[-2deg]" />
            ) : (
              <div className="w-14 h-14 border border-dashed border-rose-400 rounded-full flex items-center justify-center text-[8px] text-rose-600 font-bold mx-auto mb-1 bg-rose-50/30">
                [ Stamp ]
              </div>
            )}
            <div className="border-t border-slate-900 w-40 text-center pt-0.5 font-bold text-[10px]">
              Official Stamp & Date
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
