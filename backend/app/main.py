import json
import os
import re
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import Client, create_client

BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_ROOT)

load_dotenv(os.path.join(PROJECT_ROOT, ".env.local"))
load_dotenv(os.path.join(BACKEND_ROOT, ".env"))
load_dotenv()


app = FastAPI(title="KidsPlate Python Backend")

ALLOWED_AGE_GROUPS = {"1-3", "4-6", "7-12", "mom"}
MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]
DIETARY_FILTERS = {"veg", "non-veg", "jain"}
CATEGORIES = ["grain", "legume", "vegetable", "dairy", "fruit", "protein", "snack"]
NON_VEG_KEYWORDS = ["chicken", "mutton", "lamb", "fish", "egg", "prawn", "shrimp", "meat", "keema"]
JAIN_EXCLUDE_KEYWORDS = NON_VEG_KEYWORDS + [
    "onion", "garlic", "potato", "aloo", "carrot", "beetroot", "radish", "mooli", "yam", "suran", "turnip",
]
SERVINGS_BY_AGE = {"1-3": 1, "4-6": 1.25, "7-12": 1.5, "mom": 2}
MEAL_CATEGORY_PRIORITY = {
    "breakfast": ["grain", "dairy", "fruit"],
    "lunch": ["legume", "vegetable", "grain"],
    "dinner": ["protein", "vegetable", "grain"],
    "snack": ["fruit", "snack", "dairy"],
}
RDA = {
    "1-3": {"calories": 1000, "protein": 16, "iron": 9, "calcium": 700, "vitaminC": 40, "fiber": 19},
    "4-6": {"calories": 1200, "protein": 20, "iron": 13, "calcium": 1000, "vitaminC": 25, "fiber": 20},
    "7-12": {"calories": 1800, "protein": 35, "iron": 22, "calcium": 1200, "vitaminC": 40, "fiber": 25},
    "mom": {"calories": 2000, "protein": 46, "iron": 18, "calcium": 1000, "vitaminC": 75, "fiber": 25},
}
NUTRITION_DOCS = [
    {
        "id": "nih-iron-children",
        "title": "Iron Needs for Children 1 to 13 Years",
        "source": "NIH Office of Dietary Supplements",
        "source_url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/",
        "summary": "Reference intake levels for iron by age and practical food sources.",
        "tags": ["iron", "toddlers", "children", "anemia"],
        "chunk": "Children age 1 to 3 need about 7 mg of iron per day and children age 4 to 8 need about 10 mg. Useful kid-friendly iron foods include fortified cereals, beans, lentils, eggs, poultry, tofu, and spinach. Pair plant-based iron foods with vitamin C foods to improve absorption.",
    },
    {
        "id": "nih-calcium-children",
        "title": "Calcium Needs for Children",
        "source": "NIH Office of Dietary Supplements",
        "source_url": "https://ods.od.nih.gov/factsheets/Calcium-Consumer/",
        "summary": "Age-specific calcium needs and common food sources for children.",
        "tags": ["calcium", "bones", "growth", "dairy"],
        "chunk": "Children age 1 to 3 need about 700 mg of calcium per day, children age 4 to 8 need about 1,000 mg, and children age 9 to 18 need about 1,300 mg. Calcium can come from milk, yogurt, cheese, calcium-set tofu, fortified soy milk, and some leafy greens.",
    },
    {
        "id": "cdc-growth-basics",
        "title": "Child Growth Basics",
        "source": "CDC",
        "source_url": "https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/index.html",
        "summary": "Growth should be tracked over time using age, sex, height, and weight trends.",
        "tags": ["growth", "height", "weight", "tracking"],
        "chunk": "Children should be assessed over time rather than from a single measurement alone. Age, sex, height, and weight trends matter. Sudden flattening in weight gain, drop in height velocity, or major percentile shifts should be reviewed by a clinician rather than treated as a nutrition diagnosis from an app alone.",
    },
]


def get_supabase() -> Client:
    url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


def get_openai() -> OpenAI:
    api_key = os.environ["OPENAI_API_KEY"].strip().strip("'\"")
    return OpenAI(api_key=api_key)


def require_user(user_id: Optional[str]) -> str:
    if not user_id:
      raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id


def parse_csv_field(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def normalize_food_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def tokenize(value: str) -> List[str]:
    return [token for token in normalize_food_name(value).split(" ") if token]


def has_any_keyword(text: str, keywords: List[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def get_food_text(food: Dict[str, Any]) -> str:
    return " ".join([food["name"], *food.get("aliases", [])]).lower()


def filter_foods_by_diet(foods: List[Dict[str, Any]], dietary_filter: Optional[str]) -> List[Dict[str, Any]]:
    if not dietary_filter or dietary_filter == "non-veg":
        return foods
    if dietary_filter == "veg":
        return [food for food in foods if not has_any_keyword(get_food_text(food), NON_VEG_KEYWORDS)]
    return [food for food in foods if not has_any_keyword(get_food_text(food), JAIN_EXCLUDE_KEYWORDS)]


def pick_from_category(foods: List[Dict[str, Any]], indices: Dict[str, int], category: str) -> Optional[Dict[str, Any]]:
    pool = [food for food in foods if food["category"] == category]
    if not pool:
        return None
    key = f"cat:{category}"
    idx = indices.get(key, 0) % len(pool)
    indices[key] = indices.get(key, 0) + 1
    return pool[idx]


def pick_any_food(foods: List[Dict[str, Any]], indices: Dict[str, int]) -> Optional[Dict[str, Any]]:
    if not foods:
        return None
    key = "cat:any"
    idx = indices.get(key, 0) % len(foods)
    indices[key] = indices.get(key, 0) + 1
    return foods[idx]


def build_suggested_items(menu_id: str, age_group: str, foods: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    indices: Dict[str, int] = {}
    servings = SERVINGS_BY_AGE[age_group]
    for day in range(1, 8):
        for meal_type in MEAL_TYPES:
            picked = None
            for category in MEAL_CATEGORY_PRIORITY[meal_type]:
                picked = pick_from_category(foods, indices, category)
                if picked:
                    break
            if not picked:
                picked = pick_any_food(foods, indices)
            if picked:
                items.append({"menu_id": menu_id, "food_id": picked["id"], "day": day, "meal_type": meal_type, "servings": servings})
    return items


def score_food_match(food: Dict[str, Any], raw_name: str) -> int:
    target = normalize_food_name(raw_name)
    target_tokens = set(tokenize(raw_name))
    candidates = [normalize_food_name(food["name"]), *[normalize_food_name(alias) for alias in food.get("aliases", [])]]
    score = 0
    for candidate in candidates:
        if candidate == target:
            return 1000
        if candidate in target or target in candidate:
            score = max(score, 700)
        overlap = len(set(tokenize(candidate)) & target_tokens)
        score = max(score, overlap * 100)
    return score


def match_food_by_name(foods: List[Dict[str, Any]], raw_name: str) -> Optional[Dict[str, Any]]:
    best = None
    best_score = 0
    for food in foods:
        score = score_food_match(food, raw_name)
        if score > best_score:
            best = food
            best_score = score
    return best if best_score >= 100 else None


def build_fallback_item(menu_id: str, age_group: str, foods: List[Dict[str, Any]], meal_type: str, day: int, indices: Dict[str, int]) -> Optional[Dict[str, Any]]:
    for category in MEAL_CATEGORY_PRIORITY[meal_type]:
        picked = pick_from_category(foods, indices, category)
        if picked:
            return {"menu_id": menu_id, "food_id": picked["id"], "day": day, "meal_type": meal_type, "servings": SERVINGS_BY_AGE[age_group]}
    picked = pick_any_food(foods, indices)
    if not picked:
        return None
    return {"menu_id": menu_id, "food_id": picked["id"], "day": day, "meal_type": meal_type, "servings": SERVINGS_BY_AGE[age_group]}


def resolve_ai_menu_to_items(menu_id: str, age_group: str, foods: List[Dict[str, Any]], ai_meals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    resolved: List[Dict[str, Any]] = []
    seen: Set[str] = set()
    fallback_indices: Dict[str, int] = {}
    for meal in ai_meals:
        if not isinstance(meal, dict):
            continue
        meal_type = str(meal.get("meal_type"))
        day = int(meal.get("day", 0))
        if meal_type not in MEAL_TYPES or day < 1 or day > 7:
            continue
        slot = f"{day}:{meal_type}"
        if slot in seen:
            continue
        matched = match_food_by_name(foods, str(meal.get("food_name", "")))
        if not matched:
            continue
        servings = float(meal.get("servings") or SERVINGS_BY_AGE[age_group])
        resolved.append({"menu_id": menu_id, "food_id": matched["id"], "day": day, "meal_type": meal_type, "servings": servings})
        seen.add(slot)
    for day in range(1, 8):
        for meal_type in MEAL_TYPES:
            slot = f"{day}:{meal_type}"
            if slot in seen:
                continue
            fallback = build_fallback_item(menu_id, age_group, foods, meal_type, day, fallback_indices)
            if fallback:
                resolved.append(fallback)
    return resolved


def normalize_ai_meals(value: Any) -> List[Dict[str, Any]]:
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]

    if isinstance(value, dict):
        nested = value.get("meals")
        if isinstance(nested, list):
            return [item for item in nested if isinstance(item, dict)]
        return []

    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return []
        return normalize_ai_meals(parsed)

    return []


def has_enough_food_variety(foods: List[Dict[str, Any]]) -> bool:
    return len(foods) >= 12 and len({food["category"] for food in foods}) >= 4


def retrieve_nutrition_evidence(query: str) -> List[Dict[str, Any]]:
    query_tokens = set(tokenize(query))
    def score(doc: Dict[str, Any]) -> int:
        doc_tokens = set(tokenize(" ".join([doc["title"], doc["summary"], doc["chunk"], " ".join(doc["tags"])])))
        return len(query_tokens & doc_tokens)
    return sorted(NUTRITION_DOCS, key=score, reverse=True)[:4]


def format_evidence_for_prompt(evidence: List[Dict[str, Any]]) -> str:
    return "\n\n".join(
        f"[{index + 1}] {doc['title']} | {doc['source']} | {doc['source_url']}\nSummary: {doc['summary']}\nEvidence: {doc['chunk']}"
        for index, doc in enumerate(evidence)
    )


def generate_json(system: str, prompt: str) -> Dict[str, Any]:
    client = get_openai()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        temperature=0.4,
        max_tokens=2000,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
    )
    content = response.choices[0].message.content
    if not content:
        raise HTTPException(status_code=500, detail="AI response was empty")
    return json.loads(content)


def calc_day_nutrition(items: List[Dict[str, Any]], day: int) -> Dict[str, float]:
    totals = {"calories": 0.0, "protein": 0.0, "iron": 0.0, "calcium": 0.0, "vitaminC": 0.0, "fiber": 0.0}
    for item in items:
        if item["day"] != day:
            continue
        food = item["food"]
        servings = float(item["servings"])
        totals["calories"] += float(food["calories"]) * servings
        totals["protein"] += float(food["protein_g"]) * servings
        totals["iron"] += float(food["iron_mg"]) * servings
        totals["calcium"] += float(food["calcium_mg"]) * servings
        totals["vitaminC"] += float(food["vitamin_c_mg"]) * servings
        totals["fiber"] += float(food["fiber_g"]) * servings
    return totals


def calc_weekly_average(items: List[Dict[str, Any]]) -> Dict[str, float]:
    days = [calc_day_nutrition(items, day) for day in range(1, 8)]
    return {key: sum(day[key] for day in days) / len(days) for key in days[0]}


class MenuCreatePayload(BaseModel):
    title: str
    description: Optional[str] = ""
    age_group: str
    auto_fill: Optional[bool] = False
    dietary_filter: Optional[str] = None
    ai_prompt: Optional[str] = None
    dietary_constraints: Optional[List[str]] = None
    child_profile_id: Optional[str] = None


class FriendRequestPayload(BaseModel):
    addressee_id: str


class FriendRespondPayload(BaseModel):
    friendship_id: str
    action: str


class MealPostPayload(BaseModel):
    image_url: str
    caption: Optional[str] = ""
    notes: Optional[str] = ""
    visibility: str = "friends"
    schedule_menu_id: Optional[str] = None
    schedule_day: Optional[int] = None
    schedule_meal_type: Optional[str] = None


class MealPostCommentPayload(BaseModel):
    post_id: str
    body: str


@app.get("/health")
def health() -> Dict[str, str]:
    return {"ok": "true"}


def upsert_user_profile(user_id: str, email: Optional[str], full_name: Optional[str] = None, avatar_url: Optional[str] = None) -> None:
    supabase = get_supabase()
    supabase.table("user_profiles").upsert({
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "avatar_url": avatar_url,
        "plan_tier": "free",
        "onboarding_completed": False,
    }).execute()


def get_friend_user_ids(user_id: str) -> List[str]:
    supabase = get_supabase()
    rows = supabase.table("friendships").select("*").eq("status", "accepted").or_(f"requester_id.eq.{user_id},addressee_id.eq.{user_id}").execute().data or []
    friend_ids: List[str] = []
    for row in rows:
        friend_ids.append(row["addressee_id"] if row["requester_id"] == user_id else row["requester_id"])
    return friend_ids


def can_user_view_post(post: Dict[str, Any], user_id: str, friend_ids: List[str]) -> bool:
    if post["user_id"] == user_id:
        return True
    if post["visibility"] == "public":
        return True
    return post["visibility"] == "friends" and post["user_id"] in friend_ids


@app.get("/profiles/search")
def search_profiles(q: str = "", x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    if not q.strip():
        return {"results": []}
    supabase = get_supabase()
    profiles = supabase.table("user_profiles").select("id, email, full_name, avatar_url").or_(f"email.ilike.%{q}%,full_name.ilike.%{q}%").neq("id", user_id).limit(10).execute().data or []
    existing = supabase.table("friendships").select("*").or_(f"and(requester_id.eq.{user_id},addressee_id.in.({','.join([profile['id'] for profile in profiles])})),and(addressee_id.eq.{user_id},requester_id.in.({','.join([profile['id'] for profile in profiles])}))").execute().data if profiles else None
    by_other_id: Dict[str, Dict[str, Any]] = {}
    for row in existing or []:
        other_id = row["addressee_id"] if row["requester_id"] == user_id else row["requester_id"]
        by_other_id[other_id] = row
    return {
        "results": [
            {
                **profile,
                "friendship": by_other_id.get(profile["id"]),
            }
            for profile in profiles
        ]
    }


@app.get("/friends")
def get_friends(x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    rows = supabase.table("friendships").select("*").or_(f"requester_id.eq.{user_id},addressee_id.eq.{user_id}").order("created_at", desc=True).execute().data or []
    other_ids = list({row["addressee_id"] if row["requester_id"] == user_id else row["requester_id"] for row in rows})
    profiles = supabase.table("user_profiles").select("id, email, full_name, avatar_url").in_("id", other_ids).execute().data or [] if other_ids else []
    profiles_by_id = {profile["id"]: profile for profile in profiles}
    accepted = []
    pending_incoming = []
    pending_outgoing = []
    for row in rows:
        other_id = row["addressee_id"] if row["requester_id"] == user_id else row["requester_id"]
        entry = {**row, "profile": profiles_by_id.get(other_id)}
        if row["status"] == "accepted":
            accepted.append(entry)
        elif row["status"] == "pending" and row["addressee_id"] == user_id:
            pending_incoming.append(entry)
        elif row["status"] == "pending":
            pending_outgoing.append(entry)
    return {
        "friends": accepted,
        "pending_incoming": pending_incoming,
        "pending_outgoing": pending_outgoing,
    }


@app.post("/friends/request")
def send_friend_request(payload: FriendRequestPayload, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    if payload.addressee_id == user_id:
        raise HTTPException(status_code=400, detail="You cannot add yourself")
    supabase = get_supabase()
    existing = supabase.table("friendships").select("*").or_(f"and(requester_id.eq.{user_id},addressee_id.eq.{payload.addressee_id}),and(requester_id.eq.{payload.addressee_id},addressee_id.eq.{user_id})").execute().data or []
    if existing:
        friendship = existing[0]
        if friendship["status"] == "accepted":
            return JSONResponse(friendship, status_code=200)
        if friendship["requester_id"] == payload.addressee_id and friendship["addressee_id"] == user_id and friendship["status"] == "pending":
            updated = supabase.table("friendships").update({"status": "accepted"}).eq("id", friendship["id"]).execute().data
            return JSONResponse(updated[0], status_code=200)
        if friendship["status"] == "rejected":
            updated = supabase.table("friendships").update({
                "requester_id": user_id,
                "addressee_id": payload.addressee_id,
                "status": "pending",
            }).eq("id", friendship["id"]).execute().data
            return JSONResponse(updated[0], status_code=200)
        return JSONResponse(friendship, status_code=200)
    created = supabase.table("friendships").insert({
        "requester_id": user_id,
        "addressee_id": payload.addressee_id,
        "status": "pending",
    }).execute().data
    return JSONResponse(created[0], status_code=201)


@app.post("/friends/respond")
def respond_friend_request(payload: FriendRespondPayload, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    if payload.action not in {"accept", "reject"}:
        raise HTTPException(status_code=400, detail="Invalid action")
    supabase = get_supabase()
    rows = supabase.table("friendships").select("*").eq("id", payload.friendship_id).execute().data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Friend request not found")
    friendship = rows[0]
    if friendship["addressee_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    status = "accepted" if payload.action == "accept" else "rejected"
    updated = supabase.table("friendships").update({"status": status}).eq("id", payload.friendship_id).execute().data
    return updated[0]


@app.post("/meal-posts")
async def create_meal_post(payload: MealPostPayload, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    if payload.visibility not in {"private", "friends", "public"}:
        raise HTTPException(status_code=400, detail="Invalid visibility")
    if not payload.image_url.strip():
        raise HTTPException(status_code=400, detail="image_url is required")
    if not (payload.caption or "").strip():
        raise HTTPException(status_code=400, detail="Caption is required")
    meal_type = payload.schedule_meal_type if payload.schedule_meal_type in {"breakfast", "lunch", "dinner", "snack"} else None

    supabase = get_supabase()
    if payload.schedule_menu_id and payload.schedule_day and payload.schedule_meal_type:
        if payload.schedule_day < 1 or payload.schedule_day > 7:
            raise HTTPException(status_code=400, detail="Invalid schedule day")
        if payload.schedule_meal_type not in {"breakfast", "lunch", "dinner", "snack"}:
            raise HTTPException(status_code=400, detail="Invalid schedule meal type")

        menu_rows = supabase.table("menus").select("id").eq("id", payload.schedule_menu_id).eq("user_id", user_id).execute().data or []
        if not menu_rows:
            raise HTTPException(status_code=404, detail="Selected menu not found")

        existing_food = supabase.table("foods").select("id").eq("name", payload.caption.strip()).limit(1).execute().data or []
        if existing_food:
            food_id = existing_food[0]["id"]
        else:
            created_food = supabase.table("foods").insert({
                "name": payload.caption.strip(),
                "aliases": [],
                "category": "snack",
                "serving_size_g": 100,
                "serving_label": "1 serving",
                "calories": 0,
                "protein_g": 0,
                "carbs_g": 0,
                "fat_g": 0,
                "fiber_g": 0,
                "iron_mg": 0,
                "calcium_mg": 0,
                "vitamin_c_mg": 0,
            }).execute().data
            food_id = created_food[0]["id"]

        supabase.table("menu_items").insert({
            "menu_id": payload.schedule_menu_id,
            "food_id": food_id,
            "day": payload.schedule_day,
            "meal_type": payload.schedule_meal_type,
            "servings": 1,
        }).execute()

    created = supabase.table("meal_posts").insert({
        "user_id": user_id,
        "image_url": payload.image_url,
        "caption": payload.caption.strip(),
        "notes": (payload.notes or "").strip(),
        "meal_type": meal_type,
        "ai_meal_name": None,
        "ai_ingredients": [],
        "ai_nutrition": {},
        "visibility": payload.visibility,
    }).execute().data
    return JSONResponse(created[0], status_code=201)


@app.post("/meal-post-comments")
async def create_meal_post_comment(payload: MealPostCommentPayload, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    body = (payload.body or "").strip()
    if not payload.post_id:
        raise HTTPException(status_code=400, detail="post_id is required")
    if not body:
        raise HTTPException(status_code=400, detail="Comment is required")

    supabase = get_supabase()
    post_rows = supabase.table("meal_posts").select("id, user_id, visibility").eq("id", payload.post_id).limit(1).execute().data or []
    if not post_rows:
        raise HTTPException(status_code=404, detail="Post not found")

    friend_ids = get_friend_user_ids(user_id)
    post = post_rows[0]
    if not can_user_view_post(post, user_id, friend_ids):
        raise HTTPException(status_code=403, detail="Forbidden")

    created = supabase.table("meal_post_comments").insert({
        "post_id": payload.post_id,
        "user_id": user_id,
        "body": body,
    }).execute().data
    return JSONResponse(created[0], status_code=201)


@app.get("/community/feed")
def get_community_feed(x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    friend_ids = get_friend_user_ids(user_id)
    supabase = get_supabase()
    visible_user_ids = [user_id, *friend_ids]

    menus = supabase.table("menus").select("*").in_("user_id", visible_user_ids).eq("is_public", True).order("created_at", desc=True).limit(12).execute().data or []
    menu_ids = [menu["id"] for menu in menus]
    items = supabase.table("menu_items").select("*, food:foods(*)").in_("menu_id", menu_ids).execute().data or [] if menu_ids else []
    posts = supabase.table("meal_posts").select("*").in_("user_id", visible_user_ids).in_("visibility", ["friends", "public", "private"]).order("created_at", desc=True).limit(20).execute().data or []
    visible_posts = [post for post in posts if can_user_view_post(post, user_id, friend_ids)]
    post_ids = [post["id"] for post in visible_posts]
    comments = supabase.table("meal_post_comments").select("*").in_("post_id", post_ids).order("created_at").execute().data or [] if post_ids else []
    profile_ids = list({*visible_user_ids, *[comment["user_id"] for comment in comments]})
    profiles = supabase.table("user_profiles").select("id, email, full_name, avatar_url").in_("id", profile_ids).execute().data or [] if profile_ids else []
    profiles_by_id = {profile["id"]: profile for profile in profiles}
    comments_by_post_id: Dict[str, List[Dict[str, Any]]] = {}
    for comment in comments:
        comments_by_post_id.setdefault(comment["post_id"], []).append({
            "comment": comment,
            "profile": profiles_by_id.get(comment["user_id"]),
        })
    return {
        "menus": [
            {
                "menu": menu,
                "items": [item for item in items if item["menu_id"] == menu["id"]],
                "profile": profiles_by_id.get(menu["user_id"]),
            }
            for menu in menus
        ],
        "posts": [
            {
                "post": post,
                "profile": profiles_by_id.get(post["user_id"]),
                "comments": comments_by_post_id.get(post["id"], []),
            }
            for post in visible_posts
        ],
    }


@app.get("/foods")
def get_foods(q: str = "", category: Optional[str] = None) -> List[Dict[str, Any]]:
    supabase = get_supabase()
    query = supabase.table("foods").select("*")
    if q:
        query = query.or_(f'name.ilike.%{q}%,aliases.cs.{{"{q}"}}')
    if category:
        query = query.eq("category", category)
    return query.order("name").limit(50).execute().data or []


@app.post("/foods")
async def create_food(request: Request, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    require_user(x_user_id)
    body = await request.json()
    if not str(body.get("name", "")).strip() or not body.get("category"):
        raise HTTPException(status_code=400, detail="name and category are required")
    supabase = get_supabase()
    data = supabase.table("foods").insert({
        "name": str(body.get("name")).strip(),
        "aliases": body.get("aliases") or [],
        "category": body["category"],
        "serving_size_g": float(body.get("serving_size_g") or 100),
        "serving_label": body.get("serving_label") or "1 serving (100g)",
        "calories": float(body.get("calories") or 0),
        "protein_g": float(body.get("protein_g") or 0),
        "carbs_g": float(body.get("carbs_g") or 0),
        "fat_g": float(body.get("fat_g") or 0),
        "fiber_g": float(body.get("fiber_g") or 0),
        "iron_mg": float(body.get("iron_mg") or 0),
        "calcium_mg": float(body.get("calcium_mg") or 0),
        "vitamin_c_mg": float(body.get("vitamin_c_mg") or 0),
    }).execute().data
    return JSONResponse(data[0], status_code=201)


@app.get("/foods/ingredients")
def get_food_ingredients(ids: str = Query(default="")) -> List[Dict[str, Any]]:
    food_ids = [value for value in ids.split(",") if value]
    if not food_ids:
        return []
    supabase = get_supabase()
    return supabase.table("food_ingredients").select("*").in_("food_id", food_ids).execute().data or []


@app.post("/foods/ai-suggest")
async def ai_suggest_food(request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    require_user(x_user_id)
    body = await request.json()
    name = str(body.get("name", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="Food name is required")
    result = generate_json(
        "You are a nutrition expert for Indian foods.",
        f'Given food: "{name}". Return JSON with fields name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg. Category must be one of {", ".join(CATEGORIES)}.',
    )
    category = result.get("category") if result.get("category") in CATEGORIES else "snack"
    return {
        "name": str(result.get("name") or name).strip(),
        "aliases": [str(item).strip() for item in result.get("aliases", []) if str(item).strip()],
        "category": category,
        "serving_size_g": float(result.get("serving_size_g") or 100),
        "serving_label": str(result.get("serving_label") or "1 serving (100g)").strip(),
        "calories": float(result.get("calories") or 0),
        "protein_g": float(result.get("protein_g") or 0),
        "carbs_g": float(result.get("carbs_g") or 0),
        "fat_g": float(result.get("fat_g") or 0),
        "fiber_g": float(result.get("fiber_g") or 0),
        "iron_mg": float(result.get("iron_mg") or 0),
        "calcium_mg": float(result.get("calcium_mg") or 0),
        "vitamin_c_mg": float(result.get("vitamin_c_mg") or 0),
    }


@app.get("/child-profiles")
def get_child_profiles(x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    profiles = supabase.table("child_profiles").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data or []
    if not profiles:
        return {"profiles": []}
    measurements = supabase.table("growth_measurements").select("*").in_("child_profile_id", [profile["id"] for profile in profiles]).order("recorded_at", desc=True).execute().data or []
    by_profile: Dict[str, List[Dict[str, Any]]] = {}
    for measurement in measurements:
        by_profile.setdefault(measurement["child_profile_id"], []).append(measurement)
    return {"profiles": [{**profile, "measurements": by_profile.get(profile["id"], [])} for profile in profiles]}


@app.post("/child-profiles")
async def create_child_profile(request: Request, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    body = await request.json()
    name = str(body.get("name", "")).strip()
    birth_date = str(body.get("birth_date", "")).strip()
    if not name or not birth_date:
        raise HTTPException(status_code=400, detail="name and birth_date are required")
    supabase = get_supabase()
    data = supabase.table("child_profiles").insert({
        "user_id": user_id,
        "name": name,
        "birth_date": birth_date,
        "sex": body.get("sex") if body.get("sex") in {"female", "male", "unspecified"} else "unspecified",
        "dietary_preferences": parse_csv_field(body.get("dietary_preferences")),
        "allergies": parse_csv_field(body.get("allergies")),
        "likes": parse_csv_field(body.get("likes")),
        "dislikes": parse_csv_field(body.get("dislikes")),
        "health_goals": parse_csv_field(body.get("health_goals")),
    }).execute().data
    return JSONResponse(data[0], status_code=201)


@app.post("/child-profiles/{profile_id}/measurements")
async def add_measurement(profile_id: str, request: Request, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    profile = supabase.table("child_profiles").select("id").eq("id", profile_id).eq("user_id", user_id).execute().data
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    body = await request.json()
    data = supabase.table("growth_measurements").insert({
        "child_profile_id": profile_id,
        "recorded_at": body.get("recorded_at"),
        "height_cm": float(body["height_cm"]) if body.get("height_cm") else None,
        "weight_kg": float(body["weight_kg"]) if body.get("weight_kg") else None,
        "notes": str(body["notes"]) if body.get("notes") else None,
    }).execute().data
    return JSONResponse(data[0], status_code=201)


@app.get("/menus")
def get_menus(x_user_id: Optional[str] = Header(default=None)) -> List[Dict[str, Any]]:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    return supabase.table("menus").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data or []


@app.post("/menus")
async def create_menu(payload: MenuCreatePayload, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    if payload.age_group not in ALLOWED_AGE_GROUPS:
        raise HTTPException(status_code=400, detail="invalid age_group")
    if payload.dietary_filter and payload.dietary_filter not in DIETARY_FILTERS:
        raise HTTPException(status_code=400, detail="invalid dietary_filter")
    supabase = get_supabase()
    inserted = supabase.table("menus").insert({
        "user_id": user_id,
        "title": payload.title,
        "description": payload.description or "",
        "age_group": payload.age_group,
        "child_profile_id": payload.child_profile_id,
        "dietary_constraints": payload.dietary_constraints or [],
        "planning_prompt": payload.ai_prompt,
        "is_public": False,
        "share_slug": None,
    }).execute().data
    menu = inserted[0]
    foods = supabase.table("foods").select("id, category, name, aliases").order("name").execute().data or []
    filtered_foods = filter_foods_by_diet(foods, payload.dietary_filter)
    if (payload.ai_prompt or payload.auto_fill) and not has_enough_food_variety(filtered_foods):
        supabase.table("menus").delete().eq("id", menu["id"]).execute()
        raise HTTPException(status_code=400, detail="Your foods library does not have enough variety yet for AI planning. Seed data/foods-seed.sql into Supabase or add more foods across grains, legumes, vegetables, dairy, fruit, protein, and snacks.")
    if payload.ai_prompt:
        evidence = retrieve_nutrition_evidence(f"{payload.ai_prompt} {payload.age_group} {' '.join(payload.dietary_constraints or [])}")
        food_catalog = "\n".join(f"{food['name']} [{food['category']}]" + (f" aliases: {', '.join(food.get('aliases', []))}" if food.get("aliases") else "") for food in filtered_foods)
        ai_menu = generate_json(
            "You create weekly meal plans for children. Use only foods from the available food list. Balance familiarity and variety. Avoid making medical claims.",
            f"Create a weekly meal plan for this request.\nTitle: {payload.title}\nDescription: {payload.description or ''}\nAge group: {payload.age_group}\nParent request: {payload.ai_prompt}\nDietary constraints: {', '.join(payload.dietary_constraints or []) or 'none'}\n\nAvailable foods. Use these names exactly for food_name:\n{food_catalog}\n\nGrounding evidence:\n{format_evidence_for_prompt(evidence)}\n\nReturn JSON with title, description, nutrition_focus, follow_up_questions, and meals. Meals must cover days 1-7 and breakfast, lunch, dinner, snack. food_name must exactly match one item from the available foods list.",
        )
        resolved = resolve_ai_menu_to_items(
            menu["id"],
            payload.age_group,
            filtered_foods,
            normalize_ai_meals(ai_menu.get("meals", [])),
        )
        if resolved:
            supabase.table("menu_items").insert(resolved).execute()
        supabase.table("menus").update({"title": ai_menu.get("title") or payload.title, "description": ai_menu.get("description") or payload.description or ""}).eq("id", menu["id"]).execute()
        return JSONResponse({
            **menu,
            "title": ai_menu.get("title") or payload.title,
            "description": ai_menu.get("description") or payload.description or "",
            "nutrition_focus": ai_menu.get("nutrition_focus", []),
            "follow_up_questions": ai_menu.get("follow_up_questions", []),
            "matched_meals": len(resolved),
            "warning": "Some AI meal names did not map cleanly, so fallback meals were used to complete the weekly calendar." if len(resolved) < 28 else None,
        }, status_code=201)
    if payload.auto_fill:
        suggested = build_suggested_items(menu["id"], payload.age_group, filtered_foods)
        if suggested:
            supabase.table("menu_items").insert(suggested).execute()
        else:
            return JSONResponse({**menu, "warning": "No foods matched the selected dietary filter, so menu was created empty."}, status_code=201)
    return JSONResponse(menu, status_code=201)


@app.get("/menus/{menu_id}")
def get_menu(menu_id: str, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    supabase = get_supabase()
    result = supabase.table("menus").select("*").eq("id", menu_id).execute().data
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    menu = result[0]
    if not menu["is_public"] and menu["user_id"] != x_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    items = supabase.table("menu_items").select("*, food:foods(*)").eq("menu_id", menu_id).execute().data or []
    return {"menu": menu, "items": items}


@app.patch("/menus/{menu_id}")
async def update_menu(menu_id: str, request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    existing = supabase.table("menus").select("user_id, share_slug").eq("id", menu_id).execute().data
    if not existing or existing[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    body = await request.json()
    updates: Dict[str, Any] = {}
    for field in ["title", "description"]:
        if field in body:
            updates[field] = body[field]
    if "age_group" in body:
        if body["age_group"] not in ALLOWED_AGE_GROUPS:
            raise HTTPException(status_code=400, detail="invalid age_group")
        updates["age_group"] = body["age_group"]
    if "is_public" in body:
        updates["is_public"] = body["is_public"]
        if body["is_public"] and not existing[0]["share_slug"]:
            updates["share_slug"] = os.urandom(5).hex()
    if updates:
        supabase.table("menus").update(updates).eq("id", menu_id).execute()
    if "items" in body:
        supabase.table("menu_items").delete().eq("menu_id", menu_id).execute()
        items = body["items"] or []
        if items:
            supabase.table("menu_items").insert([
                {"menu_id": menu_id, "food_id": item["food_id"], "day": item["day"], "meal_type": item["meal_type"], "servings": item["servings"]}
                for item in items
            ]).execute()
    updated = supabase.table("menus").select("*").eq("id", menu_id).execute().data
    return updated[0]


@app.delete("/menus/{menu_id}")
def delete_menu(menu_id: str, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, bool]:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    existing = supabase.table("menus").select("user_id").eq("id", menu_id).execute().data
    if not existing or existing[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    supabase.table("menus").delete().eq("id", menu_id).execute()
    return {"success": True}


@app.post("/menus/{menu_id}/copy")
def copy_menu(menu_id: str, x_user_id: Optional[str] = Header(default=None)) -> JSONResponse:
    user_id = require_user(x_user_id)
    supabase = get_supabase()
    original = supabase.table("menus").select("*").eq("id", menu_id).execute().data
    if not original:
        raise HTTPException(status_code=404, detail="Menu not found")
    menu = original[0]
    if not menu["is_public"] and menu["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    created = supabase.table("menus").insert({
        "user_id": user_id,
        "title": f"{menu['title']} (Copy)",
        "description": menu["description"],
        "age_group": menu["age_group"],
        "child_profile_id": None,
        "dietary_constraints": menu.get("dietary_constraints", []),
        "planning_prompt": menu.get("planning_prompt"),
        "is_public": False,
        "share_slug": None,
    }).execute().data[0]
    original_items = supabase.table("menu_items").select("*").eq("menu_id", menu_id).execute().data or []
    if original_items:
        supabase.table("menu_items").insert([
            {"menu_id": created["id"], "food_id": item["food_id"], "day": item["day"], "meal_type": item["meal_type"], "servings": item["servings"]}
            for item in original_items
        ]).execute()
    return JSONResponse(created, status_code=201)


@app.post("/ai/ask")
async def ai_ask(request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    require_user(x_user_id)
    body = await request.json()
    question = str(body.get("question", "")).strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    age_context = str(body.get("age_context", "")).strip()
    constraints = body.get("constraints") or []
    evidence = retrieve_nutrition_evidence(f"{question} {age_context} {' '.join(constraints if isinstance(constraints, list) else [str(constraints)])}")
    result = generate_json(
        "You are a pediatric meal planning assistant. Be careful, practical, and cite only the retrieved evidence as sources. Avoid diagnosis. Mention when an answer is an inference.",
        f"Answer this parent nutrition question in plain language.\nQuestion: {question}\nAge context: {age_context or 'not provided'}\nDietary constraints: {', '.join(constraints) if isinstance(constraints, list) else str(constraints) or 'none provided'}\n\nUse the retrieved evidence below to ground the answer.\n{format_evidence_for_prompt(evidence)}\n\nReturn JSON with answer and follow_up_questions.",
    )
    return {
        **result,
        "sources": [{"title": doc["title"], "source": doc["source"], "url": doc["source_url"]} for doc in evidence],
    }


@app.post("/ai/leftovers")
async def ai_leftovers(request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    require_user(x_user_id)
    body = await request.json()
    ingredients = str(body.get("ingredients", "")).strip()
    if not ingredients:
        raise HTTPException(status_code=400, detail="ingredients are required")
    constraints = str(body.get("constraints", "")).strip()
    return generate_json(
        "You are a kid-friendly meal planner. Create simple leftover ideas for busy parents. Prefer familiar textures and flexible swaps.",
        f"You have these leftovers or ingredients: {ingredients}\nDietary constraints: {constraints or 'none'}\nReturn JSON with meals and follow_up_questions.",
    )


@app.post("/ai/food-recognition")
async def ai_food_recognition(request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    require_user(x_user_id)
    body = await request.json()
    image = str(body.get("image", "")).strip()
    if not image:
        raise HTTPException(status_code=400, detail="image is required")
    client = get_openai()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        max_tokens=1200,
        messages=[
            {"role": "system", "content": "You identify kid meals from images. Estimate cautiously and say when uncertain. Return only JSON."},
            {"role": "user", "content": [
                {"type": "text", "text": "Identify the meal, list likely ingredients, estimate rough nutrition for one child portion, and suggest 3 follow-up questions. Return JSON with meal_name, confidence_note, identified_foods, estimated_nutrition, follow_up_questions."},
                {"type": "image_url", "image_url": {"url": image}},
            ]},
        ],
    )
    return json.loads(response.choices[0].message.content or "{}")


@app.post("/ai/nutrition-feedback")
async def ai_nutrition_feedback(request: Request, x_user_id: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user_id = require_user(x_user_id)
    body = await request.json()
    menu_id = str(body.get("menuId", "")).strip()
    if not menu_id:
        raise HTTPException(status_code=400, detail="menuId is required")
    supabase = get_supabase()
    menu_result = supabase.table("menus").select("*").eq("id", menu_id).eq("user_id", user_id).execute().data
    if not menu_result:
        raise HTTPException(status_code=404, detail="Menu not found")
    menu = menu_result[0]
    items = supabase.table("menu_items").select("*, food:foods(*)").eq("menu_id", menu_id).execute().data or []
    if not items:
        raise HTTPException(status_code=400, detail="Menu has no meals yet")
    average = calc_weekly_average(items)
    target = RDA[menu["age_group"]]
    percent = {
        "calories": round((average["calories"] / target["calories"]) * 100),
        "protein": round((average["protein"] / target["protein"]) * 100),
        "iron": round((average["iron"] / target["iron"]) * 100),
        "calcium": round((average["calcium"] / target["calcium"]) * 100),
        "vitaminC": round((average["vitaminC"] / target["vitaminC"]) * 100),
        "fiber": round((average["fiber"] / target["fiber"]) * 100),
    }
    evidence = retrieve_nutrition_evidence(f"{menu['age_group']} nutrition gaps")
    result = generate_json(
        "You are a pediatric nutrition assistant. Use the nutrient percentages and retrieved evidence. Do not diagnose. Be concrete and use kid-friendly foods.",
        f"Menu title: {menu['title']}\nAge group: {menu['age_group']}\nWeekly average nutrients: {json.dumps(average)}\nTarget nutrients: {json.dumps(target)}\nPercent of target: {json.dumps(percent)}\nGrounding evidence:\n{format_evidence_for_prompt(evidence)}\nReturn JSON with summary, alerts, wins, follow_up_questions.",
    )
    return {
        **result,
        "computed_percentages": percent,
        "sources": [{"title": doc["title"], "source": doc["source"], "url": doc["source_url"]} for doc in evidence],
    }


@app.exception_handler(HTTPException)
def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)
