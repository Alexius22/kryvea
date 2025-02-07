from typing import Tuple
import random, string
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_url = "https://kryvea.local/api"

session = requests.Session()
session.verify = False
session.proxies = {
    "http": "http://127.0.0.1:8080",
    "https": "http://127.0.0.1:8080",
}

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    
class User:
    def __init__(self, username="kryvea", password="kryveapassword"):
        self.username = username
        self.password = password
        
    def json(self) -> dict:
        return {
            "username": self.username,
            "password": self.password
        }
        
    def register(self) -> bool:
        response = session.post(base_url + "/register", json=self.json())
        if response.status_code == 201:
            return True
        return False

    def login(self) -> bool:
        response = session.post(base_url + "/login", json=self.json())
        if response.status_code == 200:
            return True
        return False

def rand_string(length: int = 8) -> str:
    return ''.join(random.choices(string.ascii_letters, k=length))

class Customer:    
    def __init__(self, name="", language="it"):
        self.name = name
        self.language = language
        
    def json(self) -> dict:
        return {
            "name": self.name,
            "language": self.language
        }

    def get(self) -> list:
        response = session.get(base_url + "/customers")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/customer", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("customer_id"), ""
        return "", jr.get("error")

class Target:
    def __init__(self, ip="127.0.0.1", port=80, protocol="tcp", hostname="localhost", customer_id=""):
        self.ip = ip
        self.port = port
        self.protocol = protocol
        self.hostname = hostname
        self.customer_id = customer_id
        
    def json(self) -> dict:
        return {
            "ip": self.ip,
            "port": self.port,
            "protocol": self.protocol,
            "hostname": self.hostname,
            "customer_id": self.customer_id
        }
    
    def get(self) -> list:
        response = session.get(base_url + "/targets")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/target", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("target_id"), ""
        return "", jr.get("error")

class Assessment:
    def __init__(self, name="", type="Assessment", cvss_version="4.0", targets=[], customer_id=""):
        self.name = name
        self.type = type
        self.cvss_version = cvss_version
        self.targets = targets
        self.customer_id = customer_id
        
    def json(self) -> dict:
        return {
            "name": self.name,
            "type": self.type,
            "cvss_version": self.cvss_version,
            "targets": self.targets,
            "customer_id": self.customer_id
        }

    def get(self) -> list:
        response = session.get(base_url + "/assessments")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/assessment", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("assessment_id"), ""
        return "", jr.get("error")

class Category:    
    def __init__(self, index="A01:2021", name=""):
        self.index = index
        self.name = name
    
    def json(self) -> dict:
        return {
            "index": self.index,
            "name": self.name
        }
    
    def get(self) -> list:
        response = session.get(base_url + "/categories")
        return response.json()
    
    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/category", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("category_id"), ""
        return "", jr.get("error")
        
class Vulnerability:
    def __init__(self, category="", detailed_title="", cvss_vector="", cvss_score=0.0, cvss_severity="", references=[], generic_description=True, generic_remediation=True, description="", remediation="", target_id="", assessment_id=""):
        self.category = category
        self.detailed_title = detailed_title
        self.cvss_vector = cvss_vector
        self.cvss_score = cvss_score
        self.cvss_severity = cvss_severity
        self.references = references
        self.generic_description = generic_description
        self.generic_remediation = generic_remediation
        self.description = description
        self.remediation = remediation
        self.target_id = target_id
        self.assessment_id = assessment_id
    
    def json(self):
        return {
            "category": self.category,
            "detailed_title": self.detailed_title,
            "cvss_vector": self.cvss_vector,
            "cvss_score": self.cvss_score,
            "cvss_severity": self.cvss_severity,
            "references": self.references,
            "generic_description": self.generic_description,
            "generic_remediation": self.generic_remediation,
            "description": self.description,
            "remediation": self.remediation,
            "target_id": self.target_id,
            "assessment_id": self.assessment_id
        }
        
    def get(self):
        response = session.get(base_url + "/vulnerabilities")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/vulnerability", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("vulnerability_id"), ""
        return "", jr.get("error")


if __name__ == "__main__":
    user = User()
    if not user.register():
        print("Registration failed")
        # exit(1)
    
    if not user.login():
        print("Login failed")
        exit(1)
    
    customer = Customer(name=rand_string())
    # print(customer.json())
    customer_id, error = customer.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created customer {customer_id}{bcolors.ENDC}")

    target1 = Target(hostname=rand_string(), customer_id=customer_id)
    # print(target1.json())
    target1_id, error = target1.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created target {target1_id}{bcolors.ENDC}")
    
    target2 = Target(hostname=rand_string(), customer_id=customer_id)
    # print(target2.json())
    target2_id, error = target2.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created target {target2_id}{bcolors.ENDC}")
    
    assessment = Assessment(name=rand_string(), targets=[target1_id, target2_id], customer_id=customer_id)
    # print(assessment.json())
    assessment_id, error = assessment.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created assessment {assessment_id}{bcolors.ENDC}")
    
    category = Category(name=rand_string())
    # print(category.json())
    category_id, error = category.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created category {category_id}{bcolors.ENDC}")

    vulnerability1 = Vulnerability(
        category=category_id,
        detailed_title=rand_string(),
        cvss_vector="CVSS:4.0/AV:A/AC:H/AT:P/PR:L/UI:P/VC:L/VI:L/VA:L/SC:L/SI:L/SA:L",
        cvss_score=8.0,
        cvss_severity="High",
        references=["https://example.com"],
        generic_description=True,
        generic_remediation=True,
        description=rand_string(),
        remediation=rand_string(),
        target_id=target1_id,
        assessment_id=assessment_id
    )
    # print(vulnerability1.json())
    vulnerability1_id, error = vulnerability1.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created vulnerability {vulnerability1_id}{bcolors.ENDC}")
    
    vulnerability2 = Vulnerability(
        category=category_id,
        detailed_title=rand_string(),
        cvss_vector="CVSS:4.0/AV:A/AC:H/AT:P/PR:L/UI:P/VC:L/VI:L/VA:L/SC:L/SI:L/SA:L",
        cvss_score=8.0,
        cvss_severity="High",
        references=["https://example.com"],
        generic_description=True,
        generic_remediation=True,
        description=rand_string(),
        remediation=rand_string(),
        target_id=target2_id,
        assessment_id=assessment_id
    )
    # print(vulnerability2.json())
    vulnerability2_id, error = vulnerability2.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created vulnerability {vulnerability2_id}{bcolors.ENDC}")
    
    vulnerability3 = Vulnerability(
        category=category_id,
        detailed_title=rand_string(),
        cvss_vector="CVSS:4.0/AV:A/AC:H/AT:P/PR:L/UI:P/VC:L/VI:L/VA:L/SC:L/SI:L/SA:L",
        cvss_score=8.0,
        cvss_severity="High",
        references=["https://example.com"],
        generic_description=True,
        generic_remediation=True,
        description=rand_string(),
        remediation=rand_string(),
        target_id=target2_id,
        assessment_id=assessment_id
    )
    # print(vulnerability3.json())
    vulnerability3_id, error = vulnerability3.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created vulnerability {vulnerability3_id}{bcolors.ENDC}")