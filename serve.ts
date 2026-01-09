import postgres from "postgres";

const client = postgres("postgresql://postgres:postgres@localhost:5432/electric_bug");

const USER_ID = "00000000-0000-0000-0000-000000000001";
const CATEGORY_ID = "00000000-0000-0000-0000-000000000002";

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve index.html
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("index.html"));
    }

    // API: Remove user category subscription (triggers the bug)
    if (url.pathname === "/api/remove-category" && req.method === "POST") {
      await client`DELETE FROM user_categories WHERE user_id = ${USER_ID} AND category_id = ${CATEGORY_ID}`;
      return Response.json({ message: "Removed user category subscription" });
    }

    // API: Restore user category subscription
    if (url.pathname === "/api/restore-category" && req.method === "POST") {
      await client`INSERT INTO user_categories (user_id, category_id) VALUES (${USER_ID}, ${CATEGORY_ID}) ON CONFLICT DO NOTHING`;
      return Response.json({ message: "Restored user category subscription" });
    }

    // Serve TypeScript/TSX files (transpiled)
    if (url.pathname.endsWith(".tsx") || url.pathname.endsWith(".ts")) {
      const result = await Bun.build({
        entrypoints: [`.${url.pathname}`],
        target: "browser",
      });

      if (result.success) {
        return new Response(result.outputs[0], {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log("Dev server running at http://localhost:3000");
console.log("Make sure Electric is running at http://localhost:3001");
