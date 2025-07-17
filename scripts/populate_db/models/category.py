import random
from dataclasses import dataclass, field
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class Category(Base):
    index: str
    name: str
    generic_remediation: dict = field(
        default_factory=lambda: utils.rand_generic_remediation()
    )
    generic_description: dict = field(
        default_factory=lambda: utils.rand_generic_description()
    )
    references: list = field(
        default_factory=lambda: utils.rand_urls(random.randint(1, 3))
    )
    source: str = field(default_factory=utils.rand_source)

    def add(self) -> Tuple[str, str]:
        data = {
            "index": self.index,
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
