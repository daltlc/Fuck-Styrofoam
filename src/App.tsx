import React, { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle, Package, CheckCircle } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  category: string;
  products: string[];
  severity: 'low' | 'medium' | 'high';
  notes: string;
  lastReported: string;
  verified: boolean;
}

interface FormData {
  name: string;
  category: string;
  products: string;
  notes: string;
  severity: 'low' | 'medium' | 'high';
}

type SubmitStatus = 'submitting' | 'success' | 'error' | null;

export default function StyrofoamShame() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'Electronics',
    products: '',
    notes: '',
    severity: 'medium'
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/get-companies');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      const response = await fetch('/.netlify/functions/submit-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          products: formData.products.split(',').map(p => p.trim()),
          severity: formData.severity,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const result = await response.json();
      
      setCompanies(prev => [...prev, result.company]);
      
      setSubmitStatus('success');
      
      setFormData({
        name: '',
        category: 'Electronics',
        products: '',
        notes: '',
        severity: 'medium'
      });

      setTimeout(() => {
        setShowSubmitForm(false);
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('error');
    }
  };

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(companies.map(c => c.category))];
    return cats;
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || company.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, companies]);

  const getSeverityColor = (severity: Company['severity']): string => {
    switch(severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'low': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading the hall of shame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-2">🚫 Fuck Styrofoam</h1>
          <p className="text-xl text-red-100">Calling out companies that pollute with polystyrene packaging</p>
          <p className="text-sm text-red-200 mt-2">Community-powered database | Help us grow by reporting offenders</p>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-orange-100 border-l-4 border-orange-500 p-4 max-w-6xl mx-auto mt-6 mx-4">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <p className="text-orange-900 font-semibold">Why styrofoam (EPS) is terrible:</p>
            <ul className="text-orange-800 text-sm mt-2 space-y-1">
              <li>• Takes 500+ years to decompose in landfills</li>
              <li>• Breaks into microplastics that contaminate ecosystems and oceans</li>
              <li>• Non-recyclable in most areas (despite misleading recycling symbols)</li>
              <li>• Made from petroleum - a non-renewable fossil fuel resource</li>
              <li>• Animals mistake foam pieces for food, causing injury and death</li>
              <li>• Contains styrene, a probable human carcinogen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> This is a community database stored on Netlify. 
            Know a specific company using styrofoam? <button onClick={() => setShowSubmitForm(!showSubmitForm)} className="underline font-semibold hover:text-blue-700">Submit a report</button>
          </p>
        </div>
      </div>

      {/* Submit Form */}
      {showSubmitForm && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-300">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Report a Styrofoam Offender</h3>
            <p className="text-gray-600 mb-4">Help build this database by reporting companies that use excessive styrofoam packaging.</p>
            
            {submitStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Report submitted successfully! Thank you for contributing.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error submitting report. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Company Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  placeholder="e.g., ACME Corp" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category *</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option>Electronics</option>
                  <option>Food Delivery</option>
                  <option>Furniture</option>
                  <option>Appliances</option>
                  <option>Food Service</option>
                  <option>Healthcare</option>
                  <option>Electronics Retail</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Products with Styrofoam * (comma-separated)</label>
                <input 
                  type="text" 
                  required
                  value={formData.products}
                  onChange={(e) => setFormData({...formData, products: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  placeholder="e.g., laptops, monitors, TVs" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Severity *</label>
                <select 
                  required
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Low - Minimal styrofoam use</option>
                  <option value="medium">Medium - Moderate styrofoam use</option>
                  <option value="high">High - Excessive styrofoam use</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Details *</label>
                <textarea 
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  rows={3}
                  placeholder="Describe the styrofoam usage... Be specific about what you received and when."
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={submitStatus === 'submitting'}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSubmitStatus(null);
                  }} 
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500">Submissions are stored permanently in Netlify Blobs and appear immediately.</p>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing <span className="font-semibold text-red-600">{filteredCompanies.length}</span> offenders
        </div>

        {/* Company Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map(company => (
            <div key={company.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden">
              <div className={`p-4 border-l-4 ${getSeverityColor(company.severity)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                    {!company.verified && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded mt-1 inline-block">Industry Category</span>
                    )}
                  </div>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">{company.category}</p>
                
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">PRODUCTS WITH STYROFOAM:</p>
                  <div className="flex flex-wrap gap-1">
                    {company.products.map((product, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 italic">"{company.notes}"</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last reported: {company.lastReported}</span>
                  <span className={`px-2 py-1 rounded font-semibold ${
                    company.severity === 'high' ? 'bg-red-200 text-red-800' :
                    company.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {company.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No companies found matching your search.</p>
          </div>
        )}
      </div>

      {/* Who's Doing It Right Section */}
      <div className="bg-green-50 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Companies Doing It Right 🌱</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">Dell</h3>
              <p className="text-gray-700">Replaced styrofoam with bamboo and mushroom-based packaging starting in 2008-2012. Now uses mostly sustainable materials.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">McDonald's</h3>
              <p className="text-gray-700">Eliminated EPS packaging in 1990 under pressure from environmental groups. Committed to 100% sustainable packaging.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">Dunkin'</h3>
              <p className="text-gray-700">Eliminated EPS foam cups in 2018, switched to double-walled paper cups.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">Starbucks</h3>
              <p className="text-gray-700">Never used foam cups - has always used paper cups with dome lids.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-xl font-bold mb-4">What You Can Do</h3>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li>• Contact companies directly and demand sustainable alternatives</li>
            <li>• Choose companies that use paper, cardboard, or biodegradable packaging</li>
            <li>• Leave reviews mentioning excessive styrofoam packaging</li>
            <li>• Support legislation banning single-use styrofoam (12 U.S. states + DC have bans)</li>
            <li>• Share this site to raise awareness</li>
            <li>• Reuse styrofoam peanuts if you receive them, or take them to shipping stores</li>
            <li>• Find local EPS recycling facilities (they do exist, but are rare)</li>
          </ul>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400">
              <strong>About this site:</strong> This is a community-driven database to raise awareness about styrofoam pollution. 
              All data is stored in Netlify Blobs and persists permanently. Anyone can contribute reports.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Note: "Styrofoam" is actually a Dow Chemical trademark for extruded polystyrene (XPS) insulation. 
              This site focuses on Expanded Polystyrene (EPS) foam used in packaging, which is technically different but commonly called "styrofoam."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}