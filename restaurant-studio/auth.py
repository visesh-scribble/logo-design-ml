"""
Restaurant owner accounts: password hashing, login sessions (cookie) and a simple login-attempt limit.
Standard library only.
"""

import hashlib
import hmac
import re
import secrets
import threading
import time
from datetime import datetime, timedelta, timezone
from http.cookies import SimpleCookie

COOKIE = "rs_session"
SESSION_DAYS = 30
PBKDF2_ROUNDS = 200_000
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Failed logins per email: at most 10 in 15 minutes
_FAILS = {}
_FAILS_LOCK = threading.Lock()
MAX_FAILS, FAIL_WINDOW = 10, 15 * 60


def normalize_email(email):
    return str(email or "").strip().lower()[:200]


def validate_signup(email, password):
    """Returns an error message, or '' when the email and password are acceptable."""
    if not EMAIL_RE.match(email):
        return "Please enter a valid email address."
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if len(password) > 200:
        return "Password is too long."
    return ""


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), PBKDF2_ROUNDS).hex()
    return digest, salt


def check_password(password, pw_hash, salt):
    digest, _ = hash_password(password, salt)
    return hmac.compare_digest(digest, pw_hash)


def too_many_fails(email):
    now = time.time()
    with _FAILS_LOCK:
        recent = [t for t in _FAILS.get(email, []) if now - t < FAIL_WINDOW]
        _FAILS[email] = recent
        return len(recent) >= MAX_FAILS


def record_fail(email):
    with _FAILS_LOCK:
        _FAILS.setdefault(email, []).append(time.time())


def clear_fails(email):
    with _FAILS_LOCK:
        _FAILS.pop(email, None)


def _token_hash(token):
    # Only a hash of the token is stored, so a database leak can't be used to log in
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def start_session(store, owner_id):
    """Creates a session and returns the Set-Cookie value."""
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    store.create_session(_token_hash(token), owner_id, expires)
    return token


def _is_https(handler):
    return (handler.headers.get("X-Forwarded-Proto") or "").split(",")[0].strip() == "https"


def session_cookie(handler, token):
    parts = [f"{COOKIE}={token}", "Path=/", "HttpOnly", "SameSite=Lax", f"Max-Age={SESSION_DAYS * 86400}"]
    if _is_https(handler):
        parts.append("Secure")
    return "; ".join(parts)


def clear_cookie(handler):
    parts = [f"{COOKIE}=", "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"]
    if _is_https(handler):
        parts.append("Secure")
    return "; ".join(parts)


def read_token(handler):
    raw = handler.headers.get("Cookie")
    if not raw:
        return ""
    try:
        jar = SimpleCookie(raw)
    except Exception:
        return ""
    return jar[COOKIE].value if COOKIE in jar else ""


def current_owner(handler, store):
    """The logged-in owner ({id, email, ...}) for this request, or None."""
    token = read_token(handler)
    if not token:
        return None
    sess = store.get_session(_token_hash(token))
    if not sess:
        return None
    return store.get_owner(sess["owner_id"])


def end_session(handler, store):
    token = read_token(handler)
    if token:
        store.delete_session(_token_hash(token))
