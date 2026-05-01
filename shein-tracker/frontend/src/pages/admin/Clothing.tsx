import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { ClothingItem } from '../../lib/api';

export default function AdminClothing() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [newWeightKg, setNewWeightKg] = useState('');
  
  // Weight form
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [labelEn, setLabelEn] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await api.getClothingItems(token);
      setItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const newItem = await api.addClothingItem(token, nameEn, nameAr);
      
      if (newWeightKg) {
        await api.addClothingWeight(token, newItem.id, {
          label_en: nameEn,
          label_ar: nameAr,
          weight_kg: parseFloat(newWeightKg)
        });
      }

      setNameEn('');
      setNameAr('');
      setNewWeightKg('');
      fetchItems();
    } catch (error) {
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      await api.deleteClothingItem(token, id);
      fetchItems();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleAddWeight = async (e: React.FormEvent, itemId: number) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      await api.addClothingWeight(token, itemId, { label_en: labelEn, label_ar: labelAr, weight_kg: parseFloat(weightKg) });
      setLabelEn('');
      setLabelAr('');
      setWeightKg('');
      setSelectedItemId(null);
      fetchItems();
    } catch (error) {
      alert('Failed to add weight');
    }
  };

  const handleDeleteWeight = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      await api.deleteClothingWeight(token, id);
      fetchItems();
    } catch (error) {
      alert('Failed to delete weight');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Clothing & Weights</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Clothing Item</h2>
        <form onSubmit={handleAddItem} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name (English)</label>
            <input required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Dress" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
            <input required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full p-2 border rounded" dir="rtl" placeholder="e.g. فستان" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Weight (KG)</label>
            <input required type="number" step="0.01" min="0.01" value={newWeightKg} onChange={e => setNewWeightKg(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 0.5" />
          </div>
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">Add Item</button>
        </form>
      </div>

      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold">{item.nameEn} / {item.nameAr}</h3>
              <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete Item</button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Weight Options:</h4>
              <ul className="space-y-2">
                {item.weights.map(w => (
                  <li key={w.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span>{w.labelEn} / {w.labelAr} ({w.weightKg} kg)</span>
                    <button onClick={() => handleDeleteWeight(w.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedItemId === item.id ? (
              <form onSubmit={e => handleAddWeight(e, item.id)} className="flex gap-2 items-end bg-gray-50 p-4 rounded mt-4 border border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Label (EN)</label>
                  <input required value={labelEn} onChange={e => setLabelEn(e.target.value)} className="w-full p-2 text-sm border rounded" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1">Label (AR)</label>
                  <input required value={labelAr} onChange={e => setLabelAr(e.target.value)} className="w-full p-2 text-sm border rounded" dir="rtl" />
                </div>
                <div className="w-24">
                  <label className="block text-xs mb-1">Weight (kg)</label>
                  <input type="number" step="0.01" min="0.01" required value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full p-2 text-sm border rounded" />
                </div>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700">Save</button>
                <button type="button" onClick={() => setSelectedItemId(null)} className="bg-gray-400 text-white px-4 py-2 text-sm rounded hover:bg-gray-500">Cancel</button>
              </form>
            ) : (
              <button onClick={() => setSelectedItemId(item.id)} className="text-pink-600 text-sm font-medium hover:text-pink-800">+ Add Weight Option</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
