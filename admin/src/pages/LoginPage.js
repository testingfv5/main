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
    setMfaCode('');
    setLoginData({ username: '', password: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Panel Administrativo
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Óptica Villalba
          </p>
        </div>

        {/* Login Form */}
        {step === 'login' && (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese su usuario"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Ingrese su contraseña"
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
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MFA Setup */}
        {step === 'mfa_setup' && (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-white">Configurar Autenticación de Dos Factores</h3>
              <p className="mt-2 text-sm text-gray-400">
                Escanee el código QR con su aplicación de autenticación
              </p>
            </div>

            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={mfaSetup.qr_code} size={200} />
                </div>
              </div>

              {/* Manual Entry */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Clave Manual (si no puede escanear el código)
                </label>
                <input
                  type="text"
                  value={mfaSetup.manual_entry_key}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-300 font-mono text-sm"
                />
              </div>

              {/* Verification Code */}
              <form onSubmit={handleMFASetup}>
                <div>
                  <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-200">
                    Código de Verificación
                  </label>
                  <input
                    id="mfa-code"
                    type="text"
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Verificar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MFA Verification */}
        {step === 'mfa_verify' && (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-white">Verificación de Dos Factores</h3>
              <p className="mt-2 text-sm text-gray-400">
                Ingrese el código de su aplicación de autenticación
              </p>
            </div>

            <form onSubmit={handleMFAVerify} className="space-y-6">
              <div>
                <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-gray-200">
                  Código de Verificación
                </label>
                <input
                  id="mfa-verify-code"
                  type="text"
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Verificar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;