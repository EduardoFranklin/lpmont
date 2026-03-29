import { useRef, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Link, List, ListOrdered,
  Heading2, Heading3, Type, Undo, Redo, RemoveFormatting
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const ToolButton = ({
  icon: Icon,
  command,
  arg,
  label,
  onExec,
}: {
  icon: any;
  command?: string;
  arg?: string;
  label: string;
  onExec?: () => void;
}) => {
  const run = () => {
    if (onExec) {
      onExec();
    } else if (command) {
      document.execCommand(command, false, arg);
    }
  };
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      title={label}
      className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
  );
};

const RichTextEditor = ({ value, onChange, placeholder, minHeight = "160px" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  }, []);

  const insertLink = () => {
    const url = prompt("URL do link:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand("formatBlock", false, tag);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-0.5 pr-2 border-r border-border">
          <ToolButton icon={Heading2} label="Título H2" onExec={() => formatBlock("h2")} />
          <ToolButton icon={Heading3} label="Título H3" onExec={() => formatBlock("h3")} />
          <ToolButton icon={Type} label="Parágrafo" onExec={() => formatBlock("p")} />
        </div>
        <div className="flex items-center gap-0.5 px-2 border-r border-border">
          <ToolButton icon={Bold} command="bold" label="Negrito" />
          <ToolButton icon={Italic} command="italic" label="Itálico" />
          <ToolButton icon={Underline} command="underline" label="Sublinhado" />
        </div>
        <div className="flex items-center gap-0.5 px-2 border-r border-border">
          <ToolButton icon={List} command="insertUnorderedList" label="Lista" />
          <ToolButton icon={ListOrdered} command="insertOrderedList" label="Lista numerada" />
        </div>
        <div className="flex items-center gap-0.5 px-2 border-r border-border">
          <ToolButton icon={Link} label="Link" onExec={insertLink} />
        </div>
        <div className="flex items-center gap-0.5 pl-2">
          <ToolButton icon={Undo} command="undo" label="Desfazer" />
          <ToolButton icon={Redo} command="redo" label="Refazer" />
          <ToolButton icon={RemoveFormatting} command="removeFormat" label="Limpar formatação" />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder || "Escreva aqui..."}
        style={{ minHeight }}
        className="max-h-[500px] overflow-y-auto px-4 py-3 text-sm text-foreground focus:outline-none prose prose-sm prose-invert max-w-none
          [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/50
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
          [&_p]:mb-2 [&_p]:leading-relaxed [&_p]:text-foreground/80
          [&_a]:text-primary [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
          [&_li]:mb-1 [&_li]:text-foreground/80
          [&_strong]:text-foreground [&_strong]:font-bold
          [&_em]:italic"
      />
    </div>
  );
};

export default RichTextEditor;
