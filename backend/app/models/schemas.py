from pydantic import BaseModel


class EventRequest(BaseModel):
    user: str
    event: str
    device: str
    location: str

    failed_login_count: int = 0
    vpn: bool = False
    privileged_account: bool = False
    hour: int = 12