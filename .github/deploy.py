#!/usr/bin/env python3
"""Deploy heteronym to Namecheap cPanel via API."""
import json, os, sys, urllib.request, urllib.parse

svr = os.environ["CPANEL_SERVER"]
usr = os.environ["CPANEL_USER"]
tok = os.environ["CPANEL_TOKEN"]
auth_hdr = "cpanel " + usr + ":" + tok
api_url = "https://" + svr + ":2083/execute/Fileman"
pub_html = "/home/heteutzw/public_html"
app_dir = "/home/heteutzw/heteronym"


def upload(local, remote_dir):
    boundary = "----B" + str(abs(hash(local)) % 10**10)
    name = os.path.basename(local)
    with open(local, "rb") as f:
        content = f.read()
    body = (
        b"--" + boundary.encode() + b"\r\n"
        + b'Content-Disposition: form-data; name="file-0"; filename="' + name.encode() + b'"\r\n'
        + b"Content-Type: application/octet-stream\r\n\r\n"
        + content + b"\r\n"
        + b"--" + boundary.encode() + b"--\r\n"
    )
    url = api_url + "/upload_files?dir=" + urllib.parse.quote(remote_dir) + "&overwrite=1"
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": auth_hdr,
        "Content-Type": b"multipart/form-data; boundary=" + boundary.encode(),
    }, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
    ok = result["data"]["uploads"][0]["status"] == 1
    if not ok:
        print("::warning::Upload failed for " + name + ": " + str(result["data"]["uploads"][0].get("reason", "unknown")))
    return ok


ok = True

print("::group::Deploying frontend")
dist = "frontend/dist"
for root, dirs, files in os.walk(dist):
    for f in files:
        local = os.path.join(root, f)
        rel = os.path.relpath(root, dist)
        rdir = pub_html if rel == "." else pub_html + "/" + rel
        if upload(local, rdir):
            print("  OK  " + rel + "/" + f)
        else:
            print("::error::Failed " + rel + "/" + f)
            ok = False
print("::endgroup::")

print("::group::Deploying backend")
backend_files = ["main.py", "puzzles.csv", "requirements.txt", "heteronym_app.py"]
for f in backend_files:
    lp = "backend/" + f
    if os.path.exists(lp):
        if upload(lp, app_dir):
            print("  OK  " + f)
        else:
            print("::error::Failed " + f)
            ok = False
print("::endgroup::")

print("::group::Restarting Passenger")
try:
    db = urllib.parse.urlencode({
        "dir": app_dir + "/tmp",
        "file": "restart.txt",
        "content": "restart",
    }).encode()
    req = urllib.request.Request(
        api_url + "/save_file_content", data=db, headers={
            "Authorization": auth_hdr,
            "Content-Type": "application/x-www-form-urlencoded",
        })
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
    if result.get("status") == 1:
        print("  OK  Passenger restarted")
    else:
        print("::warning::Restart result: " + str(result))
except Exception as e:
    print("::warning::Restart error: " + str(e))
print("::endgroup::")

sys.exit(0 if ok else 1)
