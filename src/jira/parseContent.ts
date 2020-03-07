import { TextContent } from ".";

export default function parseContent(
  content: TextContent[] | undefined,
): string {
  return content ? content.map(c => parseContentBlock(c)).join("\n\n") : "";
}

function parseTextStyle(mark: { type: string }): string {
  const type = mark && mark.type;
  switch (type) {
    case "em":
      return "_";
    case "strong":
      return "**";
    case "code":
      return "`";
    default:
      return "";
  }
}

function parseContentBlock(content: TextContent): string {
  switch (content.type) {
    case "codeBlock": {
      if (content.content) {
        const code = content.content.map(c => c.text).join("\n");
        const lang = content.attrs ? content.attrs.language : "";
        return `\`\`\`${lang}\n${code}\n\`\`\``;
      }
    }
    case "text": {
      if (content.text) {
        let text = content.text;
        for (const mark of content.marks || []) {
          const style = parseTextStyle(mark);
          text = `${style}${text}${style}`;
        }
        return text;
      }
      return "";
    }
    case "mention": {
      return content.attrs ? `@${content.attrs.text}` : "";
    }
    case "hardBreak": {
      return "\n";
    }
    case "blockquote": {
      return content.content
        ? `> ${content.content.map(c => parseContentBlock(c)).join("")}`
        : "> ";
    }
    case "paragraph": {
      return content.content
        ? content.content.map(c => parseContentBlock(c)).join("")
        : "";
    }
    default: {
      if (content.text) {
        return content.text;
      } else if (content.attrs) {
        if (content.attrs.url) {
          const url = content.attrs.url;
          return url.match(/#icft=.+$/)
            ? `[${url.match(/#icft=(.+)$/)![1]}](${url})`
            : `<${url}>`;
        } else if (content.attrs.text) {
          return content.attrs.text;
        }
      }
      return "";
    }
  }
}