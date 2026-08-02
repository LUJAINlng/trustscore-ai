from pydantic import BaseModel


class EventRequest(BaseModel):
    user: str
    event: str
    device: str
    vpn: bool = False
    hour: int | None = None
    location: str | None = None