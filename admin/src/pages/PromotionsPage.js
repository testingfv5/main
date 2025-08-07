import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  PlusIcon,
  MegaphoneIcon,
  CalendarIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Calendar from 'react-calendar';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, calendar
  
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    type: 'Promoción Especial',
    description: '',
    features: [''],
    start_date: new Date(),
    end_date: new Date(),
    image_url: ''
  });

  const promotionTypes = [
    'Promoción Especial',
    'Oferta Diaria',
    'Descuento Temporada',
    'Liquidación',
    'Nueva Colección'
  ];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Error cargando promociones');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      discount: '',
      type: 'Promoción Especial',
      description: '',
      features: [''],
      start_date: new Date(),
      end_date: new Date(),
      image_url: ''
    });
    setEditingPromotion(null);
  };

  const openModal = (promotion = null) => {
    if (promotion) {
      setFormData({
        ...promotion,
        start_date: parseISO(promotion.start_date),
        end_date: parseISO(promotion.end_date),
        features: promotion.features.length > 0 ? promotion.features : ['']
      });
      setEditingPromotion(promotion);
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString()
      };

      if (editingPromotion) {
        await axios.put(`/api/admin/promotions/${editingPromotion.id}`, submitData);
        toast.success('Promoción actualizada exitosamente');
      } else {
        await axios.post('/api/admin/promotions', submitData);
        toast.success('Promoción creada exitosamente');
      }
      
      await fetchPromotions();
      closeModal();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Error guardando promoción');
    }
  };

  const handleDelete = async (promotionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/promotions/${promotionId}`);
      toast.success('Promoción eliminada exitosamente');
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error eliminando promoción');
    }
  };

  const toggleActive = async (promotionId, currentStatus) => {
    try {
      await axios.put(`/api/admin/promotions/${promotionId}`, {
        is_active: !currentStatus
      });
      toast.success(`Promoción ${!currentStatus ? 'activada' : 'desactivada'}`);
      await fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast.error('Error cambiando estado de promoción');
    }
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ 
      ...formData, 
      features: [...formData.features, ''] 
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // Image upload with dropzone
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'promotions');
    formData.append('optimize', 'true');

    try {
      const response = await axios.post('/api/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        image_url: response.data.url 
      }));
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error subiendo imagen');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const getStatusColor = (promotion) => {
    const now = new Date();
    const startDate = parseISO(promotion.start_date);
    const endDate = parseISO(promotion.end_date);
    
    if (!promotion.is_active) return 'bg-gray-100 text-gray-800';
    if (now < startDate) return 'bg-blue-100 text-blue-800';
    if (now > endDate) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (promotion) => {
    const now = new Date();
    const startDate = parseISO(promotion.start_date);
    const endDate = parseISO(promotion.end_date);
    
    if (!promotion.is_active) return 'Inactiva';
    if (now < startDate) return 'Programada';
    if (now > endDate) return 'Expirada';
    return 'Activa';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Promociones</h1>
            <p className="mt-1 text-sm text-gray-600">
              Crea y programa promociones que se activan automáticamente
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* View toggle */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                  viewMode === 'calendar'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Calendario
              </button>
            </div>
            
            <button
              onClick={() => openModal()}
              className="btn btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Promoción
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promoción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {promotion.image_url && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={promotion.image_url}
                            alt=""
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promotion.discount}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promotion.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {format(parseISO(promotion.start_date), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-gray-400">
                        al {format(parseISO(promotion.end_date), 'dd MMM yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion)}`}>
                        {getStatusText(promotion)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleActive(promotion.id, promotion.is_active)}
                        className={`text-sm ${promotion.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {promotion.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => openModal(promotion)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {promotions.length === 0 && (
              <div className="text-center py-12">
                <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin promociones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando tu primera promoción.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => openModal()}
                    className="btn btn-primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nueva Promoción
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          <div className="text-center text-gray-500 py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Vista de calendario</h3>
            <p className="mt-1 text-sm text-gray-500">
              Próximamente: Vista de calendario para promociones
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Título</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="label">Descuento</label>
                        <input
                          type="text"
                          required
                          className="input"
                          placeholder="ej: 50% OFF"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Tipo</label>
                      <select
                        className="input"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        {promotionTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Descripción</label>
                      <textarea
                        rows={3}
                        className="input"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <label className="label">Características</label>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              className="input flex-1"
                              placeholder="Característica de la promoción"
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="btn btn-danger px-3"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="btn btn-secondary text-sm"
                        >
                          + Agregar característica
                        </button>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="label">Imagen</label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {formData.image_url ? (
                          <div>
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="mx-auto h-24 w-24 object-cover rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-600">
                              Arrastra una nueva imagen o haz clic para cambiar
                            </p>
                          </div>
                        ) : (
                          <div>
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              {isDragActive
                                ? 'Suelta la imagen aquí...'
                                : 'Arrastra una imagen o haz clic para seleccionar'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Fecha de inicio</label>
                        <input
                          type="datetime-local"
                          required
                          className="input"
                          value={formData.start_date.toISOString().slice(0, 16)}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            start_date: new Date(e.target.value) 
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="label">Fecha de fin</label>
                        <input
                          type="datetime-local"
                          required
                          className="input"
                          value={formData.end_date.toISOString().slice(0, 16)}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            end_date: new Date(e.target.value) 
                          })}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PromotionsPage;