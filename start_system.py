#!/usr/bin/env python3
"""
Script para iniciar todo el sistema de Óptica Villalba
Inicia el backend y el panel administrativo y los mantiene ejecutándose
"""
import subprocess
import time
import sys
import os
import signal
import threading
from pathlib import Path

# Variables globales para los procesos
backend_process = None
admin_process = None

def signal_handler(signum, frame):
    """Manejar Ctrl+C para detener todos los procesos"""
    print("\n🛑 Deteniendo todos los servicios...")
    
    if backend_process:
        backend_process.terminate()
        print("✅ Servidor backend detenido")
    
    if admin_process:
        admin_process.terminate()
        print("✅ Panel administrativo detenido")
    
    print("👋 ¡Hasta luego!")
    sys.exit(0)

def start_backend():
    """Iniciar el servidor backend en segundo plano"""
    global backend_process
    
    print("🚀 Iniciando servidor backend...")
    backend_dir = Path(__file__).parent / "backend"
    
    # Verificar que el archivo .env existe
    if not (backend_dir / ".env").exists():
        print("❌ Error: Archivo .env no encontrado en backend/")
        print("   Ejecuta primero: python create_admin.py")
        return False
    
    try:
        # Iniciar el servidor backend en segundo plano
        backend_process = subprocess.Popen(
            [sys.executable, "server.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        
        # Esperar un momento para que el servidor se inicie
        time.sleep(3)
        
        # Verificar si el proceso sigue ejecutándose
        if backend_process.poll() is None:
            print("✅ Servidor backend iniciado en http://localhost:8003")
            return True
        else:
            print("❌ Error iniciando el servidor backend")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def start_admin():
    """Iniciar el panel administrativo en segundo plano"""
    global admin_process
    
    print("🚀 Iniciando panel administrativo...")
    admin_dir = Path(__file__).parent / "admin"
    
    try:
        # Verificar si npm está disponible
        npm_cmd = "npm"
        if os.name == 'nt':  # Windows
            npm_cmd = "npm.cmd"
        
        # Iniciar el servidor de desarrollo del admin en segundo plano
        admin_process = subprocess.Popen(
            [npm_cmd, "start"],
            cwd=admin_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        
        # Esperar un momento para que el servidor se inicie
        time.sleep(5)
        
        # Verificar si el proceso sigue ejecutándose
        if admin_process.poll() is None:
            print("✅ Panel administrativo iniciado en http://localhost:3001")
            return True
        else:
            print("❌ Error iniciando el panel administrativo")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def monitor_processes():
    """Monitorear los procesos y mantener el script ejecutándose"""
    try:
        while True:
            # Verificar si los procesos siguen ejecutándose
            if backend_process and backend_process.poll() is not None:
                print("❌ El servidor backend se ha detenido")
                break
            
            if admin_process and admin_process.poll() is not None:
                print("❌ El panel administrativo se ha detenido")
                break
            
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

def main():
    """Función principal"""
    # Configurar el manejador de señales para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    print("🔧 Iniciando sistema de Óptica Villalba...")
    print("=" * 50)
    
    # Iniciar backend
    if not start_backend():
        print("❌ No se pudo iniciar el backend")
        return
    
    print()
    
    # Iniciar admin
    if not start_admin():
        print("❌ No se pudo iniciar el admin")
        return
    
    print()
    print("🎉 ¡Sistema iniciado correctamente!")
    print("=" * 50)
    print("📋 URLs de acceso:")
    print("   • Panel Administrativo: http://localhost:3001")
    print("   • API Backend: http://localhost:8003")
    print()
    print("🔐 Credenciales de acceso:")
    print("   • Usuario: admin")
    print("   • Contraseña: AdminPass123!")
    print()
    print("⚠️  IMPORTANTE:")
    print("   • Configura la autenticación de dos factores en el primer login")
    print("   • Cambia la contraseña después del primer acceso")
    print()
    print("🛑 Para detener el sistema, presiona Ctrl+C")
    print("=" * 50)
    
    # Mantener el script ejecutándose y monitorear los procesos
    monitor_processes()

if __name__ == "__main__":
    main() 