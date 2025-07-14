from dataclasses import dataclass
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class Assessment(Base):
    name: str
    start_date_time: str
    end_date_time: str
    cvss_versions: list
    customer_id: str
    targets: list = None
    status: str = utils.rand_status()
    assessment_type: str = utils.rand_assessment_type()
    environment: str = utils.rand_environment()
    testing_type: str = utils.rand_testing_type()
    osstmm_vector: str = utils.rand_osstmm_vector()
    vulnerability_count: int = 0
    customer: dict = None
    is_owned: bool = False

    def add(self) -> Tuple[str, str]:
        data = {
            "customer_id": self.customer_id,
            "name": self.name,
            "start_date_time": self.start_date_time,
            "end_date_time": self.end_date_time,
            "cvss_versions": self.cvss_versions,
            "targets": self.targets,
            "status": self.status,
            "assessment_type": self.assessment_type,
            "environment": self.environment,
            "testing_type": self.testing_type,
            "osstmm_vector": self.osstmm_vector,
        }
        response = self.session.post(self.base_url + "/assessments", json=data)
        json_response = response.json()
        if response.status_code == 201:
            self.id = json_response.get("assessment_id")
            return self.id, ""
        return "", json_response.get("error")
