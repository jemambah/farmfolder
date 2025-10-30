import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Plus, Calendar, DollarSign, Package } from 'lucide-react';

const FarmData = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: 'planting',
    crop: 'maize',
    activity: '',
    quantity: '',
    unit: 'kg',
    cost: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [farmRecords, setFarmRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchFarmData = async () => {
    try {
      const response = await axios.get('/api/farm-data?limit=20');
      if (response.data.success) {
        setFarmRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching farm data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/farm-data', formData);
      if (response.data.success) {
        setFormData({
          category: 'planting',
          crop: 'maize',
          activity: '',
          quantity: '',
          unit: 'kg',
          cost: '',
          revenue: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setShowForm(false);
        fetchFarmData();
      }
    } catch (error) {
      console.error('Error adding farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    planting: { label: 'Planting', color: 'bg-green-100 text-green-800' },
    harvest: { label: 'Harvest', color: 'bg-yellow-100 text-yellow-800' },
    input: { label: 'Input Cost', color: 'bg-blue-100 text-blue-800' },
    market: { label: 'Market Sale', color: 'bg-purple-100 text-purple-800' },
    labor: { label: 'Labor', color: 'bg-orange-100 text-orange-800' },
    equipment: { label: 'Equipment', color: 'bg-gray-100 text-gray-800' }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Farm Data Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Record</span>
        </button>
      </div>

      {showForm && (
        <div className="card animate-slide-up">
          <h2 className="text-xl font-semibold mb-4">Add New Farm Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {Object.entries(categories).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Crop</label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="maize">Maize</option>
                  <option value="beans">Beans</option>
                  <option value="coffee">Coffee</option>
                  <option value="bananas">Bananas</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="potatoes">Potatoes</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity</label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Planting, Weeding, Harvesting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0"
                    step="0.01"
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="input-field w-32"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="liters">liters</option>
                    <option value="bags">bags</option>
                    <option value="acres">acres</option>
                  </select>
                </div>
              </div>

              {(formData.category === 'input' || formData.category === 'labor' || formData.category === 'equipment') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {formData.category === 'market' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Revenue ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Additional notes or observations..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Farm Records</h2>
        <div className="space-y-3">
          {farmRecords.length > 0 ? (
            farmRecords.map((record) => (
              <div key={record._id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${categories[record.category]?.color}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{record.activity}</h3>
                    <p className="text-sm text-gray-500">
                      {record.crop} • {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {record.quantity && (
                    <p className="font-medium">{record.quantity} {record.unit}</p>
                  )}
                  {record.cost && (
                    <p className="text-red-600">-${record.cost}</p>
                  )}
                  {record.revenue && (
                    <p className="text-green-600">+${record.revenue}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No farm records yet. Add your first record to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmData;
