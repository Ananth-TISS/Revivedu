import requests
import sys
import json
import base64
from datetime import datetime
import io

class HomeschoolPortalTester:
    def __init__(self, base_url="https://brightminds-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.activity_id = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("Root API Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root API Endpoint", False, str(e))
            return False

    def test_generate_activity(self):
        """Test activity generation with AI"""
        try:
            payload = {
                "age": 8,
                "subjects": ["Mathematics", "Science"],
                "intelligences": ["Logical-Mathematical", "Spatial"],
                "tools": ["Paper and pencils", "Internet access"]
            }
            
            print("🔄 Generating activity with AI (this may take 10-15 seconds)...")
            response = requests.post(
                f"{self.api_url}/activities/generate", 
                json=payload, 
                timeout=30
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.activity_id = data.get('id')
                required_fields = ['id', 'title', 'description', 'instructions', 'learning_outcomes', 'skills']
                missing_fields = [field for field in required_fields if not data.get(field)]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    details = f"Activity created: {data.get('title', 'Unknown')[:50]}..."
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Generate Activity with AI", success, details)
            return success
        except Exception as e:
            self.log_test("Generate Activity with AI", False, str(e))
            return False

    def test_get_activities(self):
        """Test fetching all activities"""
        try:
            response = requests.get(f"{self.api_url}/activities", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Found {len(data)} activities"
                if len(data) > 0:
                    # Check if our generated activity is in the list
                    if self.activity_id:
                        found = any(activity.get('id') == self.activity_id for activity in data)
                        if not found:
                            success = False
                            details += ", but generated activity not found"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Get All Activities", success, details)
            return success
        except Exception as e:
            self.log_test("Get All Activities", False, str(e))
            return False

    def test_get_activity_by_id(self):
        """Test fetching specific activity by ID"""
        if not self.activity_id:
            self.log_test("Get Activity by ID", False, "No activity ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/activities/{self.activity_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Retrieved activity: {data.get('title', 'Unknown')[:50]}..."
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Get Activity by ID", success, details)
            return success
        except Exception as e:
            self.log_test("Get Activity by ID", False, str(e))
            return False

    def test_submit_feedback(self):
        """Test feedback submission"""
        if not self.activity_id:
            self.log_test("Submit Feedback", False, "No activity ID available")
            return False
            
        try:
            payload = {
                "activity_id": self.activity_id,
                "rating": 5,
                "experience": "Great activity! My child loved it.",
                "outcomes": "Learned about shapes and counting.",
                "suggestions": "Maybe add more visual examples."
            }
            
            response = requests.post(f"{self.api_url}/feedback", json=payload, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Feedback submitted with ID: {data.get('id', 'Unknown')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Submit Feedback", success, details)
            return success
        except Exception as e:
            self.log_test("Submit Feedback", False, str(e))
            return False

    def test_get_feedback(self):
        """Test fetching feedback for activity"""
        if not self.activity_id:
            self.log_test("Get Feedback", False, "No activity ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/feedback/{self.activity_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Found {len(data)} feedback entries"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Get Feedback", success, details)
            return success
        except Exception as e:
            self.log_test("Get Feedback", False, str(e))
            return False

    def test_upload_artifact(self):
        """Test artifact upload"""
        if not self.activity_id:
            self.log_test("Upload Artifact", False, "No activity ID available")
            return False
            
        try:
            # Create a simple test file
            test_content = b"This is a test artifact file for the homeschool portal."
            
            files = {
                'file': ('test_artifact.txt', io.BytesIO(test_content), 'text/plain')
            }
            data = {
                'activity_id': self.activity_id
            }
            
            response = requests.post(
                f"{self.api_url}/artifacts", 
                files=files, 
                data=data, 
                timeout=15
            )
            
            success = response.status_code == 200
            
            if success:
                result = response.json()
                details = f"Artifact uploaded with ID: {result.get('id', 'Unknown')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Upload Artifact", success, details)
            return success
        except Exception as e:
            self.log_test("Upload Artifact", False, str(e))
            return False

    def test_get_artifacts(self):
        """Test fetching artifacts for activity"""
        if not self.activity_id:
            self.log_test("Get Artifacts", False, "No activity ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/artifacts/{self.activity_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Found {len(data)} artifacts"
                if len(data) > 0:
                    # Check if artifact has required fields
                    artifact = data[0]
                    required_fields = ['id', 'filename', 'content_type', 'file_data']
                    missing_fields = [field for field in required_fields if not artifact.get(field)]
                    if missing_fields:
                        success = False
                        details += f", but missing fields: {missing_fields}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Get Artifacts", success, details)
            return success
        except Exception as e:
            self.log_test("Get Artifacts", False, str(e))
            return False

    def test_activity_filters(self):
        """Test activity filtering by age, subject, intelligence"""
        try:
            # Test age filter
            response = requests.get(f"{self.api_url}/activities?age=8", timeout=10)
            age_success = response.status_code == 200
            
            # Test subject filter
            response = requests.get(f"{self.api_url}/activities?subject=Mathematics", timeout=10)
            subject_success = response.status_code == 200
            
            # Test intelligence filter
            response = requests.get(f"{self.api_url}/activities?intelligence=Logical-Mathematical", timeout=10)
            intelligence_success = response.status_code == 200
            
            success = age_success and subject_success and intelligence_success
            details = f"Age filter: {'✓' if age_success else '✗'}, Subject filter: {'✓' if subject_success else '✗'}, Intelligence filter: {'✓' if intelligence_success else '✗'}"
            
            self.log_test("Activity Filters", success, details)
            return success
        except Exception as e:
            self.log_test("Activity Filters", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Homeschool Portal Backend Tests")
        print("=" * 50)
        
        # Test basic connectivity first
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
        
        # Test core functionality
        self.test_generate_activity()
        self.test_get_activities()
        self.test_get_activity_by_id()
        self.test_submit_feedback()
        self.test_get_feedback()
        self.test_upload_artifact()
        self.test_get_artifacts()
        self.test_activity_filters()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

def main():
    tester = HomeschoolPortalTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())