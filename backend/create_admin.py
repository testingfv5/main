#!/usr/bin/env python3
"""
Script para crear el usuario administrador inicial
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import AuthService, set_database

# Cargar variables de entorno
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    """Crear usuario administrador inicial"""
    
    # Conectar a MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'optica_villalba')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Configurar la base de datos para AuthService
    set_database(db)
    
    try:
        # Verificar si ya existe un usuario admin
        existing_admin = await AuthService.get_user_by_username("admin")
        if existing_admin:
            print("❌ El usuario 'admin' ya existe en la base de datos.")
            print("Credenciales actuales:")
            print("   Usuario: admin")
            print("   Contraseña: (la que configuraste anteriormente)")
            return
        
        # Crear usuario administrador
        admin_data = {
            "username": "admin",
            "email": "admin@opticavillalba.com",
            "password": "AdminPass123!",
            "is_active": True,
            "mfa_enabled": False
        }
        
        user_id = await AuthService.create_user(admin_data)
        
        print("✅ Usuario administrador creado exitosamente!")
        print("\n📋 Credenciales de acceso:")
        print("   Usuario: admin")
        print("   Contraseña: AdminPass123!")
        print("\n⚠️  IMPORTANTE:")
        print("   - Cambia la contraseña después del primer login")
        print("   - Configura la autenticación de dos factores (MFA)")
        print("   - Esta contraseña es solo para desarrollo")
        
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🔧 Creando usuario administrador...")
    asyncio.run(create_admin_user()) 