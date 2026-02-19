import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Moon,
  Sun,
  TrendingUp,
  Search,
  Filter,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

import StatCard from '../components/StatCard';
import EditPackModal from '../components/EditPackModal';
import DeliverOrderModal from '../components/DeliverOrderModal';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [packs, setPacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [editingPack, setEditingPack] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deliveringOrder, setDeliveringOrder] = useState(null);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [packsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/packs`),
        axios.get(`${API}/admin/orders`)
      ]);
      
      setPacks(packsRes.data);
      setOrders(ordersRes.data);
      
      // Calculate stats
      const pending = ordersRes.data.filter(o => o.status === 'pending').length;
      const delivered = ordersRes.data.filter(o => o.status === 'delivered').length;
      const cancelled = ordersRes.data.filter(o => o.status === 'cancelled').length;
      const revenue = ordersRes.data
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.amount, 0);
      
      setStats({
        totalOrders: ordersRes.data.length,
        pendingOrders: pending,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Déconnexion réussie');
    navigate('/admin');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}`, {
        status: newStatus
      });
      
      toast.success('Statut mis à jour avec succès');
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeliverOrder = async (orderId, deliveryInfo) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/deliver`, {
        delivery_info: deliveryInfo
      });
      
      toast.success('Commande livrée avec succès !');
      setIsDeliverModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error delivering order:', error);
      toast.error('Erreur lors de la livraison');
      throw error;
    }
  };

  const openDeliverModal = (order) => {
    setDeliveringOrder(order);
    setIsDeliverModalOpen(true);
  };

  const handleEditPack = (pack) => {
    setEditingPack(pack);
    setIsEditModalOpen(true);
  };

  const handleSavePack = async (updatedPack) => {
    try {
      await axios.put(`${API}/admin/packs/${updatedPack._id}`, {
        name: updatedPack.name,
        description: updatedPack.description,
        points_range: updatedPack.points_range,
        price: updatedPack.price
      });
      
      toast.success('Pack mis à jour avec succès');
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating pack:', error);
      toast.error('Erreur lors de la mise à jour du pack');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'delivered') {
      return (
        <Badge className="bg-success text-success-foreground">
          <CheckCircle className="w-3 h-3 mr-1" />
          Livrée
        </Badge>
      );
    }
    if (status === 'cancelled') {
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          <X className="w-3 h-3 mr-1" />
          Annulée
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning text-warning-foreground">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </Badge>
    );
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pack_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold">
                Mc<span className="text-primary">Hess</span> <span className="text-muted-foreground text-sm">Admin</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-2">
              <Package className="w-4 h-4" />
              Packs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tableau de bord</h2>
              <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Commandes"
                value={stats.totalOrders}
                icon={ShoppingBag}
              />

              <StatCard
                title="En attente"
                value={stats.pendingOrders}
                icon={Clock}
                change={`${stats.pendingOrders} à traiter`}
                trend={stats.pendingOrders > 0 ? 'up' : 'neutral'}
              />

              <StatCard
                title="Livrées"
                value={stats.deliveredOrders}
                icon={CheckCircle}
                trend="up"
              />

              <StatCard
                title="Revenu Total"
                value={`${stats.totalRevenue.toFixed(2)}€`}
                icon={DollarSign}
                change={`${stats.deliveredOrders} commandes`}
                trend="up"
              />
            </div>

            {/* Recent Orders */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Dernières commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">{order.customer_email}</p>
                        <p className="text-sm text-muted-foreground">Pack: {order.pack_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold text-primary">{order.amount}€</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Commandes</h2>
                <p className="text-muted-foreground">Gérez toutes vos commandes</p>
              </div>
            </div>

            {/* Filters */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par email, pack ou ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="delivered">Livrées</SelectItem>
                        <SelectItem value="cancelled">Annulées</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {filteredOrders.length} commande(s) trouvée(s)
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">Commande #{order._id.slice(-8).toUpperCase()}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Client: {order.customer_email}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Pack: {order.pack_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <p className="text-2xl font-bold text-primary">{order.amount}€</p>
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                              className="bg-success text-success-foreground hover:bg-success/90"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Livrer
                            </Button>
                            <Button
                              onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Annuler
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Packs Tab */}
          <TabsContent value="packs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Packs</h2>
                <p className="text-muted-foreground">Gérez vos packs de points</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packs.map((pack) => (
                <Card key={pack._id} className="border-2 relative">
                  <CardHeader>
                    <CardTitle className="text-xl">{pack.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                      <p className="text-sm font-semibold">Points: {pack.points_range}</p>
                      <p className="text-2xl font-bold text-primary">{pack.price}€</p>
                    </div>
                    <Button
                      onClick={() => handleEditPack(pack)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <EditPackModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        pack={editingPack}
        onSave={handleSavePack}
      />
    </div>
  );
}