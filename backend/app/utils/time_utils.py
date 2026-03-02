from datetime import datetime, date, timedelta

def get_start_of_day(dt: datetime) -> datetime:
    return datetime(dt.year, dt.month, dt.day)

def get_end_of_day(dt: datetime) -> datetime:
    return datetime(dt.year, dt.month, dt.day, 23, 59, 59, 999999)

def get_start_of_week(dt: datetime) -> datetime:
    # Monday as the start of the week
    start_week = dt - timedelta(days=dt.weekday())
    return get_start_of_day(start_week)

def get_end_of_week(dt: datetime) -> datetime:
    # Sunday as the end of the week
    end_week = dt + timedelta(days=(6 - dt.weekday()))
    return get_end_of_day(end_week)

def datetime_to_iso(dt: datetime) -> str:
    return dt.isoformat()

def date_to_iso(d: date) -> str:
    return d.isoformat()
