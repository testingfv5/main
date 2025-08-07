import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PreviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
  const [previewUrl, setPreviewUrl] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Get frontend URL from environment or construct it
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin.replace('3001', '3000');

  useEffect(() => {
    setPreviewUrl(frontendUrl);
  }, [frontendUrl]);

  const refreshPreview = () => {
    setLastUpdate(new Date());
    // Force iframe reload by changing src
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
    toast.success('Vista previa actualizada');
  };

  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const getIframeStyle = () => {
    if (viewMode === 'mobile') {
      return {
        width: '375px',
        height: '667px',
        maxHeight: '80vh'
      };
    }
    return {
      width: '100%',
      height: '600px'
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vista Previa en Tiempo Real</h1>
            <p className="mt-1 text-sm text-gray-600">
              Visualiza cómo se ve tu sitio web con los cambios aplicados
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border flex items-center space-x-1 ${
                  viewMode === 'desktop'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
              >
                <ComputerDesktopIcon className="h-4 w-4" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border flex items-center space-x-1 ${
                  viewMode === 'mobile'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={refreshPreview}
              className="btn btn-secondary"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            
            <button
              onClick={openInNewTab}
              className="btn btn-primary"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Abrir en Nueva Pestaña
            </button>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Vista Previa en Tiempo Real
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>• Los cambios en el contenido se reflejan automáticamente</p>
              <p>• Las promociones programadas se muestran según su estado actual</p>
              <p>• Última actualización: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="card p-0 overflow-hidden">
        <div className={`flex ${viewMode === 'mobile' ? 'justify-center' : ''} bg-gray-100 p-4`}>
          <div 
            className={`bg-white shadow-lg ${viewMode === 'mobile' ? 'rounded-lg' : 'w-full'}`}
            style={getIframeStyle()}
          >
            {loading && (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            )}
            
            <iframe
              id="preview-iframe"
              src={previewUrl}
              title="Vista Previa del Sitio Web"
              className={`w-full h-full border-0 ${viewMode === 'mobile' ? 'rounded-lg' : ''}`}
              style={getIframeStyle()}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                toast.error('Error cargando la vista previa');
              }}
            />
          </div>
        </div>

        {/* Mobile frame decoration */}
        {viewMode === 'mobile' && (
          <div className="text-center mt-4 pb-4">
            <div className="text-xs text-gray-500">
              Simulación iPhone (375x667px)
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Cómo Usar la Vista Previa
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></span>
              Realiza cambios en las secciones de Contenido, Promociones o Marcas
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></span>
              Los cambios se reflejan automáticamente en esta vista previa
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></span>
              Usa el botón "Actualizar" si no ves los cambios inmediatamente
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></span>
              Cambia entre vista desktop y mobile para probar responsividad
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Consejos de Optimización
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Las imágenes se optimizan automáticamente para carga rápida
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Los textos cortos funcionan mejor en dispositivos móviles
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Revisa el contraste de colores para mejor legibilidad
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Prueba todas las promociones antes de activarlas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;