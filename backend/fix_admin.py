#!/usr/bin/env python3
"""
Script para arreglar el usuario admin y permitir login sin MFA
"""
import asyncio
import os
import sys
from pathlib import Path

# Agregar el directorio actual al path para importar los módulos
sys.path.append(str(Path(__file__).parent))

from auth import AuthService, set_database
from models.user import UserCreate
import uuid
from datetime import datetime

async def fix_admin_user():
    """Arreglar el usuario admin para permitir login sin MFA"""
    
    print("🔧 Arreglando usuario admin...")
    
    # Configurar la base de datos
    from server import db
    set_database(db)
    
    # Verificar si el usuario admin existe
    existing_admin = await AuthService.get_user_by_username("admin")
    
    if existing_admin:
        print("✅ Usuario admin encontrado")
        
        # Deshabilitar MFA para el usuario admin
        await AuthService.update_user_mfa("admin", "", enabled=False)
        
        print("✅ MFA deshabilitado para el usuario admin")
        print("🔐 Credenciales:")
        print("   Usuario: admin")
        print("   Contraseña: AdminPass123!")
        print()
        print("📝 Ahora puedes hacer login sin MFA")
        
    else:
        print("❌ Usuario admin no encontrado")
        print("   Ejecuta primero: python create_admin.py")

if __name__ == "__main__":
    asyncio.run(fix_admin_user()) 