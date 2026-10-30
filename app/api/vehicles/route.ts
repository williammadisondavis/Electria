import { readFile } from "node:fs/promises";
import { join } from "node:path";

function parseRow(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export async function GET() {
  const csv = await readFile(
    join(process.cwd(), "vehicles.csv"),
    "utf8"
  );

  const [header, ...rows] = csv.trim().split(/\r?\n/);
  const columns = parseRow(header);

  const vehicles = rows.map((row) =>
    Object.fromEntries(
      parseRow(row).map((value, i) => [columns[i], value])
    )
  );

  return Response.json(vehicles);
}
