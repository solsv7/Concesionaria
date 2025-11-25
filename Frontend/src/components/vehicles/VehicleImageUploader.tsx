import { ChangeEvent, useRef, useState } from "react";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/react";
import { api } from "../../services/api";
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
  Alert,
} from "@mui/material";

interface Props {
  vehicleId: number;
  onUploaded?: (url: string) => void;
  isProfile?: boolean;
}

export const VehicleImageUploader = ({
  vehicleId,
  onUploaded,
  isProfile = false,
}: Props) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cancelledRef = useRef(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelUpload = () => {
    if (!uploading) return;
    cancelledRef.current = true;
    setUploading(false);
    setProgress(0);
    setErrorMsg("Subida cancelada");
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cancelledRef.current = false;

    try {
      setUploading(true);
      setProgress(0);
      setErrorMsg(null);

      const { data } = await api.get("/api/imagekit/auth");
      const { token, expire, signature } = data;

      const uploadResponse = await upload({
        file,
        fileName: file.name,
        token,
        expire,
        signature,
        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
        folder: `/vehiculos/${vehicleId}`,
        useUniqueFileName: true,
        onProgress: (evt) => {
          if (!evt.lengthComputable || cancelledRef.current) return;
          setProgress((evt.loaded / evt.total) * 100);
        },
      });

      if (cancelledRef.current) {
        return;
      }

      const imageUrl = uploadResponse.url;

      await api.post(`/api/vehicles/${vehicleId}/images`, {
        url_imagen: imageUrl,
        img_perfil: isProfile,
      });

      setLastUrl(imageUrl);
      if (onUploaded) onUploaded(imageUrl);

      e.target.value = "";
    } catch (error: any) {
      if (cancelledRef.current) return;

      let msg = "Error subiendo imagen";
      if (error instanceof ImageKitAbortError) {
        msg = "Upload abortado";
      } else if (error instanceof ImageKitInvalidRequestError) {
        msg = "Request inválido al subir imagen";
      } else if (error instanceof ImageKitUploadNetworkError) {
        msg = "Error de red al subir imagen";
      } else if (error instanceof ImageKitServerError) {
        msg = "Error de servidor al subir imagen";
      }
      console.error(msg, error);
      setErrorMsg(msg);
    } finally {
      if (!cancelledRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <Stack spacing={1.5}>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Button
        variant="contained"
        onClick={handleClick}
        disabled={uploading}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        {uploading ? "Subiendo..." : isProfile ? "Elegir foto de perfil" : "Agregar imagen"}
      </Button>

      {uploading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress variant="determinate" value={progress} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {progress.toFixed(0)}%
            </Typography>
            <Button
              size="small"
              onClick={handleCancelUpload}
              sx={{ textTransform: "none" }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {lastUrl && (
        <Stack direction="row" spacing={2} alignItems="center" mt={1}>
          <Box
            component="img"
            src={lastUrl}
            alt="Imagen subida"
            sx={{
              width: 120,
              height: 80,
              objectFit: "cover",
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Imagen subida correctamente.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
