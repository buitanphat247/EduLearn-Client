"use client";

import { useEffect, useRef } from "react";
import { Button } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  UndoOutlined,
  RedoOutlined,
  CodeOutlined,
  DisconnectOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ResizeImage from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";

interface RichTextEditorProps {
  placeholder?: string;
  content?: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  minHeight?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  // ✅ URL validation to prevent XSS
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // ✅ Only allow http, https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // ✅ Validate URL to prevent XSS
    if (!isValidUrl(url)) {
      // Note: message is not available here, but we can use console or return early
      // For better UX, consider using a modal instead of prompt
      alert("URL không hợp lệ. Chỉ chấp nhận http:// hoặc https://");
      return;
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("URL hình ảnh:");
    if (!url) return;
    
    // ✅ Validate URL to prevent XSS
    if (!isValidUrl(url)) {
      alert("URL không hợp lệ. Chỉ chấp nhận http:// hoặc https://");
      return;
    }
    
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50/50 sticky top-0 z-10 rounded-t-lg">
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-gray-200 text-blue-600" : ""}
        icon={<BoldOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-gray-200 text-blue-600" : ""}
        icon={<ItalicOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-gray-200 text-blue-600" : ""}
        icon={<UnderlineOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-gray-200 text-blue-600" : ""}
        icon={<StrikethroughOutlined />}
      />

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-blue-600 font-bold" : ""}
      >
        H1
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-blue-600 font-bold" : ""}
      >
        H2
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-gray-200 text-blue-600" : ""}
        icon={<UnorderedListOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-gray-200 text-blue-600" : ""}
        icon={<OrderedListOutlined />}
      />

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200 text-blue-600" : ""}
        icon={<AlignLeftOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200 text-blue-600" : ""}
        icon={<AlignCenterOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200 text-blue-600" : ""}
        icon={<AlignRightOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-200 text-blue-600" : ""}
        title="Justify"
      >
        ═
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        icon={<DisconnectOutlined />}
        title="Unlink"
      />
      <Button
        type="text"
        size="small"
        onClick={toggleLink}
        className={editor.isActive("link") ? "bg-gray-200 text-blue-600" : ""}
        icon={<LinkOutlined />}
      />

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={editor.isActive("superscript") ? "bg-gray-200 text-blue-600" : ""}
        title="Superscript"
      >
        x²
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={editor.isActive("subscript") ? "bg-gray-200 text-blue-600" : ""}
        title="Subscript"
      >
        x₂
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "bg-gray-200 text-blue-600" : ""}
        title="Inline Code"
      >
        &lt;/&gt;
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-gray-200 text-blue-600" : ""}
        title="Blockquote"
      >
        "
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-gray-200 text-blue-600" : ""}
        icon={<CodeOutlined />}
        title="Code Block"
      />

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={addImage}
        icon={<FileImageOutlined />}
        title="Add Image"
      >
        Add
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={<UndoOutlined />}
      />
      <Button
        type="text"
        size="small"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={<RedoOutlined />}
      />
    </div>
  );
};

export default function RichTextEditor({
  placeholder = "Nhập nội dung...",
  content = "",
  onChange,
  onEditorReady,
  minHeight = "300px",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-2 rounded-md font-mono text-sm",
          },
        },
        code: {
          HTMLAttributes: {
            class: "bg-gray-200 px-1 rounded font-mono text-sm",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:underline",
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: (attributes) => {
                if (!attributes.width) {
                  return {};
                }
                return {
                  width: attributes.width,
                };
              },
            },
            height: {
              default: null,
              renderHTML: (attributes) => {
                if (!attributes.height) {
                  return {};
                }
                return {
                  height: attributes.height,
                };
              },
            },
          };
        },
      }),
      ResizeImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Placeholder.configure({
        placeholder,
      }),
      Superscript,
      Subscript,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none p-4 max-w-none",
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Optional: handle selection updates
    },
  });

  // Call onEditorReady when editor is ready
  const onEditorReadyRef = useRef(onEditorReady);
  
  useEffect(() => {
    onEditorReadyRef.current = onEditorReady;
  }, [onEditorReady]);

  useEffect(() => {
    if (editor && onEditorReadyRef.current) {
      // Call immediately and also after a short delay to ensure editor is fully initialized
      onEditorReadyRef.current(editor);
      const timer = setTimeout(() => {
        if (onEditorReadyRef.current) {
          onEditorReadyRef.current(editor);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editor]);

  // ✅ Cleanup editor when component unmounts
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
        }
        .ProseMirror img.resizable {
          display: inline-block;
          position: relative;
        }
        .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #1890ff;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: nwse-resize;
          z-index: 10;
        }
        .resize-handle.bottom-right {
          bottom: -4px;
          right: -4px;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #68BCE8;
        }
        .ProseMirror .resize-trigger {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #68BCE8;
          border: 1px solid #68BCE8;
          border-radius: 50%;
          z-index: 10;
        }
        .ProseMirror .resize-trigger.top-left {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }
        .ProseMirror .resize-trigger.top-right {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }
        .ProseMirror .resize-trigger.bottom-left {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }
        .ProseMirror .resize-trigger.bottom-right {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }
      `}</style>
    </>
  );
}

// Export hook to get editor instance
export { useEditor, type Editor } from "@tiptap/react";

