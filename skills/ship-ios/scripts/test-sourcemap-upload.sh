#!/usr/bin/env bash
# Verifies the studio's source-map upload path end to end against a loopback stub.
# Runs the REAL upstream upload script (newrelic-react-native-agent's
# upload-react-native-sourcemap.swift) with the exact env + args ship-ios.sh
# uses, pointed at a local stub via SOURCEMAP_UPLOAD_URL. Nothing reaches New Relic.
#
# Usage:
#   test-sourcemap-upload.sh --tools-dir <dsym-upload-tools dir>
#
# Exits 0 when the upload succeeds and the stub saw a well-formed request,
# 1 on failure, 3 when macOS Xcode swift is unavailable.
#
# The --tools-dir is explicit so the test never assumes a checkout layout:
# pass a repo's node_modules/.../dsym-upload-tools, or any copy of it.

set -euo pipefail

TOOLS_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tools-dir) TOOLS_DIR="$2"; shift 2;;
    --tools-dir=*) TOOLS_DIR="${1#*=}"; shift;;
    *) echo "usage: test-sourcemap-upload.sh --tools-dir <dir>" >&2; exit 2;;
  esac
done
[[ -n "$TOOLS_DIR" ]] || { echo "usage: test-sourcemap-upload.sh --tools-dir <dir>" >&2; exit 2; }
[[ -f "$TOOLS_DIR/upload-react-native-sourcemap.swift" ]] || { echo "no upload script in $TOOLS_DIR" >&2; exit 2; }

if ! command -v xcrun >/dev/null 2>&1 || ! xcrun --sdk macosx swift --version >/dev/null 2>&1; then
  echo "SKIP: needs macOS Xcode swift (xcrun)"
  exit 3
fi

ROOT="$(mktemp -d)"
trap 'kill "$STUB_PID" 2>/dev/null; rm -rf "$ROOT"' EXIT

# Fixture app: the two plist values and the bundle files the script reads.
mkdir -p "$ROOT/products/Thames.app"
cat > "$ROOT/products/Thames.app/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleIdentifier</key><string>io.ponti.test</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
</dict>
</plist>
EOF
echo "console.log('fixture');" > "$ROOT/products/main.jsbundle"
cat > "$ROOT/main.jsbundle.map" <<'EOF'
{"version":3,"sources":["fixture.js"],"names":[],"mappings":"AAAA","file":"main.jsbundle"}
EOF

# Loopback stub: records the request, answers 200.
cat > "$ROOT/stub.py" <<'EOF'
import http.server, sys

out = sys.argv[1]
port_file = sys.argv[2]

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        with open(out, "wb") as f:
            f.write(f"{self.command} {self.path}\n".encode())
            f.write(f"Api-Key: {self.headers.get('Api-Key')}\n".encode())
            f.write(f"X-APP-LICENSE-KEY: {self.headers.get('X-App-License-Key')}\n".encode())
            f.write(body)
        payload = b'{"status":"ok"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
    def log_message(self, *args):
        pass

server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
with open(port_file, "w") as f:
    f.write(str(server.server_address[1]))
server.serve_forever()
EOF
python3 "$ROOT/stub.py" "$ROOT/request.bin" "$ROOT/port" &
STUB_PID=$!
for _ in $(seq 1 50); do [[ -s "$ROOT/port" ]] && break; sleep 0.1; done
PORT="$(cat "$ROOT/port")"

# Golden path: the exact env + args ship-ios.sh uses.
if ! CONFIGURATION=Release EFFECTIVE_PLATFORM_NAME=-iphoneos \
  SOURCEMAP_PATH="$ROOT/main.jsbundle.map" \
  BUILT_PRODUCTS_DIR="$ROOT/products" \
  INFOPLIST_PATH="Thames.app/Info.plist" \
  SOURCEMAP_UPLOAD_URL="http://127.0.0.1:$PORT" \
  /usr/bin/xcrun --sdk macosx swift "$TOOLS_DIR/upload-react-native-sourcemap.swift" \
    NRAK-TESTKEY0123456789 TESTAPPTOKEN >"$ROOT/run.log" 2>&1; then
  echo "FAIL: uploader exited non-zero"; tail -n 15 "$ROOT/run.log"; exit 1
fi
grep -q "uploaded successfully" "$ROOT/run.log" || { echo "FAIL: no success line"; tail -n 15 "$ROOT/run.log"; exit 1; }
grep -aq "POST /v1/react-native/sourcemaps" "$ROOT/request.bin" || { echo "FAIL: wrong endpoint"; exit 1; }
grep -aq "Api-Key: NRAK-TESTKEY0123456789" "$ROOT/request.bin" || { echo "FAIL: user key header missing"; exit 1; }
grep -aq "X-APP-LICENSE-KEY: TESTAPPTOKEN" "$ROOT/request.bin" || { echo "FAIL: app token header missing"; exit 1; }
grep -aq "sourcemapName" "$ROOT/request.bin" || { echo "FAIL: multipart fields missing"; exit 1; }
grep -aq "fixture.js" "$ROOT/request.bin" || { echo "FAIL: map content missing"; exit 1; }
echo "ok golden path: upload reached the stub well-formed"

# Failure path: a missing map must fail loudly, not upload garbage.
if CONFIGURATION=Release EFFECTIVE_PLATFORM_NAME=-iphoneos \
  SOURCEMAP_PATH="$ROOT/does-not-exist.map" \
  BUILT_PRODUCTS_DIR="$ROOT/products" \
  INFOPLIST_PATH="Thames.app/Info.plist" \
  SOURCEMAP_UPLOAD_URL="http://127.0.0.1:$PORT" \
  /usr/bin/xcrun --sdk macosx swift "$TOOLS_DIR/upload-react-native-sourcemap.swift" \
    NRAK-TESTKEY0123456789 TESTAPPTOKEN >"$ROOT/missing.log" 2>&1; then
  echo "FAIL: missing map should exit non-zero"; exit 1
fi
grep -q "Source map not found" "$ROOT/missing.log" || { echo "FAIL: missing map error unclear"; exit 1; }
echo "ok missing map: fails loudly"

echo "all source-map upload checks passed"
