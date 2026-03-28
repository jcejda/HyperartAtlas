import enum
import uuid
from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import String, Text, Float, Boolean, Integer, Enum, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ThomassonStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


THOMASSON_CATEGORIES = [
    "pure",
    "pure_staircase",
    "useless_doorway",
    "hisashi",
    "useless_window",
    "a_bomb",
    "elevated",
    "outie",
    "castella",
    "atago",
    "live_burial",
    "abe_sada",
    "useless_bridge",
    "uncategorized",
]


class Thomasson(Base):
    __tablename__ = "thomassons"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    discovery_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[ThomassonStatus] = mapped_column(
        Enum(ThomassonStatus), default=ThomassonStatus.PENDING_REVIEW, nullable=False
    )
    submitted_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    reviewed_by: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submitter = relationship(
        "User", back_populates="submissions", foreign_keys=[submitted_by]
    )
    reviewer = relationship(
        "User", back_populates="reviews", foreign_keys=[reviewed_by]
    )
    photos = relationship(
        "Photo", back_populates="thomasson", cascade="all, delete-orphan",
        order_by="Photo.order",
    )

    @property
    def primary_photo(self):
        for photo in self.photos:
            if photo.is_primary:
                return photo
        if self.photos:
            return self.photos[0]
        return None


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    thomasson_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("thomassons.id", ondelete="CASCADE"), nullable=False
    )
    file_key: Mapped[str] = mapped_column(String(500), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    thomasson = relationship("Thomasson", back_populates="photos")
