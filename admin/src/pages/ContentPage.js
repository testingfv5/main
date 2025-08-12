import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  DocumentTextIcon,
  HomeIcon,
  InformationCircleIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentPage = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [changes, setChanges] = useState({});

  const sectionTabs = [
    {
      name: 'Header',
      key: 'header',
      icon: HomeIcon,
      description: 'Información de cabecera del sitio'
    },
    {
      name: 'Info',
      key: 'info', 
      icon: InformationCircleIcon,
      description: 'Sección de información y servicios'
    },
    {
      name: 'Footer',
      key: 'footer',
      icon: DocumentTextIcon,
      description: 'Pie de página y enlaces'
    },
    {
      name: 'General',
      key: 'general',
      icon: CogIcon,
      description: 'Configuración general del sitio'
    }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

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

      // Send updates for each section
      for (const [section, updates] of Object.entries(updatesBySection)) {
        await axios.put(`/api/admin/content/sections/${section}`, updates);
      }

      // Refresh content
      await fetchContent();
      
      // Clear changes
      setChanges({});
      setHasChanges(false);
      
      toast.success('Contenido guardado exitosamente');
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
      await axios.post('/api/admin/content/initialize');
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

  const renderField = (section, key, config) => {
    const value = getValue(section, key);
    
    switch (config.type) {
      case 'string':
        return renderStringField(section, key, value, config);
      case 'array':
        return renderArrayField(section, key, value, config);
      case 'object':
        return renderObjectField(section, key, value, config);
      default:
        return null;
    }
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
            <h1 className="text-3xl font-bold text-white">Contenido</h1>
            <p className="mt-2 text-sm text-gray-400">
              Gestiona el contenido de tu sitio web
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

      {/* Content Tabs */}
      <div className="card">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1">
            {sectionTabs.map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                   ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                   ${selected
                     ? 'bg-blue-600 text-white shadow'
                     : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                   }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-6">
            {sectionTabs.map((tab) => (
              <Tab.Panel
                key={tab.key}
                className="space-y-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white">{tab.name}</h3>
                  <p className="text-sm text-gray-400">{tab.description}</p>
                </div>
                
                {sections[tab.key] ? (
                  <div className="space-y-6">
                    {Object.entries(sections[tab.key]).map(([key, config]) => 
                      renderField(tab.key, key, config)
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-300">
                      No hay configuración disponible
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Inicializa el contenido para comenzar
                    </p>
                  </div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default ContentPage;