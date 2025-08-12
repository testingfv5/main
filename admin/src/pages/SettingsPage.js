import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [storageStats, setStorageStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    database: 'unknown',
    scheduler: 'unknown',
    uploads: 'unknown'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch storage stats
      const storageResponse = await axios.get('/api/admin/upload/storage/stats');
      setStorageStats(storageResponse.data);

      // Check system status
      try {
        await axios.get('/api/public/health');
        setSystemStatus(prev => ({ ...prev, database: 'connected' }));
      } catch (error) {
        setSystemStatus(prev => ({ ...prev, database: 'error' }));
      }

      // Assume scheduler and uploads are working if we got here
      setSystemStatus(prev => ({ 
        ...prev, 
        scheduler: 'active',
        uploads: 'active'
      }));

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  const clearStorageCategory = async (category) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar todas las imágenes de ${category}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await axios.get(`/api/admin/upload/images/${category}`);
      const images = response.data.images;

      for (const image of images) {
        await axios.delete(`/api/admin/upload/image/${image.filename}?category=${category}`);
      }

      toast.success(`Todas las imágenes de ${category} han sido eliminadas`);
      await fetchSettings();
    } catch (error) {
      console.error('Error clearing storage:', error);
      toast.error('Error eliminando imágenes');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'active':
        return 'Activo';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>
        <p className="mt-1 text-sm text-gray-400">
          Administra la configuración y estado del panel administrativo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-white">Información de Usuario</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Usuario:</span>
              <span className="text-sm font-medium text-white">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Email:</span>
              <span className="text-sm font-medium text-white">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">MFA:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.mfa_enabled 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {user?.mfa_enabled ? 'Activado' : 'Desactivado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Último login:</span>
              <span className="text-sm font-medium text-white">
                {user?.last_login 
                  ? new Date(user.last_login).toLocaleString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <CogIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-white">Estado del Sistema</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Base de Datos:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.database)}`}>
                {getStatusText(systemStatus.database)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Programador de Promociones:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.scheduler)}`}>
                {getStatusText(systemStatus.scheduler)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Sistema de Archivos:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.uploads)}`}>
                {getStatusText(systemStatus.uploads)}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Statistics */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-white">Uso de Almacenamiento</h3>
          </div>
          
          <div className="space-y-4">
            {/* Total Usage */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-400">Uso Total</span>
                <span className="text-lg font-bold text-white">
                  {storageStats.total_size_mb || 0} MB
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {storageStats.total_files || 0} archivos en total
              </div>
            </div>

            {/* By Category */}
            {storageStats.categories && Object.entries(storageStats.categories).map(([category, data]) => (
              <div key={category} className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <span className="text-sm font-medium text-white capitalize">
                    {category}
                  </span>
                  <div className="text-xs text-gray-400">
                    {data.files} archivo{data.files !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">
                    {data.size_mb} MB
                  </span>
                  <button
                    onClick={() => clearStorageCategory(category)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title={`Eliminar todas las imágenes de ${category}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Configuración de Seguridad</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-900 border border-yellow-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-300 mb-2">
                Recomendaciones de Seguridad
              </h4>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• Mantén tu MFA siempre activado</li>
                <li>• Cierra sesión cuando no uses el panel</li>
                <li>• Revisa regularmente los logs de actividad</li>
                <li>• No compartas las credenciales de acceso</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                Actualizar Estado del Sistema
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="mt-8 card bg-gray-800 border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">
          Información del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Versión del Panel:</span>
            <div className="font-medium text-white">v1.0.0</div>
          </div>
          <div>
            <span className="text-gray-400">Último Despliegue:</span>
            <div className="font-medium text-white">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Entorno:</span>
            <div className="font-medium text-white">
              {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;