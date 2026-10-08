import fs from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";
import { parse } from "parse5";

function preserveText(original, formatted) {
  const edits = [];
  const groups = (node) => {
    const elements = [];
    const gaps = [[]];
    for (const child of (node.content ?? node).childNodes ?? []) {
      if (child.nodeName === "#text") gaps.at(-1).push(child);
      else {
        elements.push(child);
        gaps.push([]);
      }
    }
    return { elements, gaps };
  };
  function walk(before, after) {
    if (before.nodeName !== after.nodeName)
      throw new Error("HTML structure changed during formatting");
    for (const name of Object.keys(before.sourceCodeLocation?.attrs ?? {})) {
      const source = before.sourceCodeLocation.attrs[name];
      const target = after.sourceCodeLocation?.attrs?.[name];
      if (!target) throw new Error('HTML attribute removed during formatting');
      edits.push({ start: target.startOffset, end: target.endOffset, text: original.slice(source.startOffset, source.endOffset) });
    }
    if (["script", "style"].includes(before.tagName)) return;
    const a = groups(before);
    const b = groups(after);
    if (a.elements.length !== b.elements.length)
      throw new Error("HTML children changed during formatting");
    for (let i = 0; i < a.gaps.length; i++) {
      const source = a.gaps[i]
        .map((node) =>
          original.slice(
            node.sourceCodeLocation.startOffset,
            node.sourceCodeLocation.endOffset,
          ),
        )
        .join("");
      const targets = b.gaps[i];
      if (targets.length) {
        edits.push({
          start: targets[0].sourceCodeLocation.startOffset,
          end: targets.at(-1).sourceCodeLocation.endOffset,
          text: source,
        });
      } else if (source) {
        const offset =
          b.elements[i]?.sourceCodeLocation?.startOffset ??
          after.sourceCodeLocation?.endTag?.startOffset;
        if (offset == null)
          throw new Error("Cannot preserve HTML text position");
        edits.push({ start: offset, end: offset, text: source });
      }
    }
    a.elements.forEach((node, i) => walk(node, b.elements[i]));
  }
  walk(
    parse(original, { sourceCodeLocationInfo: true }),
    parse(formatted, { sourceCodeLocationInfo: true }),
  );
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    formatted =
      formatted.slice(0, edit.start) + edit.text + formatted.slice(edit.end);
  }
  return formatted;
}

export async function formatPageSources(directory) {
  let count = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      count += await formatPageSources(file);
    } else if (entry.name.endsWith(".html")) {
      const html = await fs.readFile(file, "utf8");
      const formatted = await format(html, {
        parser: "html",
        printWidth: 100,
        tabWidth: 2,
        htmlWhitespaceSensitivity: "strict",
      });
      await fs.writeFile(file, preserveText(html, formatted));
      count++;
    }
  }
  return count;
}
