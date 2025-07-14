from dataclasses import dataclass
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class User(Base):
    username: str
    password: str
    disabled_at: str = ""
    role: str = utils.ROLE_USER
    customers: list = None
    assessments: list = None

    def add(self) -> Tuple[str, str]:
        data = {
            "username": self.username,
            "password": self.password,
            "role": self.role,
        }
        response = self.session.post(self.base_url + "/users", json=data)
        json_response = response.json()
        if response.status_code == 201:
            self.id = json_response.get("user_id")
            return self.id, ""
        return "", json_response.get("error")

    def login(self) -> bool:
        data = {
            "username": self.username,
            "password": self.password,
        }
        response = self.session.post(self.base_url + "/login", json=data)
        if response.status_code == 200:
            return True
        return False
