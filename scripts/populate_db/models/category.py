import random
from dataclasses import dataclass, field
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class Category(Base):
    identifier: str

    name: str = field(default_factory=utils.rand_category_name)
    generic_remediation: dict = field(default_factory=utils.rand_generic_remediation)
    generic_description: dict = field(default_factory=utils.rand_generic_description)
    references: list = field(default_factory=utils.rand_urls)
    source: str = field(default_factory=utils.rand_source)

    def __post_init__(self):
        self.name = utils.rand_category_name(self.identifier)

    def add(self) -> Tuple[str, str]:
        data = {
            "identifier": self.identifier,
            "name": self.name,
            "generic_remediation": self.generic_remediation,
            "generic_description": self.generic_description,
            "references": self.references,
            "source": self.source,
        }
        response = self.session.post(self.base_url + "/admin/categories", json=data)
        json_response = response.json()
        if response.status_code == 201:
            self.id = json_response.get("category_id")
            return self.id, ""
        return "", json_response.get("error")
