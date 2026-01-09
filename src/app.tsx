import { createRoot } from "react-dom/client";
import { useShape } from "@electric-sql/react";

const USER_ID = "00000000-0000-0000-0000-000000000001";

interface Item {
  id: string;
  name: string;
  owner_id: string;
  category_id: string;
}

const WHERE_CLAUSE = `category_id IN (SELECT category_id FROM user_categories WHERE user_id = '${USER_ID}') OR owner_id = '${USER_ID}'`;

function App() {
  const { isLoading, data } = useShape<Item>({
    url: `http://localhost:3001/v1/shape`,
    params: {
      table: "items",
      where: WHERE_CLAUSE,
    },
  });

  const removeUserCategory = async () => {
    await fetch("/api/remove-category", { method: "POST" });
  };

  const restoreUserCategory = async () => {
    await fetch("/api/restore-category", { method: "POST" });
  };

  if (isLoading) {
    return <div style={{ fontFamily: "system-ui", padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Electric OR + Subquery Bug</h1>

      <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>The Bug</h3>
        <pre style={{ background: "#fff", padding: "0.5rem", overflow: "auto", fontSize: "0.8rem" }}>
{`WHERE category_id IN (SELECT ... FROM user_categories WHERE ...)  -- Condition A
   OR owner_id = 'USER_ID'                                         -- Condition B`}
        </pre>
        <p>If A stops matching but B still matches, Electric sends <code>move-out</code> but no <code>move-in</code>.</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={removeUserCategory} style={{ padding: "0.75rem 1.5rem", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Remove Category (triggers bug)
        </button>
        <button onClick={restoreUserCategory} style={{ padding: "0.75rem 1.5rem", background: "#44aa44", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Restore Category
        </button>
      </div>

      <h3>Items ({data.length})</h3>
      <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", minHeight: "100px" }}>
        {data.length === 0 ? (
          <p style={{ color: "#999" }}>No items. (BUG if you just clicked "Remove Category" - item should still show!)</p>
        ) : (
          data.map((item) => (
            <div key={item.id} style={{ background: "#fff", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}>
              <strong>{item.name}</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                owner_id: {item.owner_id} | category_id: {item.category_id}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "1rem", padding: "1rem", background: "#fffde7", borderRadius: "8px" }}>
        <strong>Expected:</strong> Item stays visible (matches owner_id)<br />
        <strong>Actual:</strong> Item disappears until page refresh
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
