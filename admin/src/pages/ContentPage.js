import React, { useState, useEffect, useRef } from 'react';
import { ExclamationTriangleIcon, ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentPage = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [changes, setChanges] = useState({});
  const [previewUrl] = useState(process.env.REACT_APP_FRONTEND_URL || window.location.origin.replace('3001','3000'));
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const previewContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [reloadToken, setReloadToken] = useState(0);

  const DESKTOP_BASE_WIDTH = 1920;
  const DESKTOP_BASE_HEIGHT = 1080;
  const MOBILE_BASE_WIDTH = 412;
  const MOBILE_BASE_HEIGHT = 915;

  // Editamos solo texto por secciones visibles del sitio (sin el bloque de colores/general)
  const sectionOrder = ['header','info','footer'];

  useEffect(() => {
    fetchContent();
  }, []);

  // Mantenemos la preview con scroll interno; no enviamos mensajes al iframe

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/content/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Error cargando contenido');
    } finally {
      setLoading(false);
    }
  };

  // Quitamos el escalado y el ajuste automático de altura

  const handleInputChange = (section, key, value) => {
    const changeKey = `${section}.${key}`;
    setChanges(prev => ({
      ...prev,
      [changeKey]: { section, key, value }
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (section, key, index, value) => {
    const currentArray = sections[section]?.[key]?.value || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleInputChange(section, key, newArray);
  };

  const addArrayItem = (section, key, defaultItem) => {
    const currentArray = sections[section]?.[key]?.value || [];
    const newArray = [...currentArray, defaultItem];
    handleInputChange(section, key, newArray);
  };

  const removeArrayItem = (section, key, index) => {
    const currentArray = sections[section]?.[key]?.value || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(section, key, newArray);
  };

  const saveChanges = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      // Group changes by section
      const updatesBySection = {};
      Object.values(changes).forEach(({ section, key, value }) => {
        if (!updatesBySection[section]) {
          updatesBySection[section] = {};
        }
        updatesBySection[section][key] = value;
      });

      // Send a single bulk update request
      await axios.put('/api/admin/content/bulk-update', updatesBySection);

      // Refresh content
      await fetchContent();
      
      // Clear changes
      setChanges({});
      setHasChanges(false);
      
      toast.success('Contenido guardado exitosamente');
      // Forzar recarga de la vista previa para evitar caché
      setReloadToken(Date.now());
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error guardando contenido');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setChanges({});
    setHasChanges(false);
    toast.success('Cambios descartados');
  };

  const initializeDefaults = async () => {
    try {
      await axios.post('/api/admin/content/initialize-defaults');
      await fetchContent();
      toast.success('Contenido inicializado con valores por defecto');
    } catch (error) {
      console.error('Error initializing content:', error);
      toast.error('Error inicializando contenido');
    }
  };

  const getValue = (section, key) => {
    const changeKey = `${section}.${key}`;
    if (changes[changeKey]) {
      return changes[changeKey].value;
    }
    return sections[section]?.[key]?.value || '';
  };

  // Helpers para mostrar SIEMPRE texto editable simple
  const valueToText = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      if (typeof value[0] === 'string') return value.join('\n');
      if (typeof value[0] === 'object' && value[0]) {
        // Caso típico: [{title, description}]
        return value
          .map((it) => [it.title, it.description].filter(Boolean).join(' : '))
          .join('\n');
      }
    }
    if (typeof value === 'object') {
      // Representación simple clave: valor por línea
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }
    return String(value);
  };

  const textToValue = (text, original) => {
    if (typeof original === 'string') return text;
    if (Array.isArray(original)) {
      if (original.length === 0 || typeof original[0] === 'string') {
        return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      }
      if (typeof original[0] === 'object' && original[0]) {
        // Parse "titulo : descripcion"
        return text
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .map((line) => {
            const [title, ...rest] = line.split(':');
            return { title: (title || '').trim(), description: rest.join(':').trim() };
          });
      }
    }
    if (typeof original === 'object' && original) {
      const next = { ...original };
      text.split('\n').forEach((line) => {
        const [k, ...rest] = line.split(':');
        if (k) next[k.trim()] = rest.join(':').trim();
      });
      return next;
    }
    return text;
  };

  const renderField = (section, key, config) => {
    const original = sections[section]?.[key]?.value;
    const currentValue = getValue(section, key);
    const text = valueToText(currentValue);
    const label = config.label || `${section}.${key}`;
    const description = config.description;

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">{label}</label>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
        <textarea
          value={text}
          onChange={(e) => handleInputChange(section, key, textToValue(e.target.value, original))}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  const renderStringField = (section, key, value, config) => (
    <div key={key} className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {config.label}
        {config.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {config.description && (
        <p className="text-xs text-gray-400">{config.description}</p>
      )}
      {config.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
          rows={config.rows || 3}
          className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={config.placeholder}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={config.placeholder}
        />
      )}
    </div>
  );

  const renderArrayField = (section, key, value, config) => (
    <div key={key} className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-200">
          {config.label}
          {config.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => addArrayItem(section, key, config.defaultItem || '')}
          className="inline-flex items-center px-3 py-1 border border-gray-600 rounded-md text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar
        </button>
      </div>
      {config.description && (
        <p className="text-xs text-gray-400">{config.description}</p>
      )}
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(section, key, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={config.placeholder}
            />
            <button
              type="button"
              onClick={() => removeArrayItem(section, key, index)}
              className="inline-flex items-center px-2 py-2 border border-red-600 rounded-md text-xs font-medium text-red-400 bg-gray-700 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderObjectField = (section, key, value, config) => (
    <div key={key} className="space-y-3">
      <label className="block text-sm font-medium text-gray-200">
        {config.label}
        {config.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {config.description && (
        <p className="text-xs text-gray-400">{config.description}</p>
      )}
      <div className="border border-gray-600 rounded-md p-4 bg-gray-700">
        {Object.entries(config.fields).map(([fieldKey, fieldConfig]) => (
          <div key={fieldKey} className="mb-3 last:mb-0">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {fieldConfig.label}
            </label>
            <input
              type="text"
              value={value?.[fieldKey] || ''}
              onChange={(e) => {
                const newValue = { ...value, [fieldKey]: e.target.value };
                handleInputChange(section, key, newValue);
              }}
              className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={fieldConfig.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Editar Contenido</h1>
            <p className="mt-2 text-sm text-gray-400">
              Editá todo el contenido del sitio con vista previa en vivo
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={initializeDefaults}
              className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Inicializar
            </button>
            {hasChanges && (
              <>
                <button
                  onClick={discardChanges}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Descartar
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" /> : 'Guardar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unified editor with live preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="card">
          {sectionOrder.every((s) => !sections[s]) ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No hay configuración disponible</h3>
              <p className="mt-1 text-sm text-gray-500">Inicializa el contenido para comenzar</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sectionOrder.map((sectionKey) => (
                sections[sectionKey] && (
                  <div key={sectionKey} className="space-y-6">
                    <h3 className="text-lg font-semibold text-white capitalize">{sectionKey}</h3>
                    {Object.entries(sections[sectionKey]).map(([key, config]) => (
                      <div key={`${sectionKey}.${key}`}>
                        {renderField(sectionKey, key, config)}
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}
        </div>

         {/* Live Preview con selector de modo */}
         <div className="card p-0 bg-gray-800 border border-gray-700">
           <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900">
             <div className="text-sm text-gray-300">Vista previa</div>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => setViewMode('desktop')}
                 className={`px-2 py-1 rounded text-xs border ${viewMode==='desktop' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-600'}`}
               >
                 <ComputerDesktopIcon className="h-4 w-4 inline mr-1" /> Desktop
               </button>
               <button
                 onClick={() => setViewMode('mobile')}
                 className={`px-2 py-1 rounded text-xs border ${viewMode==='mobile' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-600'}`}
               >
                 <DevicePhoneMobileIcon className="h-4 w-4 inline mr-1" /> Mobile
               </button>
               <button onClick={() => window.open(previewUrl, '_blank')} className="btn btn-secondary text-xs">Abrir en pestaña</button>
             </div>
          </div>
           {(() => {
             const width = viewMode === 'mobile' ? MOBILE_BASE_WIDTH : DESKTOP_BASE_WIDTH;
             const height = viewMode === 'mobile' ? MOBILE_BASE_HEIGHT : DESKTOP_BASE_HEIGHT;
             return (
               <div
                 ref={previewContainerRef}
                 className={`w-full flex ${viewMode === 'mobile' ? 'justify-center' : 'justify-start'}`}
               >
                 <div
                   className={`bg-gray-950 border border-gray-700 ${viewMode === 'mobile' ? 'rounded-xl shadow-xl' : ''}`}
                   style={{ width: `${width}px`, height: `${height}px`, overflow: 'auto' }}
                 >
                   <iframe
                     title="Vista Previa"
                     src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}_=${reloadToken}`}
                     ref={iframeRef}
                     width={width}
                     height={height}
                     className="border-0 bg-black"
                     onLoad={() => {
                       try { iframeRef.current?.contentWindow?.scrollTo(0, 0); } catch {}
                     }}
                   />
                 </div>
               </div>
             );
           })()}
        </div>
      </div>
    </div>
  );
};

export default ContentPage;