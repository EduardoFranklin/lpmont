import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Crop, RotateCcw, ZoomIn, ZoomOut, Check, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadCropProps {
  value: string;
  onChange: (url: string) => void;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
  bucket?: string;
  folder?: string;
  friendlyName?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
};

const ImageUploadCrop = ({
  value,
  onChange,
  altText = "",
  onAltTextChange,
  bucket = "site-images",
  folder = "uploads",
  friendlyName,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85,
}: ImageUploadCropProps) => {
  const [customFileName, setCustomFileName] = useState("");
  const [localAltText, setLocalAltText] = useState(altText);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cropping, setCropping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; cropStart: CropArea } | null>(null);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const optimizeImage = useCallback(
    async (img: HTMLImageElement): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/webp", quality);
      });
    },
    [maxWidth, maxHeight, quality]
  );

  const drawPreview = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const containerWidth = canvas.parentElement?.clientWidth || 400;
    const ratio = Math.min(containerWidth / img.naturalWidth, 300 / img.naturalHeight);
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  const drawCropOverlay = useCallback(() => {
    const canvas = cropCanvasRef.current;
    const mainCanvas = canvasRef.current;
    if (!canvas || !mainCanvas || !originalImage) return;
    canvas.width = mainCanvas.width;
    canvas.height = mainCanvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cx = (crop.x / 100) * canvas.width;
    const cy = (crop.y / 100) * canvas.height;
    const cw = (crop.width / 100) * canvas.width;
    const ch = (crop.height / 100) * canvas.height;
    ctx.clearRect(cx, cy, cw, ch);
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);
    const handleSize = 8;
    ctx.fillStyle = "hsl(var(--primary))";
    [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]].forEach(([hx, hy]) => {
      ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + (cw * i) / 3, cy);
      ctx.lineTo(cx + (cw * i) / 3, cy + ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + (ch * i) / 3);
      ctx.lineTo(cx + cw, cy + (ch * i) / 3);
      ctx.stroke();
    }
  }, [crop, originalImage]);

  useEffect(() => {
    if (cropping && originalImage) {
      drawPreview(originalImage);
      drawCropOverlay();
    }
  }, [cropping, crop, originalImage, drawPreview, drawCropOverlay]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      const img = await loadImage(dataUrl);
      setOriginalImage(img);
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
    };
    reader.readAsDataURL(file);
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      cropStart: { ...crop },
    };
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - rect.left - dragRef.current.startX) / canvas.width) * 100;
    const dy = ((e.clientY - rect.top - dragRef.current.startY) / canvas.height) * 100;
    const newX = Math.max(0, Math.min(100 - dragRef.current.cropStart.width, dragRef.current.cropStart.x + dx));
    const newY = Math.max(0, Math.min(100 - dragRef.current.cropStart.height, dragRef.current.cropStart.y + dy));
    setCrop((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleCropMouseUp = () => {
    dragRef.current = null;
  };

  const applyCropAndUpload = async () => {
    if (!originalImage) return;
    setUploading(true);
    try {
      const canvas = document.createElement("canvas");
      const sx = (crop.x / 100) * originalImage.naturalWidth;
      const sy = (crop.y / 100) * originalImage.naturalHeight;
      const sw = (crop.width / 100) * originalImage.naturalWidth;
      const sh = (crop.height / 100) * originalImage.naturalHeight;
      let dw = sw * zoom;
      let dh = sh * zoom;
      if (dw > maxWidth || dh > maxHeight) {
        const ratio = Math.min(maxWidth / dw, maxHeight / dh);
        dw = Math.round(dw * ratio);
        dh = Math.round(dh * ratio);
      }
      canvas.width = Math.round(dw);
      canvas.height = Math.round(dh);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(originalImage, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/webp", quality);
      });
      const baseName = customFileName ? slugify(customFileName) : friendlyName ? slugify(friendlyName) : Date.now().toString();
      const uniqueSuffix = Math.random().toString(36).slice(2, 6);
      const fileName = `${folder}/${baseName}-${uniqueSuffix}.webp`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
      });
      if (error) {
        const dataUrl = canvas.toDataURL("image/webp", quality);
        onChange(dataUrl);
        toast.success("Imagem otimizada! (salva localmente)");
      } else {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        onChange(urlData.publicUrl);
        toast.success("Imagem otimizada e enviada!");
      }
      setCropping(false);
      setPreview(null);
      setOriginalImage(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar imagem");
    } finally {
      setUploading(false);
    }
  };

  const uploadDirect = async () => {
    if (!originalImage) return;
    setUploading(true);
    try {
      const blob = await optimizeImage(originalImage);
      const baseName = customFileName ? slugify(customFileName) : friendlyName ? slugify(friendlyName) : Date.now().toString();
      const uniqueSuffix = Math.random().toString(36).slice(2, 6);
      const fileName = `${folder}/${baseName}-${uniqueSuffix}.webp`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
      });
      if (error) {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / originalImage.naturalWidth, maxHeight / originalImage.naturalHeight, 1);
        canvas.width = Math.round(originalImage.naturalWidth * ratio);
        canvas.height = Math.round(originalImage.naturalHeight * ratio);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL("image/webp", quality));
        toast.success("Imagem otimizada! (salva localmente)");
      } else {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        onChange(urlData.publicUrl);
        toast.success("Imagem otimizada e enviada!");
      }
      setPreview(null);
      setOriginalImage(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current image preview */}
      {value && !preview && (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-foreground/[0.03]">
          <img src={value} alt={localAltText || "Preview"} className="w-full object-contain max-h-64" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              Trocar imagem
            </button>
            <button
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/80 text-white hover:bg-destructive transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!value && !preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/30 hover:text-primary/60 transition-all cursor-pointer"
        >
          <Upload className="w-8 h-8" strokeWidth={1.5} />
          <div className="text-sm font-medium">Clique para selecionar imagem</div>
          <div className="text-xs">JPG, PNG ou WebP • Otimizado automaticamente</div>
        </button>
      )}

      {/* Preview before upload */}
      {preview && !cropping && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-foreground/[0.03]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {originalImage ? `${originalImage.naturalWidth}×${originalImage.naturalHeight}` : ""}
            </span>
            <span className="text-xs text-muted-foreground">→ max {maxWidth}×{maxHeight} WebP</span>
          </div>
          {/* SEO file name */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Nome do arquivo (SEO)</label>
            <input
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder={friendlyName || "nome-descritivo-da-imagem"}
              className="w-full bg-foreground/[0.04] border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          {/* Alt text */}
          {onAltTextChange && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Texto alternativo (SEO)</label>
              <input
                value={localAltText}
                onChange={(e) => { setLocalAltText(e.target.value); onAltTextChange(e.target.value); }}
                placeholder="Descreva a imagem..."
                className="w-full bg-foreground/[0.04] border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary/40 focus:outline-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setCropping(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border hover:border-primary/30 text-foreground/70 hover:text-primary transition-all"
            >
              <Crop className="w-3.5 h-3.5" /> Recortar
            </button>
            <button
              onClick={uploadDirect}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {uploading ? "Enviando..." : "Enviar otimizada"}
            </button>
            <button
              onClick={() => { setPreview(null); setOriginalImage(null); }}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Crop interface */}
      {cropping && originalImage && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Crop className="w-3.5 h-3.5" /> Arraste para posicionar o recorte
          </div>
          <div
            className="relative rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            <canvas ref={canvasRef} className="w-full" />
            <canvas ref={cropCanvasRef} className="absolute top-0 left-0 w-full h-full" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground">
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[hsl(var(--primary))] h-1"
            />
            <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground">
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:bg-foreground/5"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            {[
              { label: "Livre", w: 80, h: 80 },
              { label: "1:1", w: 60, h: 60 },
              { label: "16:9", w: 80, h: 45 },
              { label: "4:3", w: 75, h: 56 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setCrop({ x: 10, y: 10, width: preset.w, height: preset.h })}
                className="px-2.5 py-1 rounded-full text-xs border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCropping(false)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border text-muted-foreground hover:bg-foreground/5"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              onClick={applyCropAndUpload}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {uploading ? "Enviando..." : "Recortar e enviar"}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImageUploadCrop;
