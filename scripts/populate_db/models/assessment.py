from dataclasses import dataclass, field
from typing import Dict, List, Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class Assessment(Base):
    name: str
    start_date_time: str
    end_date_time: str
    cvss_versions: List[str]
    customer_id: str

    targets: List[str] = field(default_factory=list)
    status: str = field(default_factory=utils.rand_status)
    assessment_type: str = field(default_factory=utils.rand_assessment_type)
    environment: str = field(default_factory=utils.rand_environment)
    testing_type: str = field(default_factory=utils.rand_testing_type)
    osstmm_vector: str = field(default_factory=utils.rand_osstmm_vector)

    vulnerability_count: int = 0
    customer: Dict = field(default_factory=dict)
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
