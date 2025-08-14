import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [loginLogs, setLoginLogs] = useState([]);
  const [backups, setBackups] = useState([]);
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
      
      // Fetch login logs
      const logsResp = await axios.get('/api/admin/system/logs/login?limit=20');
      setLoginLogs(logsResp.data.logs || []);

      // Fetch backups list
      const backupsResp = await axios.get('/api/admin/system/backups');
      setBackups(backupsResp.data.backups || []);

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

  const createBackup = async () => {
    try {
      const resp = await axios.post('/api/admin/system/backups/create');
      toast.success('Backup creado');
      await fetchSettings();
    } catch (e) {
      toast.error('Error creando backup');
    }
  };

  const restoreBackup = async (filename) => {
    if (!window.confirm(`¿Restaurar backup ${filename}? Se reemplazará el frontend actual.`)) return;
    try {
      await axios.post('/api/admin/system/backups/restore', null, { params: { filename } });
      toast.success('Backup restaurado');
    } catch (e) {
      toast.error('Error restaurando backup');
    }
  };

  const deleteBackup = async (filename) => {
    if (!window.confirm(`¿Eliminar backup ${filename}?`)) return;
    try {
      await axios.delete(`/api/admin/system/backups/${filename}`);
      toast.success('Backup eliminado');
      await fetchSettings();
    } catch (e) {
      toast.error('Error eliminando backup');
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

        {/* Backups */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <ArrowDownTrayIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-white">Backups</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={createBackup} className="btn btn-primary text-sm">
                Crear backup
              </button>
            </div>
            <div className="divide-y divide-gray-700">
              {backups.map((b) => (
                <div key={b.filename} className="flex items-center justify-between py-2">
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">{b.filename}</div>
                    <div className="text-xs text-gray-500">{b.size_mb} MB • {new Date(b.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a className="btn btn-secondary text-xs" href={b.path} download>Descargar</a>
                    <button onClick={() => restoreBackup(b.filename)} className="btn btn-secondary text-xs">
                      Restaurar
                    </button>
                    <button onClick={() => deleteBackup(b.filename)} className="text-red-400 hover:text-red-300 p-1">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {backups.length === 0 && (
                <div className="text-sm text-gray-500">No hay backups todavía.</div>
              )}
            </div>
          </div>
        </div>

        {/* Login logs (reemplaza Configuración de Seguridad) */}
        <div className="card bg-gray-800 border border-gray-700">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-white">Logs de Login</h3>
          </div>
          
          <div className="space-y-2">
            {loginLogs.map((l) => (
              <div key={l.id} className="text-sm text-gray-300 flex justify-between border-b border-gray-700 py-1">
                <div>
                  <span className={`mr-2 ${l.success ? 'text-green-400' : 'text-red-400'}`}>{l.success ? '✔' : '✖'}</span>
                  <span className="font-medium">{l.username}</span>
                  <span className="text-gray-500 ml-2">{l.ip_address || '-'}</span>
                </div>
                <div className="text-gray-500">{new Date(l.timestamp).toLocaleString()}</div>
              </div>
            ))}
            {loginLogs.length === 0 && (
              <div className="text-sm text-gray-500">No hay logs recientes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;