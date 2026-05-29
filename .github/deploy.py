#!/usr/bin/env python3
"""Deploy heteronym to Namecheap cPanel via API."""
import json, os, sys, urllib.request, urllib.parse

CPANEL_SERVER = os.environ["CPANEL_SERVER"]
CPANEL_USER = os.environ["CPANEL_USER"]
AUTH = f"cpanel {CPANEL_USER}:{CPANEL_TOKEN}"
API = f"https://{CPANEL_SERVER}:2083/execute/Fileman"
PUBLIC_HTML = "/home/heteutzw/public_html"
APP_DIR = "/home/heteutzw/heteronym"


def upload(local, remote_dir):
    boundary = "----B" + str(abs(hash(local)) % 10**10)
    name = os.path.basename(local)
    with open(local) as f:
        content = f.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file-0"; filename="{name}"\r\n'
        f"Content-Type: text/plain\r\n\r\n{content}\r\n"
        f"--{boundary}--\r\n"
    ).encode()
    url = f"{API}/upload_files?dir={urllib.parse.quote(remote_dir)}"
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": AUTH,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
    return result["data"]["uploads"][0]["status"] == 1


ok = True

print("::group::Deploying frontend")
dist = "frontend/dist"
for root, dirs, files in os.walk(dist):
    for f in files:
        local = os.path.join(root, f)
        rel = os.path.relpath(root, dist)
        rdir = PUBLIC_HTML if rel == "." else f"{PUBLIC_HTML}/{rel}"
        if upload(local, rdir):
            print(f"  OK  {rel}/{f}")
        else:
            print(f"::error::Failed {rel}/{f}")
            ok = False
print("::endgroup::")

print("::group::Deploying backend")
for f in ["main.py", "puzzles.csv", "requirements.txt", "heteronym_app.py"]:
    lp = f"backend/{f}"
    if os.path.exists(lp):
        if upload(lp, APP_DIR):
            print(f"  OK  {f}")
        else:
            print(f"::error::Failed {f}")
            ok = False
print("::endgroup::")

print("::group::Restarting Passenger")
try:
    data = urllib.parse.urlencode({
        "dir": f"{APP_DIR}/tmp",
        "file": "restart.txt",
        "content": "restart",
    }).encode()
    req = urllib.request.Request(
        f"{API}/save_file_content", data=data, headers={
            "Authorization": AUTH,
            "Content-Type": "application/x-www-form-urlencoded",
        })
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
    if result.get("status") == 1:
        print("  OK  Passenger restarted")
    else:
        print(f"::warning::Restart result: {result}")
except Exception as e:
    print(f"::warning::Restart error: {e}")
print("::endgroup::")

sys.exit(0 if ok else 1)
