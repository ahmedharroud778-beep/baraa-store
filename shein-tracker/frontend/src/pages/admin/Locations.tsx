import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { City } from '../../lib/api';

export default function AdminLocations() {
  const [cities, setCities] = useState<City[]>([]);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await api.getCities(token);
      setCities(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      await api.addCity(token, nameEn, nameAr);
      setNameEn('');
      setNameAr('');
      fetchCities();
    } catch (error) {
      alert('Failed to add city');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      await api.deleteCity(token, id);
      fetchCities();
    } catch (error) {
      alert('Failed to delete city');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Locations</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Add New City</h2>
        <form onSubmit={handleAddCity} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name (English)</label>
            <input required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
            <input required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full p-2 border rounded" dir="rtl" />
          </div>
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">Add City</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">English Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arabic Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cities.map(city => (
              <tr key={city.id}>
                <td className="px-6 py-4">{city.nameEn}</td>
                <td className="px-6 py-4">{city.nameAr}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(city.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cities.length === 0 && (
          <div className="p-4 text-center text-gray-500">No cities found.</div>
        )}
      </div>
    </div>
  );
}
