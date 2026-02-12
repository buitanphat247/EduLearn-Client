import os

client_socket_dir = "/home/buitanphat/Desktop/WorkSpace_Linux/AIO/EduLearn-Client/lib/socket"
socket_files = [f for f in os.listdir(client_socket_dir) if f.endswith(".ts") and f != "types.ts"]

token_fix = """  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const { getCookie } = require("@/lib/utils/cookies");
      const token = getCookie("_at") || getCookie("access_token") || getCookie("token");
      if (token) return token;
      return localStorage.getItem("token") || localStorage.getItem("access_token");
    } catch (e) {
      return null;
    }
  }"""

for filename in socket_files:
    filepath = os.path.join(client_socket_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Nếu file chưa có getToken, ta thêm vào trước connect() hoặc cuối class
    if "getToken(): string | null" not in content:
        if "connect():" in content:
             content = content.replace("connect():", token_fix + "\n\n  connect():")
        elif "connect() {" in content:
             content = content.replace("connect() {", token_fix + "\n\n  connect() {")
    else:
        # Nếu có rồi thì thay thế bản cũ (fix lỗi script trước đó nếu có)
        import re
        content = re.sub(r"private getToken\(\): string \| null \{.*?\}", token_fix, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✅ Updated token logic in {filename}")
