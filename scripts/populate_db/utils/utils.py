import os
import random
import string
from typing import Tuple

import requests


def rand_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_letters, k=length))


def rand_username() -> str:
    usernames = [
        "user1",
        "user2",
        "admin",
        "guest",
        "testuser",
        "demo",
        "sampleuser",
        "exampleuser",
        "randomuser",
    ]
    return f"{random.choice(usernames)}_{rand_name(1).lower()}_{rand_name(1).lower()}"


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


def rand_ipv4() -> str:
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"


def rand_ipv6() -> str:
    return ":".join(
        ["".join(random.choices(string.hexdigits, k=4)) for _ in range(8)]
    ).lower()


def rand_protocol() -> str:
    protocols = ["tcp", "udp", "icmp", "http", "https"]
    return random.choice(protocols)


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


def rand_generic_remediation() -> dict:
    remediation = {
        "en": "Generic remediation text in English.",
        "it": "Testo di remediation generico in italiano.",
        "fr": "Texte de remédiation générique en français.",
        "de": "Generischer Remediationstext auf Deutsch.",
        "es": "Texto de remediación genérico en español.",
    }
    return remediation


def rand_generic_description() -> dict:
    description = {
        "en": "Generic description text in English.",
        "it": "Testo di descrizione generico in italiano.",
        "fr": "Texte de description générique en français.",
        "de": "Generischer Beschreibungstext auf Deutsch.",
        "es": "Texto de descripción genérico en español.",
    }
    return description


def rand_status() -> str:
    statuses = [
        "On Hold",
        "In Progress",
        "Completed",
    ]
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


def rand_source() -> str:
    sources = [
        "nessus",
        "burp",
        "generic",
    ]
    return random.choice(sources)


ROLE_ADMIN = "admin"
ROLE_USER = "user"

POC_TYPE_TEXT = "text"
POC_TYPE_REQUEST = "request/response"
POC_TYPE_IMAGE = "image"
POC_TYPES = [POC_TYPE_TEXT, POC_TYPE_REQUEST, POC_TYPE_IMAGE]


def rand_poc_type() -> str:
    return random.choice(POC_TYPES)


def rand_code_language() -> str:
    languages = [
        "python",
        "javascript",
        "php",
        "java",
        "c",
        "c++",
        "c#",
        "ruby",
        "go",
        "rust",
    ]
    return random.choice(languages)


def rand_image() -> str:
    directory = os.path.join(os.path.dirname(__file__), "..", "images")
    os.makedirs(directory, exist_ok=True)
    only_files = [
        f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))
    ]
    if not only_files:
        image_urls = [
            "https://avatars.githubusercontent.com/u/57672074",
            "https://avatars.githubusercontent.com/u/33416357",
            "https://avatars.githubusercontent.com/u/66215334",
            "https://stickerrs.com/wp-content/uploads/2024/03/Cat-Meme-Stickers-Featured.png",
            "https://i.pinimg.com/736x/b2/60/94/b26094970505bcd59c2e5fe8b6f41cf0.jpg",
        ]
        for url in image_urls:
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    filename = os.path.join(directory, url.split("/")[-1])
                    if not filename.endswith(".png") and not filename.endswith(".jpg"):
                        filename += ".jpg"
                    with open(filename, "wb") as f:
                        f.write(response.content)
                    only_files.append(filename)
            except requests.RequestException as e:
                print(f"Failed to download image from {url}: {e}")

    return os.path.join(directory, random.choice(only_files)) if only_files else ""


class bcolors:
    OKBLUE = "\033[94m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def print_success(message: str) -> None:
    print(f"{bcolors.OKGREEN}[K] {message}{bcolors.ENDC}")


def print_error(message: str) -> None:
    print(f"{bcolors.FAIL}[E] {message}{bcolors.ENDC}")


def print_warning(message: str) -> None:
    print(f"{bcolors.WARNING}[W] {message}{bcolors.ENDC}")


def print_info(message: str) -> None:
    print(f"{bcolors.OKBLUE}[K] {message}{bcolors.ENDC}")


def print_header(message: str) -> None:
    print(f"{bcolors.HEADER}[*] {message}{bcolors.ENDC}")


def print_bold(message: str) -> None:
    print(f"{bcolors.BOLD}[*] {message}{bcolors.ENDC}")


def print_underline(message: str) -> None:
    print(f"{bcolors.UNDERLINE}[*] {message}{bcolors.ENDC}")
