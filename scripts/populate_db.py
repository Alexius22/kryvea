from typing import Tuple
import random, string
import requests
import base64
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_url = "https://kryvea.local/api"

session = requests.Session()
session.verify = False
# session.proxies = {
#     "http": "http://127.0.0.1:8080",
#     "https": "http://127.0.0.1:8080",
# }


def rand_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_letters, k=length))


def rand_cvss_version() -> str:
    versions = ["3.1", "4.0"]
    return random.choice(versions)


def rand_cvss(version: str) -> str:
    if version == "3.1":
        vectors = [
            "CVSS:3.1/AV:A/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:L",
            "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:H",
            "CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:L/A:H",
            "CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:H/A:N",
            "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:N",
            "CVSS:3.1/AV:L/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N",
            "CVSS:3.1/AV:A/AC:H/PR:H/UI:N/S:U/C:N/I:H/A:N",
            "CVSS:3.1/AV:P/AC:H/PR:H/UI:N/S:C/C:N/I:L/A:N",
            "CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N",
            "CVSS:3.1/AV:A/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:H",
        ]
        return random.choice(vectors)
    vectors = [
        "CVSS:4.0/AV:A/AC:H/AT:P/PR:L/UI:P/VC:L/VI:L/VA:L/SC:L/SI:L/SA:L",
        "CVSS:4.0/AV:A/AC:H/AT:N/PR:L/UI:P/VC:H/VI:H/VA:L/SC:L/SI:L/SA:L",
        "CVSS:4.0/AV:A/AC:H/AT:N/PR:L/UI:A/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
        "CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:A/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
        "CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:P/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
        "CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:P/VC:H/VI:L/VA:L/SC:N/SI:H/SA:H",
    ]
    return random.choice(vectors)


def rand_hostname() -> str:
    tlds = ["com", "net", "org", "gov", "it", "fr", "de", "es", "uk", "us"]
    return f"{rand_string()}.{random.choice(tlds)}"


def rand_port() -> int:
    ports = [21, 22, 23, 25, 53, 80, 110, 443, 8080, 8443]
    return random.choice(ports)


def rand_ip() -> str:
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"


def rand_name(n=1) -> str:
    names = [
        "Ace",
        "Blaze",
        "Nova",
        "Zane",
        "Kai",
        "Orion",
        "Jett",
        "Echo",
        "Maverick",
        "Axel",
        "Ryder",
        "Phoenix",
        "Storm",
        "Dash",
        "Sable",
        "Ember",
        "Zephyr",
        "Titan",
        "Knox",
        "Luna",
        "Indigo",
        "Raven",
        "Aspen",
        "Atlas",
        "Juno",
        "Onyx",
        "Sage",
        "Vega",
        "Zara",
        "Xander",
        "Aria",
        "Dante",
        "Hunter",
        "Skye",
        "Rogue",
        "Kairos",
        "Hawk",
        "Shadow",
        "Nyx",
        "Lyric",
    ]
    return " ".join(random.choices(names, k=n))


def rand_language() -> str:
    languages = ["it", "en", "fr", "de", "es"]
    return random.choice(languages)


def rand_status() -> str:
    statuses = ["On Hold", "In Progress", "Completed",]
    return random.choice(statuses)


def rand_assessment_type() -> str:
    types = ["WAPT", "VAPT", "MAPT", "IoT", "Red Team Assessment"]
    return random.choice(types)


def rand_environment() -> str:
    environments = ["Pre-Production", "Production"]
    return random.choice(environments)


def rand_testing_type() -> str:
    types = ["Black Box", "White Box", "Grey Box"]
    return random.choice(types)


def rand_osstmm_vector() -> str:
    vectors = [
        "Inside to Inside",
        "Inside to Outside",
        "Outside to Outside",
        "Outside to Inside",
    ]
    return random.choice(vectors)


def rand_urls(n=1) -> list:
    urls = [
        "https://example.com",
        "https://example.org",
        "https://example.net",
        "https://example.gov",
        "https://example.it",
        "https://example.fr",
        "https://example.de",
        "https://example.es",
        "https://example.uk",
        "https://example.us",
    ]
    return random.choices(urls, k=n)

POC_TYPE_TEXT    = "text"
POC_TYPE_REQUEST = "request"
POC_TYPE_IMAGE   = "image"
POC_TYPES = [POC_TYPE_TEXT, POC_TYPE_REQUEST, POC_TYPE_IMAGE]
def rand_poc_type() -> str:
    return random.choice(POC_TYPES)

def rand_code_language() -> str:
    languages = ["python", "javascript", "php", "java", "c", "c++", "c#", "ruby", "go", "rust"]
    return random.choice(languages)

class bcolors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


class User:
    def __init__(self, username="kryvea", password="kryveapassword", role="user"):
        self.username = username
        self.password = password
        self.role = role

    def json(self) -> dict:
        return {"username": self.username, "password": self.password, "role": self.role}

    def register(self) -> bool:
        response = session.post(base_url + "/users", json=self.json())
        if response.status_code == 201:
            return True
        return False

    def login(self) -> bool:
        response = session.post(base_url + "/login", json=self.json())
        if response.status_code == 200:
            return True
        return False


class Customer:
    def __init__(self, name="", language="it"):
        self.name = name
        self.language = language

    def json(self) -> dict:
        return {"name": self.name, "language": self.language}

    def get(self) -> list:
        response = session.get(base_url + "/customers")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/customers", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("customer_id"), ""
        return "", jr.get("error")


class Target:
    def __init__(
        self,
        ip="127.0.0.1",
        port=80,
        protocol="tcp",
        hostname="localhost",
        customer_id="",
    ):
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
        }

    def get(self) -> list:
        response = session.get(f"{base_url}/customers/{self.customer_id}/targets")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(f"{base_url}/customers/{self.customer_id}/targets", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("target_id"), ""
        return "", jr.get("error")


class Assessment:
    def __init__(
        self,
        name="",
        start_date_time="",
        end_date_time="",
        targets=[],
        status="hold",
        assessment_type="WAPT",
        cvss_version="4.0",
        environment="",
        testing_type="black box",
        osstmm_vector="",
        customer_id="",
    ):
        self.id = ""
        self.name = name
        self.start_date_time = start_date_time
        self.end_date_time = end_date_time
        self.targets = targets
        self.status = status
        self.assessment_type = assessment_type
        self.cvss_version = cvss_version
        self.environment = environment
        self.testing_type = testing_type
        self.osstmm_vector = osstmm_vector
        self.customer_id = customer_id

    def json(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "start_date_time": self.start_date_time,
            "end_date_time": self.end_date_time,
            "targets": self.targets,
            "status": self.status,
            "assessment_type": self.assessment_type,
            "cvss_version": self.cvss_version,
            "environment": self.environment,
            "testing_type": self.testing_type,
            "osstmm_vector": self.osstmm_vector,
        }

    def get(self) -> list:
        response = session.get(f"{base_url}/customers/{self.customer_id}/assessments")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(f"{base_url}/customers/{self.customer_id}/assessments", json=self.json())
        jr = response.json()
        id = jr.get("assessment_id")
        self.id = id
        if response.status_code == 201:
            return id, ""
        return "", jr.get("error")


class Category:
    def __init__(
        self, index="A01:2021", name="", generic_description={}, generic_remediation={}, references=[]
    ):
        self.index = index
        self.name = name
        self.generic_description = generic_description
        self.generic_remediation = generic_remediation
        self.references = references

    def json(self) -> dict:
        return {
            "index": self.index,
            "name": self.name,
            "generic_description": self.generic_description,
            "generic_remediation": self.generic_remediation,
            "references": self.references,
        }

    def get(self) -> list:
        response = session.get(base_url + "/categories")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(base_url + "/categories", json=self.json())
        jr = response.json()
        if response.status_code == 201:
            return jr.get("category_id"), ""
        return "", jr.get("error")


class Vulnerability:
    def __init__(
        self,
        category="",
        detailed_title="",
        cvss_vector="",
        cvss_score=0.0,
        cvss_severity="",
        references=[],
        generic_description=True,
        generic_remediation=True,
        description="",
        remediation="",
        target_id="",
        assessment_id="",
    ):
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
        }

    def get(self):
        response = session.get(f"{base_url}/assessments/{self.assessment_id}/vulnerabilities")
        return response.json()

    def create(self) -> Tuple[str, str]:
        response = session.post(f"{base_url}/assessments/{self.assessment_id}/vulnerabilities", json=self.json())
        jr = response.json()
        id = jr.get("vulnerability_id")
        self.id = id
        if response.status_code == 201:
            return id, ""
        return "", jr.get("error")
        
class POC:
    def __init__(self, index=1, type="exploit", description="", uri="", request="", response="", image_data="", image_caption="", text_language="", text_data="", vulnerability_id=""):
        self.index = index
        self.type = type
        self.description = description
        self.uri = uri
        self.request = request
        self.response = response
        self.image_data = image_data
        self.image_caption = image_caption
        self.text_language = text_language
        self.text_data = text_data
        self.vulnerability_id = vulnerability_id
        
    def json(self):
        return {
            "index": self.index,
            "type": self.type,
            "description": self.description,
            "uri": self.uri,
            "request": self.request,
            "response": self.response,
            "image_data": self.image_data,
            "image_caption": self.image_caption,
            "text_language": self.text_language,
            "text_data": self.text_data,
        }
        
    def get(self):
        response = session.get(f"{base_url}/vulnerabilities/{self.vulnerability_id}/pocs")
        return response.json()
    
    def create(self) -> Tuple[str, str]:
        response = session.post(f"{base_url}/vulnerabilities/{self.vulnerability_id}/pocs", json=self.json())
        jr = response.json()
        id = jr.get("poc_id")
        self.id = id
        if response.status_code == 201:
            return id, ""
        return "", jr.get("error")


def rand_poc_text() -> POC:
    return POC(
        index=1,
        type=POC_TYPE_TEXT,
        description=rand_string(),
        text_language=rand_code_language(),
        text_data=rand_string(),
    )
    
image_paths = [ "scripts/images/1.png", "scripts/images/2.png", "scripts/images/3.png", "scripts/images/4.jpg" ]
def rand_poc_image() -> POC:
    image = random.choice(image_paths)
    imageBytes = open(image, "rb").read()
    imageb64 = base64.b64encode(imageBytes).decode("utf-8")
    return POC(
        index=1,
        type=POC_TYPE_IMAGE,
        description=rand_string(),
        image_data=imageb64,
        image_caption=rand_string(),
    )

def rand_poc_request() -> POC:
    return POC(
        index=1,
        type=POC_TYPE_REQUEST,
        description=rand_string(),
        uri=random.choice(rand_urls()),
        request=rand_string(),
        response=rand_string(),
    )


if __name__ == "__main__":
    admin_user = User()
    if not admin_user.login():
        print("Login failed")
        exit(1)
        
    users = []
    for i in range(5):
        user = User(username=rand_string(8), password=rand_string(10)+"1!")
        if not user.register():
            print("Registration failed")
            exit(1)
        users.append(user)
        print(f"{bcolors.OKGREEN}[*] Registered user {user.username}{bcolors.ENDC}")

    customer = Customer(name=rand_name(3), language=rand_language())
    # print(customer.json())
    customer_id, error = customer.create()
    if error:
        print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
        exit(1)
    print(f"{bcolors.OKGREEN}[*] Created customer {customer_id}{bcolors.ENDC}")

    targets = []
    for i in range(10):
        target = Target(
            ip=rand_ip(),
            port=rand_port(),
            hostname=rand_hostname(),
            customer_id=customer_id,
        )
        # print(target.json())
        target_id, error = target.create()
        if error:
            print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
            exit(1)
        target.id = target_id
        targets.append(target)
        print(f"{bcolors.OKGREEN}[*] Created target {target_id}{bcolors.ENDC}")

    assessments = []
    for i in range(5):
        assessment = Assessment(
            name=rand_name(3),
            start_date_time="2025-01-01T00:00:00.000Z",
            end_date_time="2025-02-01T00:00:00.000Z",
            targets=[x.id for x in random.choices(targets, k=random.randint(1, 6))],
            status=rand_status(),
            assessment_type=rand_assessment_type(),
            cvss_version=rand_cvss_version(),
            environment=rand_environment(),
            testing_type=rand_testing_type(),
            osstmm_vector=rand_osstmm_vector(),
            customer_id=customer_id,
        )
        # print(assessment.json())
        assessment_id, error = assessment.create()
        if error:
            print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
            exit(1)
        assessment.id = assessment_id
        assessments.append(assessment)
        print(f"{bcolors.OKGREEN}[*] Created assessment {assessment_id}{bcolors.ENDC}")

    categories = []
    for i in range(5):
        languages = [rand_language() for i in range(5)]
        category = Category(
            index=rand_string(),
            name=rand_name(3),
            generic_description={
                languages[0]: rand_name(50),
                languages[1]: rand_name(50),
                languages[2]: rand_name(50),
                languages[3]: rand_name(50),
                languages[4]: rand_name(50),
            },
            generic_remediation={
                languages[0]: rand_name(50),
                languages[1]: rand_name(50),
                languages[2]: rand_name(50),
                languages[3]: rand_name(50),
                languages[4]: rand_name(50),
            },
            references=rand_urls(random.randint(1, 3)),
        )
        # print(category.json())
        category_id, error = category.create()
        if error:
            print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
            exit(1)
        category.id = category_id
        categories.append(category)
        print(f"{bcolors.OKGREEN}[*] Created category {category_id}{bcolors.ENDC}")

    vulnerabilities = []
    for i in range(5):
        vuln_assessment = random.choice(assessments)
        cvss_vector = rand_cvss(vuln_assessment.cvss_version)
        vulnerability = Vulnerability(
            category=random.choice(categories).id,
            detailed_title=rand_string(),
            cvss_vector=cvss_vector,
            cvss_score=0,
            cvss_severity="None",
            references=rand_urls(random.randint(1, 3)),
            generic_description=True,
            generic_remediation=True,
            description=rand_string(),
            remediation=rand_string(),
            target_id=random.choice(vuln_assessment.json().get("targets")),
            assessment_id=vuln_assessment.json().get("id"),
        )
        # print(vulnerability.json())
        vulnerability_id, error = vulnerability.create()
        if error:
            print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
            exit(1)
        vulnerability.id = vulnerability_id
        vulnerabilities.append(vulnerability)
        print(
            f"{bcolors.OKGREEN}[*] Created vulnerability {vulnerability_id}{bcolors.ENDC}"
        )

    for vulnerability in vulnerabilities:
        for i in range(7):
            poc = None
            poc_type = rand_poc_type()
            if poc_type == POC_TYPE_TEXT:
                poc = rand_poc_text()
            elif poc_type == POC_TYPE_REQUEST:
                poc = rand_poc_request()
            elif poc_type == POC_TYPE_IMAGE:
                poc = rand_poc_image()
            poc.vulnerability_id = vulnerability.id
            poc.index = i + 1
            # print(poc.json())
            poc_id, error = poc.create()
            if error:
                print(f"{bcolors.FAIL}{error}{bcolors.ENDC}")
                exit(1)
            poc.id = poc_id
            print(f"{bcolors.OKGREEN}[*] Created POC {poc_id}{bcolors.ENDC}")
