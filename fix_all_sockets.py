import os

client_socket_dir = "/home/buitanphat/Desktop/WorkSpace_Linux/AIO/EduLearn-Client/lib/socket"
socket_files = [f for f in os.listdir(client_socket_dir) if f.endswith(".ts")]

fix_logic = """  private getSocketUrl(): string {
    if (typeof window === "undefined") return "";
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.edulearning.io.vn/api";
    let socketUrl = envUrl || apiUrl;
    try {
      if (typeof socketUrl === "string" && socketUrl.includes("//") && !socketUrl.includes("://")) {
        socketUrl = socketUrl.replace("//", "://");
      }
      const url = new URL(socketUrl.includes("://") ? socketUrl : `https://${socketUrl}`);
      console.warn(`[Socket] Connecting to origin: ${url.origin}`);
      return url.origin;
    } catch (e) {
      return socketUrl.split("/api")[0];
    }
  }"""

for filename in socket_files:
    filepath = os.path.join(client_socket_dir, filename)
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    found = False
    
    for line in lines:
        if "private getSocketUrl(): string {" in line:
            new_lines.append(fix_logic + "\n")
            skip = True
            found = True
            continue
        if skip and line.strip() == "}":
            skip = False
            continue
        if not skip:
            new_lines.append(line)
            
    if found:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"✅ Fixed {filename}")
