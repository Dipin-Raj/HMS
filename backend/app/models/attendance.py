from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    check_in_time = Column(DateTime, nullable=False)
    check_out_time = Column(DateTime)
    date = Column(Date, nullable=False)

    staff = relationship("Staff", backref="attendance")

    def __repr__(self):
        return f"<Attendance(staff_id='{self.staff_id}', date='{self.date}', check_in='{self.check_in_time}')>"
