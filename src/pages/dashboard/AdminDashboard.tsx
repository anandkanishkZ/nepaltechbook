import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3,
  FileText,
  FolderOpen,
  ShoppingBag,
  Receipt,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { 
  getFiles, 
  getCategories, 
  getPurchases, 
  createFile, 
  updateFile, 
  deleteFile, 
  updatePurchaseStatus,
  getProfile,
  updateProfile
} from '../../data/supabaseService';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import FileModal from '../../components/admin/FileModal';
import CategoryModal from '../../components/admin/CategoryModal';
import UserModal from '../../components/admin/UserModal';
import { Database } from '../../types/database';

type FileWithCategory = Database['public']['Tables']['files']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

type PurchaseWithDetails = Database['public']['Tables']['purchases']['Row'] & {
  files: Database['public']['Tables']['files']['Row'] | null;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

const AdminDashboard: React.FC = () => {
  const { profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [files, setFiles] = useState<FileWithCategory[]>([]);
  const [categories, setCategories] = useState<Database['public']['Tables']['categories']['Row'][]>([]);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [users, setUsers] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileWithCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Database['public']['Tables']['categories']['Row'] | null>(null);
  const [editingUser, setEditingUser] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filesResult, categoriesResult, purchasesResult] = await Promise.all([
        getFiles(),
        getCategories(),
        getPurchases()
      ]);

      if (filesResult.data) setFiles(filesResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (purchasesResult.data) setPurchases(purchasesResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Analytics calculations
  const totalRevenue = purchases
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const pendingApprovals = purchases.filter(p => p.status === 'pending').length;
  const totalDownloads = purchases.filter(p => p.status === 'approved').length;
  const conversionRate = purchases.length > 0 ? (purchases.filter(p => p.status === 'approved').length / purchases.length) * 100 : 0;

  // File operations
  const handleCreateFile = () => {
    setEditingFile(null);
    setIsFileModalOpen(true);
  };

  const handleEditFile = (file: FileWithCategory) => {
    setEditingFile(file);
    setIsFileModalOpen(true);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { error } = await deleteFile(fileId);
      if (error) {
        alert('Error deleting file: ' + error.message);
      } else {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleFileSubmit = async (fileData: any) => {
    try {
      if (editingFile) {
        const { data, error } = await updateFile(editingFile.id, fileData);
        if (error) {
          alert('Error updating file: ' + error.message);
          return;
        }
        if (data) {
          setFiles(files.map(f => f.id === editingFile.id ? { ...data, categories: f.categories } : f));
        }
      } else {
        const { data, error } = await createFile(fileData);
        if (error) {
          alert('Error creating file: ' + error.message);
          return;
        }
        if (data) {
          const category = categories.find(c => c.id === data.category_id);
          setFiles([{ ...data, categories: category || null }, ...files]);
        }
      }
      setIsFileModalOpen(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file');
    }
  };

  // Purchase operations
  const handleApprove = async (purchaseId: string) => {
    try {
      const { error } = await updatePurchaseStatus(purchaseId, 'approved');
      if (error) {
        alert('Error approving purchase: ' + error.message);
      } else {
        setPurchases(purchases.map(p => 
          p.id === purchaseId ? { ...p, status: 'approved' } : p
        ));
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Error approving purchase');
    }
  };

  const handleDecline = async (purchaseId: string) => {
    try {
      const { error } = await updatePurchaseStatus(purchaseId, 'declined');
      if (error) {
        alert('Error declining purchase: ' + error.message);
      } else {
        setPurchases(purchases.map(p => 
          p.id === purchaseId ? { ...p, status: 'declined' } : p
        ));
      }
    } catch (error) {
      console.error('Error declining purchase:', error);
      alert('Error declining purchase');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">+12% from last month</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Files</p>
              <p className="text-2xl font-bold">{files.length}</p>
              <p className="text-green-100 text-xs mt-1">+{files.filter(f => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(f.created_at) > weekAgo;
              }).length} this week</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Downloads</p>
              <p className="text-2xl font-bold">{totalDownloads}</p>
              <p className="text-purple-100 text-xs mt-1">{conversionRate.toFixed(1)}% conversion rate</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <Download size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingApprovals}</p>
              <p className="text-amber-100 text-xs mt-1">Requires attention</p>
            </div>
            <div className="bg-amber-400 bg-opacity-30 rounded-lg p-3">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchases</h3>
          <div className="space-y-4">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{purchase.files?.title}</p>
                    <p className="text-sm text-gray-500">{purchase.profiles?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${purchase.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    purchase.status === 'approved' ? 'bg-green-100 text-green-800' :
                    purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Files</h3>
          <div className="space-y-4">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={file.preview_url} 
                    alt={file.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{file.title}</p>
                    <p className="text-sm text-gray-500">{file.categories?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {file.is_free ? 'Free' : `$${file.price}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {purchases.filter(p => p.file_id === file.id && p.status === 'approved').length} downloads
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">File Management</h2>
        <Button onClick={handleCreateFile} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Add New File
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Files</option>
              <option value="free">Free Files</option>
              <option value="paid">Paid Files</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files
                .filter(file => {
                  const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = filterStatus === 'all' || 
                    (filterStatus === 'free' && file.is_free) ||
                    (filterStatus === 'paid' && !file.is_free);
                  return matchesSearch && matchesFilter;
                })
                .map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-lg object-cover" src={file.preview_url} alt={file.title} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{file.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{file.description.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {file.categories?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {file.is_free ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        `$${file.price}`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {purchases.filter(p => p.file_id === file.id && p.status === 'approved').length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditFile(file)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <Button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen size={24} className="text-blue-600" />
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingCategory(category);
                  setIsCategoryModalOpen(true);
                }}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Slug: {category.slug}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {files.filter(f => f.category_id === category.id).length} files
              </span>
              <span className="text-xs text-gray-400">
                Created {new Date(category.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Purchase Management</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {pendingApprovals} pending approvals
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{purchase.profiles?.name}</div>
                        <div className="text-sm text-gray-500">{purchase.profiles?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{purchase.files?.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${purchase.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{purchase.payment_method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      purchase.status === 'approved' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {purchase.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost\" size="sm\" onClick={() => handleApprove(purchase.id)}>
                          <Check size={16} className="text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDecline(purchase.id)}>
                          <X size={16} className="text-red-600" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Invoice Management</h2>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" />
          Generate Invoice
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Invoice System</h3>
          <p className="text-gray-500 mb-6">
            Automated invoice generation for approved purchases. Invoices are sent via email.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{purchases.filter(p => p.status === 'approved').length}</div>
              <div className="text-sm text-gray-500">Invoices Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Invoiced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pendingApprovals}</div>
              <div className="text-sm text-gray-500">Pending Invoices</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <Button onClick={() => setIsUserModalOpen(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">User Management System</h3>
          <p className="text-gray-500 mb-6">
            Manage user accounts, permissions, and access levels.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-gray-500">Admin Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                defaultValue="FileMarket"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea
                defaultValue="Premium digital file marketplace"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                defaultValue="admin@filemarket.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Enable eSewa</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Enable Khalti</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Enable IME Pay</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Auto-approve payments</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input
                type="number"
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Send welcome emails</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Require email verification</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session timeout (minutes)</label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'files': return renderFiles();
      case 'categories': return renderCategories();
      case 'purchases': return renderPurchases();
      case 'invoices': return renderInvoices();
      case 'users': return renderUsers();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-yellow-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
        </div>
      </MainLayout>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag, badge: pendingApprovals },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-sm text-gray-500">FileMarket</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
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
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleFileSubmit}
        categories={categories}
        file={editingFile}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingUser}
      />
    </div>
  );
};

export default AdminDashboard;