import random
from dataclasses import dataclass
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class Category(Base):
    index: str
    name: str
    generic_remediation: dict = None
    generic_description: dict = None
    references: list = None

    def add(self) -> Tuple[str, str]:
        if self.generic_remediation is None or self.generic_description is None:
            self.generic_remediation, self.generic_description = (
                utils.rand_generic_remediation_and_description()
            )

        if self.references is None:
            self.references = utils.rand_urls(random.randint(1, 3))

        data = {
            "index": self.index,
            "name": self.name,
            "generic_remediation": self.generic_remediation,
            "generic_description": self.generic_description,
            "references": self.references,
        }
        response = self.session.post(self.base_url + "/categories", json=data)
        json_response = response.json()
        if response.status_code == 201:
            self.id = json_response.get("category_id")
            return self.id, ""
        return "", json_response.get("error")
