import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "webp";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage.from("site-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/site-images/${path}`;
      onChange(publicUrl);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const isImage = value && (value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) || value.includes("/storage/v1/object/public/"));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL da imagem ou faça upload"
          className="flex-1 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5 shrink-0"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Enviando..." : "Upload"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-lg p-3 text-center text-xs text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-40" />
        Arraste uma imagem aqui ou clique para selecionar
      </div>

      {/* Preview */}
      {isImage && value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 rounded-md border border-border object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
