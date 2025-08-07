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

      // Send bulk update
      await axios.put('/api/admin/content/bulk-update', updatesBySection);
      
      // Refresh content
      await fetchContent();
      setChanges({});
      setHasChanges(false);
      
      toast.success('Contenido actualizado exitosamente');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error guardando cambios');
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
      toast.success('Contenido por defecto inicializado');
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast.error('Error inicializando contenido por defecto');
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
    const fieldType = typeof value;

    if (Array.isArray(value)) {
      return renderArrayField(section, key, value, config);
    }

    if (fieldType === 'object') {
      return renderObjectField(section, key, value, config);
    }

    return renderStringField(section, key, value, config);
  };

  const renderStringField = (section, key, value, config) => (
    <div key={key} className="mb-4">
      <label className="label">{key.replace(/_/g, ' ').toUpperCase()}</label>
      {config?.description && (
        <p className="text-sm text-gray-500 mb-1">{config.description}</p>
      )}
      {key.includes('description') || key.includes('text') ? (
        <textarea
          rows={3}
          className="input"
          value={value}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="input"
          value={value}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
        />
      )}
    </div>
  );

  const renderArrayField = (section, key, value, config) => (
    <div key={key} className="mb-6">
      <label className="label">{key.replace(/_/g, ' ').toUpperCase()}</label>
      {config?.description && (
        <p className="text-sm text-gray-500 mb-2">{config.description}</p>
      )}
      
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            {typeof item === 'string' ? (
              <input
                type="text"
                className="input flex-1"
                value={item}
                onChange={(e) => handleArrayChange(section, key, index, e.target.value)}
              />
            ) : (
              <div className="flex-1 space-y-2 p-3 border border-gray-200 rounded-md">
                {Object.entries(item).map(([itemKey, itemValue]) => (
                  <div key={itemKey}>
                    <label className="text-xs text-gray-500">{itemKey}</label>
                    <input
                      type="text"
                      className="input"
                      value={itemValue}
                      onChange={(e) => handleArrayChange(section, key, index, {
                        ...item,
                        [itemKey]: e.target.value
                      })}
                    />
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => removeArrayItem(section, key, index)}
              className="btn btn-danger px-3"
            >
              ×
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => {
            const defaultItem = typeof value[0] === 'string' 
              ? '' 
              : typeof value[0] === 'object' 
                ? Object.keys(value[0]).reduce((acc, k) => ({ ...acc, [k]: '' }), {})
                : '';
            addArrayItem(section, key, defaultItem);
          }}
          className="btn btn-secondary text-sm"
        >
          + Agregar elemento
        </button>
      </div>
    </div>
  );

  const renderObjectField = (section, key, value, config) => (
    <div key={key} className="mb-6">
      <label className="label">{key.replace(/_/g, ' ').toUpperCase()}</label>
      {config?.description && (
        <p className="text-sm text-gray-500 mb-2">{config.description}</p>
      )}
      
      <div className="space-y-3 p-4 border border-gray-200 rounded-md">
        {Object.entries(value).map(([objKey, objValue]) => (
          <div key={objKey}>
            <label className="text-sm text-gray-600">{objKey}</label>
            <input
              type="text"
              className="input"
              value={objValue}
              onChange={(e) => handleInputChange(section, key, {
                ...value,
                [objKey]: e.target.value
              })}
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
            <p className="mt-1 text-sm text-gray-600">
              Edita el contenido de todas las secciones de tu sitio web
            </p>
          </div>
          
          <div className="flex space-x-3">
            {Object.keys(sections).length === 0 && (
              <button
                onClick={initializeDefaults}
                className="btn btn-secondary"
              >
                Inicializar Contenido
              </button>
            )}
            
            {hasChanges && (
              <>
                <button
                  onClick={discardChanges}
                  className="btn btn-secondary"
                >
                  Descartar
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? <LoadingSpinner size="sm" /> : 'Guardar Cambios'}
                </button>
              </>
            )}
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-700">
              Tienes cambios sin guardar. No olvides guardar antes de salir.
            </span>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {sectionTabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ${
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {sectionTabs.map((tab) => (
            <Tab.Panel key={tab.key} className="card">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </h3>
                <p className="text-sm text-gray-500">{tab.description}</p>
              </div>

              <div className="space-y-4">
                {sections[tab.key] ? (
                  Object.entries(sections[tab.key]).map(([key, config]) =>
                    renderField(tab.key, key, config)
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Sin contenido para {tab.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Inicializa el contenido por defecto para comenzar.
                    </p>
                  </div>
                )}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ContentPage;