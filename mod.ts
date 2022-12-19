import { getStdin } from "https://deno.land/x/get_stdin@v1.1.0/mod.ts";
import { Arguments } from "https://deno.land/x/allo_arguments@v6.0.4/mod.ts";
import linkify from "npm:linkifyjs@4.0.2";
import linkifyHTML from "npm:linkify-html@4.0.2";
import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm-noinit.ts";

interface Args {
  type?: string;
  delimit?: string;
  help: boolean;
}

try {
  await main(getArguments());
} catch (error) {
  Arguments.rethrowUnprintableException(error);
}

async function main(args: Args) {
  if (args.help) return;
  const value = await getStdin({ exitOnEnter: false });
  let output;
  switch (args.type) {
    case "html":
      output = await handleHTML(value);
      break;
    default:
      output = handlePlaintext(value);
      break;
  }

  Deno.stdout.write(
    new TextEncoder().encode(output.join(args.delimit ?? `\n`)),
  );
}

function getArguments(): Args {
  const info = [
    "This program receives text or HTML as input, and extracts the URLs.",
    "It outputs the URLs as a list delimited by newlines.",
  ];
  const args = new Arguments({
    ...Arguments.createHelpOptions(),
    "type": {
      shortName: "t",
      description: "Parse plaintext (default) or html",
      convertor: Arguments.stringConvertor,
    },
    "delimit": {
      shortName: "d",
      description: 'Define a delimiter, newline is default',
      convertor: Arguments.stringConvertor,
    },
  })
    .setDescription(info.join(`\n`));

  if (args.isHelpRequested()) args.triggerHelp();

  return args.getFlags();
}

function handlePlaintext(value: string): string[] {
  const links = [];
  for (const link of linkify.find(value)) {
    links.push(link.href);
  }
  return links;
}

async function handleHTML(value: string): Promise<string[]> {
  const results: string[] = [];
  const str = linkifyHTML(value);
  await initParser();
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, `text/html`);
  if (!doc) return [];
  const items = doc.body.getElementsByTagName(`a`);
  items.forEach((el) => {
    const href = el.getAttribute("href");
    if (href) results.push(href);
  });
  return results;
}
