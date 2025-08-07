import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, setupMFA, verifyMFASetup, verifyMFA, isAuthenticated, loading } = useAuth();
  
  const [step, setStep] = useState('login'); // login, mfa_setup, mfa_verify
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // MFA setup state
  const [mfaSetup, setMfaSetup] = useState({
    secret: '',
    qr_code: '',
    manual_entry_key: ''
  });
  
  // MFA verification state
  const [mfaCode, setMfaCode] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(loginData);
      setUsername(loginData.username);

      if (result.step === 'success') {
        // Login successful, user will be redirected automatically
        // AuthContext already handled token storage and user state
        return;
      } else if (result.step === 'mfa_setup') {
        setStep('mfa_setup');
        // Get MFA setup data
        const setupData = await setupMFA(loginData.username);
        setMfaSetup(setupData);
        toast.success('Configure su autenticador para continuar');
      } else if (result.step === 'mfa_verify') {
        setStep('mfa_verify');
        toast.success('Ingrese su código de verificación');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASetup = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      toast.error('Ingrese un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      await verifyMFASetup(username, mfaSetup.secret, mfaCode);
      // User will be redirected automatically via AuthContext
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerify = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      toast.error('Ingrese un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      await verifyMFA(username, mfaCode);
      // User will be redirected automatically via AuthContext
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setStep('login');
    setLoginData({ username: '', password: '' });
    setMfaCode('');
    setUsername('');
    setMfaSetup({ secret: '', qr_code: '', manual_entry_key: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Panel Administrativo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Óptica Villalba - Acceso Seguro
          </p>
        </div>

        {/* Login Form */}
        {step === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Usuario</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                  placeholder="Usuario"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="relative block w-full rounded-b-md border-0 py-3 px-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                  placeholder="Contraseña"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        )}

        {/* MFA Setup */}
        {step === 'mfa_setup' && (
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Configurar Autenticación de Dos Factores
              </h3>
              <p className="text-sm text-blue-700">
                Escanee el código QR con Google Authenticator o similar app de autenticación.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <QRCode value={mfaSetup.qr_code} size={200} />
              </div>
              
              <div className="w-full">
                <label className="label">Clave manual (si no puede escanear):</label>
                <input
                  type="text"
                  readOnly
                  value={mfaSetup.manual_entry_key}
                  className="input text-center font-mono text-xs"
                />
              </div>
            </div>

            {/* Verification */}
            <form onSubmit={handleMFASetup}>
              <div className="space-y-4">
                <div>
                  <label className="label">Código de verificación (6 dígitos):</label>
                  <input
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    className="input text-center text-lg font-mono"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || mfaCode.length !== 6}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Verificar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* MFA Verification */}
        {step === 'mfa_verify' && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Verificación de Dos Factores
              </h3>
              <p className="text-sm text-green-700">
                Ingrese el código de 6 dígitos de su aplicación de autenticación.
              </p>
            </div>

            <form onSubmit={handleMFAVerify}>
              <div className="space-y-4">
                <div>
                  <label className="label">Código de verificación:</label>
                  <input
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    className="input text-center text-lg font-mono"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || mfaCode.length !== 6}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Verificar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Sistema de administración seguro con autenticación MFA</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;