import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  TagIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    activePromotions: 0,
    totalPromotions: 0,
    activeBrands: 0,
    contentSections: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [promotionsRes, brandsRes, contentRes, storageRes] = await Promise.all([
        axios.get('/api/public/promotions/active'),
        axios.get('/api/public/brands/active'),
        axios.get('/api/admin/content/sections'),
        axios.get('/api/admin/upload/storage/stats')
      ]);

      setStats({
        activePromotions: promotionsRes.data.length,
        totalPromotions: promotionsRes.data.length, // Will be updated with total endpoint
        activeBrands: brandsRes.data.length,
        contentSections: Object.keys(contentRes.data).length,
        storageStats: storageRes.data,
        recentActivity: [] // Will add later
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Promociones Activas',
      value: stats.activePromotions,
      icon: MegaphoneIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
    },
    {
      name: 'Total Promociones',
      value: stats.totalPromotions,
      icon: ChartBarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
    },
    {
      name: 'Marcas Activas',
      value: stats.activeBrands,
      icon: TagIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
    },
    {
      name: 'Secciones de Contenido',
      value: stats.contentSections,
      icon: DocumentTextIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">
          Vista general del estado de tu sitio web
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3 border border-gray-600`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-white">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <a
              href="/content"
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-200">
                Editar Contenido
              </span>
            </a>
            <a
              href="/promotions"
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MegaphoneIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-200">
                Gestionar Promociones
              </span>
            </a>
            <a
              href="/brands"
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <TagIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-200">
                Administrar Marcas
              </span>
            </a>
            <a
              href="/preview"
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-200">
                Vista Previa
              </span>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-white mb-4">
            Estado del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Base de Datos</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-700">
                Conectada
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Programador de Promociones</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-700">
                Activo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Almacenamiento</span>
              <span className="text-sm text-gray-200">
                {stats.storageStats?.total_size_mb || 0} MB usados
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Archivos Subidos</span>
              <span className="text-sm text-gray-200">
                {stats.storageStats?.total_files || 0} archivos
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">
            Actividad Reciente
          </h3>
          <div className="flow-root">
            <div className="text-center py-6 text-gray-400">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                Sin actividad reciente
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Las acciones administrativas aparecerán aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;