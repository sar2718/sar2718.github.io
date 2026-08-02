import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

async function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const requestedPath = path.resolve(root, relativePath);
  if (requestedPath !== root && !requestedPath.startsWith(`${root}${path.sep}`)) return null;

  try {
    return (await stat(requestedPath)).isDirectory() ? path.join(requestedPath, "index.html") : requestedPath;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  try {
    const requestedPath = await resolveRequestPath(request.url ?? "/");
    const filePath = requestedPath ?? path.join(root, "404.html");
    const body = await readFile(filePath);
    response.writeHead(requestedPath ? 200 : 404, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Set PORT to another value and try again.`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}`);
});
