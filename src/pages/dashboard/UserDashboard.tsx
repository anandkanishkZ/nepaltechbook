import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  ShoppingBag, 
  Settings, 
  FileText, 
  User, 
  Receipt, 
  CreditCard,
  Bell,
  Shield,
  Heart,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getPurchasesByUserId, getFileById } from '../../data/mockData';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { Purchase, File } from '../../types';

interface PurchaseWithFile extends Purchase {
  file: File;
}

interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  totalDownloads: number;
  favoriteFiles: number;
  accountAge: number;
}

const UserDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseWithFile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userStats, setUserStats] = useState<UserStats>({
    totalPurchases: 0,
    totalSpent: 0,
    totalDownloads: 0,
    favoriteFiles: 0,
    accountAge: 0
  });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    bio: '',
    website: '',
    company: '',
    notifications: {
      email: true,
      push: false,
      marketing: true
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  
  useEffect(() => {
    if (profile) {
      const userPurchases = getPurchasesByUserId(profile.id);
      
      // Get file details for each purchase
      const purchasesWithFiles = userPurchases.map(purchase => {
        const file = getFileById(purchase.fileId);
        return { ...purchase, file: file! };
      });
      
      setPurchases(purchasesWithFiles);

      // Calculate user stats
      const totalSpent = purchasesWithFiles
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const accountCreated = new Date(profile.created_at);
      const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

      setUserStats({
        totalPurchases: purchasesWithFiles.length,
        totalSpent,
        totalDownloads: purchasesWithFiles.filter(p => p.status === 'approved').length,
        favoriteFiles: 3, // Mock data
        accountAge
      });

      // Update profile form with current data
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: '',
        website: '',
        company: '',
        notifications: {
          email: true,
          push: false,
          marketing: true
        }
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditingProfile(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.file.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || purchase.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.name}!</h2>
            <p className="text-blue-100">
              You've been a member for {userStats.accountAge} days
            </p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalPurchases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">${userStats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Downloads</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalDownloads}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Favorites</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.favoriteFiles}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchases</h3>
          <div className="space-y-4">
            {purchases.slice(0, 3).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={purchase.file.previewUrl} 
                    alt={purchase.file.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{purchase.file.title}</p>
                    <p className="text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  purchase.status === 'approved' ? 'bg-green-100 text-green-800' :
                  purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {purchase.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" fullWidth onClick={() => setActiveTab('purchases')}>
              View All Purchases
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setActiveTab('downloads')} className="flex flex-col items-center p-4 h-auto">
              <Download size={24} className="mb-2" />
              <span className="text-sm">Downloads</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('invoices')} className="flex flex-col items-center p-4 h-auto">
              <Receipt size={24} className="mb-2" />
              <span className="text-sm">Invoices</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('favorites')} className="flex flex-col items-center p-4 h-auto">
              <Heart size={24} className="mb-2" />
              <span className="text-sm">Favorites</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('profile')} className="flex flex-col items-center p-4 h-auto">
              <Settings size={24} className="mb-2" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">My Purchases</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>
      
      {filteredPurchases.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-12 w-12 rounded-lg object-cover" 
                          src={purchase.file.previewUrl} 
                          alt={purchase.file.title} 
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{purchase.file.title}</div>
                          <div className="text-sm text-gray-500">{purchase.file.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(purchase.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${purchase.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{purchase.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : purchase.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status === 'approved' && <CheckCircle size={12} className="mr-1" />}
                        {purchase.status === 'pending' && <Clock size={12} className="mr-1" />}
                        {purchase.status === 'declined' && <XCircle size={12} className="mr-1" />}
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye size={16} />
                        </Button>
                        {purchase.status === 'approved' && (
                          <Button variant="outline" size="sm">
                            <Download size={16} className="mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchases found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You haven\'t purchased any files yet. Start browsing our collection.'
            }
          </p>
          <Link to="/browse">
            <Button>Browse Files</Button>
          </Link>
        </div>
      )}
    </div>
  );

  const renderDownloads = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Downloads</h2>
      
      {purchases.filter(p => p.status === 'approved').length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases
            .filter(p => p.status === 'approved')
            .map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <img 
                  src={purchase.file.previewUrl} 
                  alt={purchase.file.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{purchase.file.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Downloaded on {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Download size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No downloads available</h3>
          <p className="text-gray-600 mb-6">
            You don't have any files available for download yet.
          </p>
          <Link to="/browse">
            <Button>Browse Files</Button>
          </Link>
        </div>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Invoices & Receipts</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Invoice History</h3>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Download All
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {purchases.filter(p => p.status === 'approved').map((purchase) => (
            <div key={purchase.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Invoice #{purchase.id.slice(0, 8).toUpperCase()}</h4>
                    <p className="text-sm text-gray-500">{purchase.file.title}</p>
                    <p className="text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${purchase.amount.toFixed(2)}</p>
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Favorite Files</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Heart size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No favorites yet</h3>
        <p className="text-gray-600 mb-6">
          Start adding files to your favorites to see them here.
        </p>
        <Link to="/browse">
          <Button>Browse Files</Button>
        </Link>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
        <Button 
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          variant={isEditingProfile ? "outline" : "primary"}
        >
          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={48} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{profile?.name}</h3>
            <p className="text-gray-500">{profile?.email}</p>
            <p className="text-sm text-gray-400 mt-2">
              Member since {new Date(profile?.created_at || '').toLocaleDateString()}
            </p>
            {isEditingProfile && (
              <Button variant="outline" size="sm" className="mt-4">
                Change Photo
              </Button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({...profileForm, company: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={profileUpdateLoading}
                  disabled={profileUpdateLoading}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive updates about your purchases and account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={profileForm.notifications.email}
                onChange={(e) => setProfileForm({
                  ...profileForm, 
                  notifications: {...profileForm.notifications, email: e.target.checked}
                })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Marketing Emails</h4>
              <p className="text-sm text-gray-500">Receive promotional offers and new file announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={profileForm.notifications.marketing}
                onChange={(e) => setProfileForm({
                  ...profileForm, 
                  notifications: {...profileForm.notifications, marketing: e.target.checked}
                })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-800">Password</h4>
                <p className="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail size={24} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-800">Email Verification</h4>
                <p className="text-sm text-green-600">✓ Verified</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>Verified</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'purchases': return renderPurchases();
      case 'downloads': return renderDownloads();
      case 'invoices': return renderInvoices();
      case 'favorites': return renderFavorites();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">You are not logged in</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'purchases', label: 'My Purchases', icon: ShoppingBag, badge: purchases.filter(p => p.status === 'pending').length },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile Settings', icon: Settings },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-800">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon size={20} className="mr-3" />
                      {item.label}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;