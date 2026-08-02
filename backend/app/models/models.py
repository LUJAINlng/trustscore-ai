from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    trust_score = Column(Integer, default=100)
    status = Column(String, default="Active")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False)
    event = Column(String, nullable=False)
    risk_score = Column(Integer)
    trust_score = Column(Integer)
    decision = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    reasons = Column(Text)