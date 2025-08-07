import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  PlusIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    color: '#3b82f6',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Error cargando marcas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      color: '#3b82f6',
      is_active: true,
      order: 0
    });
    setEditingBrand(null);
  };

  const openModal = (brand = null) => {
    if (brand) {
      setFormData(brand);
      setEditingBrand(brand);
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
      if (editingBrand) {
        await axios.put(`/api/admin/brands/${editingBrand.id}`, formData);
        toast.success('Marca actualizada exitosamente');
      } else {
        await axios.post('/api/admin/brands', formData);
        toast.success('Marca creada exitosamente');
      }
      
      await fetchBrands();
      closeModal();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Error guardando marca');
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/brands/${brandId}`);
      toast.success('Marca eliminada exitosamente');
      await fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Error eliminando marca');
    }
  };

  const toggleActive = async (brandId, currentStatus) => {
    try {
      await axios.put(`/api/admin/brands/${brandId}`, {
        is_active: !currentStatus
      });
      toast.success(`Marca ${!currentStatus ? 'activada' : 'desactivada'}`);
      await fetchBrands();
    } catch (error) {
      console.error('Error toggling brand status:', error);
      toast.error('Error cambiando estado de marca');
    }
  };

  const updateOrder = async (brandId, newOrder) => {
    try {
      await axios.put(`/api/admin/brands/${brandId}`, { order: newOrder });
      await fetchBrands();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error actualizando orden');
    }
  };

  // Image upload with dropzone
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('category', 'brands');
    uploadData.append('optimize', 'true');

    try {
      const response = await axios.post('/api/admin/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        logo_url: response.data.url 
      }));
      toast.success('Logo subido exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error subiendo logo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Marcas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Administra las marcas que aparecen en tu sitio web
            </p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Marca
          </button>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brands.map((brand, index) => (
          <div key={brand.id} className="card relative">
            {/* Status indicator */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
              brand.is_active ? 'bg-green-400' : 'bg-gray-400'
            }`} />

            {/* Brand content */}
            <div className="text-center">
              {/* Logo */}
              <div className="mb-4">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-16 w-16 mx-auto object-contain rounded-lg"
                    style={{ backgroundColor: brand.color + '20' }}
                  />
                ) : (
                  <div 
                    className="h-16 w-16 mx-auto rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: brand.color + '20' }}
                  >
                    <TagIcon className="h-8 w-8" style={{ color: brand.color }} />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {brand.name}
              </h3>

              {/* Color */}
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-gray-200 mr-2"
                  style={{ backgroundColor: brand.color }}
                />
                <span className="text-sm text-gray-500 font-mono">
                  {brand.color}
                </span>
              </div>

              {/* Order controls */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                  onClick={() => updateOrder(brand.id, Math.max(0, brand.order - 1))}
                  disabled={index === 0}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ↑
                </button>
                <span className="text-xs text-gray-400">
                  Orden: {brand.order}
                </span>
                <button
                  onClick={() => updateOrder(brand.id, brand.order + 1)}
                  disabled={index === brands.length - 1}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ↓
                </button>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => toggleActive(brand.id, brand.is_active)}
                  className={`text-sm px-3 py-1 rounded ${
                    brand.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {brand.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => openModal(brand)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin marcas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza agregando tu primera marca.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openModal()}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Marca
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="label">Nombre de la marca</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="label">Logo</label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {formData.logo_url ? (
                          <div>
                            <img
                              src={formData.logo_url}
                              alt="Preview"
                              className="mx-auto h-16 w-16 object-contain rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-600">
                              Arrastra un nuevo logo o haz clic para cambiar
                            </p>
                          </div>
                        ) : (
                          <div>
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              {isDragActive
                                ? 'Suelta el logo aquí...'
                                : 'Arrastra un logo o haz clic para seleccionar'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="label">Color de la marca</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          className="h-10 w-16 rounded border border-gray-300"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                        <input
                          type="text"
                          className="input flex-1 font-mono"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Order */}
                    <div>
                      <label className="label">Orden (menor número = mayor prioridad)</label>
                      <input
                        type="number"
                        min="0"
                        className="input"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Marca activa (visible en el sitio web)
                      </label>
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
                        {editingBrand ? 'Actualizar' : 'Crear'} Marca
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

export default BrandsPage;