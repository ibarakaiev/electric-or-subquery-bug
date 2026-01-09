# Electric OR + Subquery Bug Reproduction

This repo reproduces a bug where Electric sends `move-out` but not `move-in` when a row stops matching one branch of an OR condition but still matches another branch.

## The Bug

When a shape's WHERE clause has `A OR B` where A contains a subquery referencing another table:

```sql
WHERE category_id IN (SELECT category_id FROM user_categories WHERE user_id = 'USER_ID')
   OR owner_id = 'USER_ID'
```

If data in `user_categories` changes such that:
- Condition A no longer matches (subquery returns empty)
- Condition B still matches (`owner_id = 'USER_ID'`)

Electric sends `move-out` for the row but never sends `move-in`, even though the row should remain in the shape.

## Quick Start

```bash
bun install
docker compose up -d
bun run db:push
bun run seed
bun dev
```

Then open http://localhost:3000

## Steps to Reproduce

1. Open http://localhost:3000
2. Observe that "Test Item" is visible (it matches both OR conditions)
3. Click "Remove Category Subscription" button
4. Observe the event log shows `move-out`
5. **Bug:** Item disappears even though it still matches `owner_id = USER_ID`
6. Refresh the page - item reappears (proves the row should still be in the shape)

## Expected Behavior

After removing the category subscription:
- Row should remain visible because it still matches `owner_id = 'USER_ID'`
- No `move-out` should be sent, OR `move-out` should be followed by `move-in`

## Actual Behavior

- `move-out` is sent
- Row disappears from the client
- No `move-in` is sent
- Row only reappears after page refresh (full resync)

## Workaround

Split the shape into two separate shapes to avoid combining a subquery with a sibling OR condition:

```sql
-- Shape 1: Items in user's subscribed categories
WHERE category_id IN (SELECT category_id FROM user_categories WHERE user_id = 'USER_ID')

-- Shape 2: Items owned by user
WHERE owner_id = 'USER_ID'
```
