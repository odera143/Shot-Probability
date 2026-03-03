from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import shotchartdetail
import json, os

app = FastAPI()

CACHE_DIR = "./cache"
os.makedirs(CACHE_DIR, exist_ok=True)

ALL_PLAYERS = static_players.get_players()

@app.get("/api/players")
def search_players(q: str = Query(..., min_length=2)):
    ql = q.lower()
    matches = [p for p in ALL_PLAYERS if ql in p["full_name"].lower()]
    return [{"id": p["id"], "name": p["full_name"]} for p in matches[:20]]

@app.get("/api/seasons")
def seasons():
    # Keep tight for MVP
    return ["2018-19","2019-20","2020-21","2021-22","2022-23","2023-24","2024-25"]

def cache_key(player_id: int, season: str, season_type: str, grid: int):
    safe_type = season_type.replace(" ", "_")
    return os.path.join(CACHE_DIR, f"{player_id}_{season}_{safe_type}_g{grid}.json")

@app.get("/api/shotgrid")
def shotgrid(
    player_id: int,
    season: str,
    season_type: str = "Regular Season",
    grid: int = 1,
    min_att: int = 3
):
    path = cache_key(player_id, season, season_type, grid)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)

    # Pull shot chart data
    # Team_id=0 works for player shots; nba_api endpoint expects some fields
    resp = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=player_id,
        season_nullable=season,
        season_type_all_star=season_type,
        context_measure_simple="FGA"
    )
    data = resp.get_data_frames()[0]
    if data.empty:
        result = {"playerId": player_id, "season": season, "seasonType": season_type, "gridFt": grid, "cells": []}
        with open(path, "w") as f:
            json.dump(result, f)
        return result

    # Columns vary; common ones: LOC_X, LOC_Y, SHOT_MADE_FLAG, SHOT_TYPE
    df = data.copy()
    df["made"] = df["SHOT_MADE_FLAG"].astype(int)

    # Convert NBA Stats shot chart coords (NBA records in tenths of a foot)
    df["x_ft"] = df["LOC_X"] / 10
    df["y_ft"] = df["LOC_Y"] / 10

    # Bin to grid in feet
    df["gx"] = (df["x_ft"] / grid).round().astype(int) * grid
    df["gy"] = (df["y_ft"] / grid).round().astype(int) * grid

    # is3: use SHOT_TYPE contains '3PT'
    df["is3"] = df["SHOT_TYPE"].astype(str).str.contains("3PT")

    grouped = df.groupby(["gx", "gy", "is3"]).agg(att=("made", "size"), made=("made", "sum")).reset_index()
    grouped = grouped[grouped["att"] >= min_att].copy()
    grouped["fg"] = grouped["made"] / grouped["att"]
    grouped["pts"] = grouped["fg"] * grouped["is3"].map(lambda v: 3 if v else 2)

    cells = [
        {
            "x": int(row.gx),
            "y": int(row.gy),
            "att": int(row.att),
            "made": int(row.made),
            "fg": float(row.fg),
            "pts": float(row.pts),
            "is3": bool(row.is3),
        }
        for row in grouped.itertuples(index=False)
    ]

    result = {"playerId": player_id, "season": season, "seasonType": season_type, "gridFt": grid, "cells": cells}
    with open(path, "w") as f:
        json.dump(result, f)
    return result
