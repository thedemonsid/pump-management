import { useCallback, useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export function ImageUpload({
  id,
  label,
  onChange,
  disabled = false,
  maxSize = 10,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      setError(null);

      if (!file) {
        setPreview(null);
        onChange(null);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`Image size must be less than ${maxSize}MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange(file);
    },
    [maxSize, onChange]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onChange(null);
  }, [onChange]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt={label}
              className="w-full h-40 object-cover rounded-lg border-2 border-border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className={cn(
              "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              disabled
                ? "bg-muted cursor-not-allowed opacity-50"
                : "bg-background hover:bg-muted/50 border-border hover:border-primary",
              error && "border-destructive"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
            <input
              id={id}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              disabled={disabled}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!preview && !disabled && (
        <p className="text-xs text-muted-foreground">Optional</p>
      )}
    </div>
  );
}
