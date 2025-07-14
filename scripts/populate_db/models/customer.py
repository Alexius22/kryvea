from dataclasses import dataclass
from typing import Tuple

from models.base import Base


@dataclass
class Customer(Base):
    name: str
    language: str

    def getAll(self) -> list:
        response = self.session.get(self.base_url + "/customers")
        return response.json()

    def add(self) -> Tuple[str, str]:
        data = {
            "name": self.name,
            "language": self.language,
        }
        response = self.session.post(self.base_url + "/customers", json=data)
        jr = response.json()
        if response.status_code == 201:
            self.id = jr.get("customer_id")
            return self.id, ""
        return "", jr.get("error")

    def getAssessments(self) -> list:
        response = self.session.get(self.base_url + f"/customers/{self.id}/assessments")
        return response.json()

    def getTargets(self) -> list:
        response = self.session.get(self.base_url + f"/customers/{self.id}/targets")
        return response.json()
