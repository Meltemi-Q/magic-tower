import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = fileURLToPath(new URL(".", import.meta.url));
const preferredPort = Number(process.env.PORT) || 8787;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

startServer(preferredPort);

function startServer(port) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
      const pathname = decodeURIComponent(requestUrl.pathname);
      const target = resolveSafePath(pathname === "/" ? "/index.html" : pathname);

      if (!target) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const info = await stat(target);
      const filePath = info.isDirectory() ? join(target, "index.html") : target;

      if (!existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "no-store"
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < preferredPort + 20) {
      startServer(port + 1);
      return;
    }

    console.error(error.message);
    process.exit(1);
  });

  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`Magic Tower running at ${url}`);
    if (!process.env.NO_OPEN) {
      openBrowser(url);
    }
  });
}

function resolveSafePath(pathname) {
  const target = normalize(join(root, pathname));
  const rel = relative(root, target);
  return rel && !rel.startsWith("..") && !rel.includes("..\\") ? target : null;
}

function openBrowser(url) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.unref();
}
