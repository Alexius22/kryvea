import base64
import json
from dataclasses import dataclass
from typing import Tuple

import utils.utils as utils
from models.base import Base


@dataclass
class PocData(Base):
    type: str
    index: int = 0
    description: str = utils.rand_string(120)
    uri: str = utils.rand_urls(1)[0]
    request: str = utils.rand_string(120)
    response: str = utils.rand_string(120)
    image_data: str = ""
    image_reference: str = ""
    image_caption: str = utils.rand_string(10)
    text_language: str = utils.rand_language()
    text_data: str = utils.rand_string(20)


@dataclass
class Poc(Base):
    poc_data: list[PocData]
    vulnerability_id: str

    def add(self) -> Tuple[str, str]:
        data = [
            {
                "type": poc_data.type,
                "index": poc_data.index,
                "description": poc_data.description,
                "uri": poc_data.uri,
                "request": poc_data.request,
                "response": poc_data.response,
                "image_reference": f"image{poc_data.index}",
                "image_caption": poc_data.image_caption,
                "text_language": poc_data.text_language,
                "text_data": poc_data.text_data,
            }
            for poc_data in self.poc_data
        ]

        files = {
            "pocs": (None, json.dumps(data), "application/json"),
        }

        for poc_data in self.poc_data:
            if poc_data.type == utils.POC_TYPE_IMAGE and poc_data.image_data != "":
                files[f"image{poc_data.index}"] = (
                    "example.jpg",
                    base64.b64decode(poc_data.image_data),
                    "image/jpeg",
                )

        response = self.session.put(
            self.base_url + f"/vulnerabilities/{self.vulnerability_id}/pocs",
            files=files,
        )
        json_response = response.json()
        if response.status_code == 200:
            return "", ""
        return "", json_response.get("error")
