# db.py
import asyncpg
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

# Expected: postgres://username:password@host:port/database
DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# Global variables for caching
_cached_context = None
_cache_last_updated = None
_CACHE_DURATION = timedelta(minutes=10)  # Change the duration as needed

async def get_all_database_data() -> str:

    conn = await asyncpg.connect(DATABASE_URL)
    try:
        drones = await conn.fetch('SELECT * FROM "Drone"')
        locations = await conn.fetch('SELECT * FROM "Location"')
        missions = await conn.fetch('SELECT * FROM "Mission"')
        survey_reports = await conn.fetch('SELECT * FROM "SurveyReport"')
        
        context = ""
        context += f"Total Drones: {len(drones)}\n"
        context += "Drones:\n" + "\n".join(
            f"ID: {d['id']}, Name: {d['name']}, Model: {d['model']}, Status: {d['status']}, Battery: {d['batteryLevel']}%, Last Mission: {d.get('lastMission', 'N/A')}"
            for d in drones
        )
        
        context += "\n\nTotal Locations: " + str(len(locations)) + "\n"
        context += "Locations:\n" + "\n".join(
            f"ID: {l['id']}, Name: {l['name']}, Type: {l['type']}, Description: {l.get('description', '')}"
            for l in locations
        )
        
        context += "\n\nTotal Missions: " + str(len(missions)) + "\n"
        context += "Missions:\n" + "\n".join(
            f"ID: {m['id']}, Name: {m['name']}, Status: {m['status']}, Type: {m['missionType']}, Completion: {m['completionPercentage']}%"
            for m in missions
        )
        
        context += "\n\nTotal Survey Reports: " + str(len(survey_reports)) + "\n"
        context += "Survey Reports:\n" + "\n".join(
            f"ID: {s['id']}, Mission ID: {s['missionId']}, Date: {s['date']}, Duration: {s.get('duration', 'N/A')}, Status: {s['status']}"
            for s in survey_reports
        )
        
    finally:
        await conn.close()

    return context

async def get_all_database_data_cached() -> str:

    global _cached_context, _cache_last_updated
    from datetime import datetime  # Ensure datetime is imported here as well
    now = datetime.utcnow()
    if _cached_context is None or _cache_last_updated is None or (now - _cache_last_updated) > _CACHE_DURATION:
        _cached_context = await get_all_database_data()
        _cache_last_updated = now
    return _cached_context
