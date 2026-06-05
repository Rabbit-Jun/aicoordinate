// design-ref/assets/*.png → web/public/app-mockup/*.webp
// 긴 변 800px 이하 + webp(q=78). 1회성 자산 변환 스크립트.
import { readdir, mkdir, stat } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../../design-ref/assets");
const OUT = join(__dirname, "../public/app-mockup");

const MAX_LONG_EDGE = 800;
const WEBP_QUALITY = 78;

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC)).filter(
    (f) => f.endsWith(".png") && !f.includes("Zone.Identifier"),
  );
  files.sort();

  let totalIn = 0;
  let totalOut = 0;
  const rows = [];

  for (const file of files) {
    const inPath = join(SRC, file);
    const outName = `${basename(file, extname(file))}.webp`;
    const outPath = join(OUT, outName);

    const inStat = await stat(inPath);
    totalIn += inStat.size;

    const meta = await sharp(inPath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const longEdge = Math.max(w, h);
    const resize =
      longEdge > MAX_LONG_EDGE
        ? w >= h
          ? { width: MAX_LONG_EDGE }
          : { height: MAX_LONG_EDGE }
        : null;

    let pipe = sharp(inPath);
    if (resize) pipe = pipe.resize(resize);
    await pipe.webp({ quality: WEBP_QUALITY }).toFile(outPath);

    const outStat = await stat(outPath);
    totalOut += outStat.size;
    rows.push({
      file,
      out: outName,
      inKB: Math.round(inStat.size / 1024),
      outKB: Math.round(outStat.size / 1024),
      from: `${w}×${h}`,
      to: resize ? `${resize.width ?? "auto"}×${resize.height ?? "auto"}` : "(원본)",
    });
  }

  // 보고
  console.log(`변환 ${rows.length}장 — ${SRC} → ${OUT}`);
  console.log(
    `총량: ${(totalIn / 1024 / 1024).toFixed(2)}MB → ${(totalOut / 1024 / 1024).toFixed(2)}MB (${Math.round((totalOut / totalIn) * 100)}%)`,
  );
  console.log("");
  console.log("file → out (KB → KB | from → to)");
  for (const r of rows) {
    console.log(
      `  ${r.file} → ${r.out}  (${r.inKB} → ${r.outKB} | ${r.from} → ${r.to})`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
