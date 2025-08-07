#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Óptica Villalba Admin Panel
Tests all admin functionality including authentication, file upload, content management, etc.
"""

import requests
import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
import tempfile
from PIL import Image
import io

# Configuration
BACKEND_URL = "https://2fa4a1ba-face-46b0-ba11-de7bea8f004d.preview.emergentagent.com/api"
TEST_USERNAME = "admin"
TEST_PASSWORD = "AdminPass123!"

class AdminPanelTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def create_test_image(self, width=800, height=600, format='JPEG'):
        """Create a test image for upload testing"""
        img = Image.new('RGB', (width, height), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format=format)
        buffer.seek(0)
        return buffer
        
    def test_create_initial_admin(self):
        """Test creating initial admin user"""
        try:
            response = self.session.post(f"{self.base_url}/admin/auth/create-initial-admin")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Create Initial Admin", True, 
                            f"Admin user created: {data.get('username')}")
                return True
            elif response.status_code == 400 and "already exists" in response.text:
                self.log_test("Create Initial Admin", True, 
                            "Admin user already exists (expected)")
                return True
            else:
                self.log_test("Create Initial Admin", False, 
                            f"Unexpected response: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Initial Admin", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_login_step1(self):
        """Test first step of admin login (username/password)"""
        try:
            login_data = {
                "username": TEST_USERNAME,
                "password": TEST_PASSWORD
            }
            
            response = self.session.post(f"{self.base_url}/admin/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("requires_mfa_setup"):
                    self.log_test("Admin Login Step 1", True, 
                                "Login successful - MFA setup required")
                    return "mfa_setup_required"
                elif data.get("requires_mfa"):
                    self.log_test("Admin Login Step 1", True, 
                                "Login successful - MFA verification required")
                    return "mfa_required"
                else:
                    self.log_test("Admin Login Step 1", False, 
                                f"Unexpected login response: {data}")
                    return False
            else:
                self.log_test("Admin Login Step 1", False, 
                            f"Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login Step 1", False, f"Exception: {str(e)}")
            return False
    
    def test_mfa_setup_flow(self):
        """Test MFA setup flow"""
        try:
            # Step 1: Request MFA setup
            setup_data = {"username": TEST_USERNAME}
            response = self.session.post(f"{self.base_url}/admin/auth/setup-mfa", json=setup_data)
            
            if response.status_code != 200:
                self.log_test("MFA Setup", False, 
                            f"MFA setup request failed: {response.status_code}")
                return False
                
            setup_response = response.json()
            secret = setup_response.get("secret")
            
            if not secret:
                self.log_test("MFA Setup", False, "No MFA secret received")
                return False
                
            self.log_test("MFA Setup Request", True, "MFA secret generated successfully")
            
            # Step 2: Generate a test MFA code (simulate Google Authenticator)
            import pyotp
            totp = pyotp.TOTP(secret)
            mfa_code = totp.now()
            
            # Step 3: Verify MFA setup
            verify_data = {
                "username": TEST_USERNAME,
                "secret": secret,
                "mfa_code": mfa_code
            }
            
            response = self.session.post(f"{self.base_url}/admin/auth/verify-mfa-setup", json=verify_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log_test("MFA Setup Verification", True, "MFA setup completed successfully")
                return True
            else:
                self.log_test("MFA Setup Verification", False, 
                            f"MFA verification failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("MFA Setup", False, f"Exception: {str(e)}")
            return False
    
    def test_mfa_login_flow(self):
        """Test MFA login flow for existing user"""
        try:
            # First get the user's MFA secret (this would normally be stored)
            # For testing, we'll use a mock approach
            import pyotp
            
            # Generate a test code (in real scenario, user would provide this from their app)
            # We need to get the secret from the database or use a known test secret
            # For now, let's try with a test code
            test_mfa_code = "123456"  # This won't work, but tests the endpoint
            
            mfa_data = {
                "username": TEST_USERNAME,
                "mfa_code": test_mfa_code
            }
            
            response = self.session.post(f"{self.base_url}/admin/auth/verify-mfa", json=mfa_data)
            
            # We expect this to fail with invalid code, which is normal
            if response.status_code == 401:
                self.log_test("MFA Login Flow", True, 
                            "MFA endpoint working (invalid code rejected as expected)")
                return True
            elif response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log_test("MFA Login Flow", True, "MFA login successful")
                return True
            else:
                self.log_test("MFA Login Flow", False, 
                            f"Unexpected MFA response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("MFA Login Flow", False, f"Exception: {str(e)}")
            return False
    
    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            self.log_test("Authentication Check", False, "No valid token available")
            return False
            
        try:
            # Test /me endpoint
            response = self.session.get(f"{self.base_url}/admin/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                self.log_test("Get Current User", True, 
                            f"User info retrieved: {user_data.get('username')}")
                return True
            else:
                self.log_test("Get Current User", False, 
                            f"Failed to get user info: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Authentication Check", False, f"Exception: {str(e)}")
            return False
    
    def test_file_upload_system(self):
        """Test file upload functionality"""
        if not self.token:
            self.log_test("File Upload Test", False, "No authentication token")
            return False
            
        try:
            # Create a test image
            test_image = self.create_test_image()
            
            # Test single image upload
            files = {
                'file': ('test_image.jpg', test_image, 'image/jpeg')
            }
            data = {
                'category': 'general',
                'optimize': 'true'
            }
            
            response = self.session.post(f"{self.base_url}/admin/upload/image", 
                                       files=files, data=data)
            
            if response.status_code == 200:
                upload_data = response.json()
                self.log_test("Single Image Upload", True, 
                            f"Image uploaded: {upload_data.get('filename')}")
                
                # Test storage stats
                stats_response = self.session.get(f"{self.base_url}/admin/upload/storage/stats")
                if stats_response.status_code == 200:
                    stats = stats_response.json()
                    self.log_test("Storage Stats", True, 
                                f"Total files: {stats.get('total_files')}")
                else:
                    self.log_test("Storage Stats", False, 
                                f"Failed to get stats: {stats_response.status_code}")
                
                return True
            else:
                self.log_test("Single Image Upload", False, 
                            f"Upload failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("File Upload Test", False, f"Exception: {str(e)}")
            return False
    
    def test_content_management(self):
        """Test content management APIs"""
        if not self.token:
            self.log_test("Content Management Test", False, "No authentication token")
            return False
            
        try:
            # Test initialize defaults
            response = self.session.post(f"{self.base_url}/admin/content/initialize-defaults")
            
            if response.status_code == 200:
                init_data = response.json()
                self.log_test("Initialize Default Content", True, 
                            f"Initialized {init_data.get('total_configs')} configurations")
            else:
                self.log_test("Initialize Default Content", False, 
                            f"Failed to initialize: {response.status_code}")
                return False
            
            # Test get all sections
            response = self.session.get(f"{self.base_url}/admin/content/sections")
            
            if response.status_code == 200:
                sections = response.json()
                self.log_test("Get All Sections", True, 
                            f"Retrieved {len(sections)} sections")
                
                # Test get specific section
                if "header" in sections:
                    header_response = self.session.get(f"{self.base_url}/admin/content/section/header")
                    if header_response.status_code == 200:
                        header_data = header_response.json()
                        self.log_test("Get Header Section", True, 
                                    f"Header has {len(header_data)} configurations")
                    else:
                        self.log_test("Get Header Section", False, 
                                    f"Failed: {header_response.status_code}")
                
                return True
            else:
                self.log_test("Get All Sections", False, 
                            f"Failed to get sections: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Content Management Test", False, f"Exception: {str(e)}")
            return False
    
    def test_promotions_management(self):
        """Test promotions CRUD operations"""
        if not self.token:
            self.log_test("Promotions Management Test", False, "No authentication token")
            return False
            
        try:
            # Create a test promotion
            promotion_data = {
                "title": "Test Promotion",
                "discount": "50% OFF",
                "type": "Promoción Especial",
                "description": "Test promotion for backend testing",
                "features": ["Feature 1", "Feature 2"],
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
            
            response = self.session.post(f"{self.base_url}/admin/promotions/", json=promotion_data)
            
            if response.status_code == 200:
                created_promotion = response.json()
                promotion_id = created_promotion.get("id")
                self.log_test("Create Promotion", True, 
                            f"Promotion created: {created_promotion.get('title')}")
                
                # Test get all promotions
                response = self.session.get(f"{self.base_url}/admin/promotions/")
                if response.status_code == 200:
                    promotions = response.json()
                    self.log_test("Get All Promotions", True, 
                                f"Retrieved {len(promotions)} promotions")
                else:
                    self.log_test("Get All Promotions", False, 
                                f"Failed: {response.status_code}")
                
                # Test get active promotions
                response = self.session.get(f"{self.base_url}/admin/promotions/active")
                if response.status_code == 200:
                    active_promotions = response.json()
                    self.log_test("Get Active Promotions", True, 
                                f"Retrieved {len(active_promotions)} active promotions")
                else:
                    self.log_test("Get Active Promotions", False, 
                                f"Failed: {response.status_code}")
                
                # Test update promotion
                update_data = {
                    "title": "Updated Test Promotion",
                    "discount": "60% OFF"
                }
                response = self.session.put(f"{self.base_url}/admin/promotions/{promotion_id}", 
                                          json=update_data)
                if response.status_code == 200:
                    self.log_test("Update Promotion", True, "Promotion updated successfully")
                else:
                    self.log_test("Update Promotion", False, 
                                f"Failed: {response.status_code}")
                
                return True
            else:
                self.log_test("Create Promotion", False, 
                            f"Failed to create promotion: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Promotions Management Test", False, f"Exception: {str(e)}")
            return False
    
    def test_brands_management(self):
        """Test brands CRUD operations"""
        if not self.token:
            self.log_test("Brands Management Test", False, "No authentication token")
            return False
            
        try:
            # Create a test brand
            brand_data = {
                "name": "Test Brand",
                "color": "#ff0000",
                "is_active": True,
                "order": 1
            }
            
            response = self.session.post(f"{self.base_url}/admin/brands/", json=brand_data)
            
            if response.status_code == 200:
                created_brand = response.json()
                brand_id = created_brand.get("id")
                self.log_test("Create Brand", True, 
                            f"Brand created: {created_brand.get('name')}")
                
                # Test get all brands
                response = self.session.get(f"{self.base_url}/admin/brands/")
                if response.status_code == 200:
                    brands = response.json()
                    self.log_test("Get All Brands", True, 
                                f"Retrieved {len(brands)} brands")
                else:
                    self.log_test("Get All Brands", False, 
                                f"Failed: {response.status_code}")
                
                # Test get active brands
                response = self.session.get(f"{self.base_url}/admin/brands/active")
                if response.status_code == 200:
                    active_brands = response.json()
                    self.log_test("Get Active Brands", True, 
                                f"Retrieved {len(active_brands)} active brands")
                else:
                    self.log_test("Get Active Brands", False, 
                                f"Failed: {response.status_code}")
                
                return True
            else:
                self.log_test("Create Brand", False, 
                            f"Failed to create brand: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Brands Management Test", False, f"Exception: {str(e)}")
            return False
    
    def test_public_apis(self):
        """Test public API endpoints"""
        try:
            # Test public promotions
            response = requests.get(f"{self.base_url}/public/promotions/active")
            
            if response.status_code == 200:
                promotions = response.json()
                self.log_test("Public Active Promotions", True, 
                            f"Retrieved {len(promotions)} public promotions")
            else:
                self.log_test("Public Active Promotions", False, 
                            f"Failed: {response.status_code}")
            
            # Test public brands
            response = requests.get(f"{self.base_url}/public/brands/active")
            
            if response.status_code == 200:
                brands = response.json()
                self.log_test("Public Active Brands", True, 
                            f"Retrieved {len(brands)} public brands")
            else:
                self.log_test("Public Active Brands", False, 
                            f"Failed: {response.status_code}")
            
            # Test public content
            response = requests.get(f"{self.base_url}/public/content")
            
            if response.status_code == 200:
                content = response.json()
                self.log_test("Public Content", True, 
                            f"Retrieved {len(content)} content sections")
            else:
                self.log_test("Public Content", False, 
                            f"Failed: {response.status_code}")
            
            # Test health check
            response = requests.get(f"{self.base_url}/public/health")
            
            if response.status_code == 200:
                health = response.json()
                self.log_test("Health Check", True, 
                            f"Status: {health.get('status')}")
            else:
                self.log_test("Health Check", False, 
                            f"Failed: {response.status_code}")
                
            return True
            
        except Exception as e:
            self.log_test("Public APIs Test", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing for Óptica Villalba Admin Panel")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("Create Initial Admin User", self.test_create_initial_admin),
            ("Admin Login Step 1", self.test_admin_login_step1),
            ("MFA Setup Flow", self.test_mfa_setup_flow),
            ("Authenticated Endpoints", self.test_authenticated_endpoints),
            ("File Upload System", self.test_file_upload_system),
            ("Content Management", self.test_content_management),
            ("Promotions Management", self.test_promotions_management),
            ("Brands Management", self.test_brands_management),
            ("Public APIs", self.test_public_apis),
        ]
        
        for test_name, test_func in tests:
            print(f"\n📋 Running: {test_name}")
            print("-" * 40)
            test_func()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Failed tests details
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = AdminPanelTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend is working correctly.")
        exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        exit(1)