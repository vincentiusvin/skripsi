import { SxProps } from "@mui/material";
import { Box } from "@mui/system";
import { ReactNode } from "react";
import { useDropzone } from "react-dropzone";

type ImageDropzoneProps = {
  onChange: (file: File | null) => void;
  children?: ReactNode;
  sx?: SxProps;
};

function ImageDropzone(props: ImageDropzoneProps) {
  const { onChange, children, sx } = props;
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/jpeg": [".jpeg"],
    },
    onDropAccepted: (files) => {
      const file = files.length === 1 ? files[0] : null;
      onChange(file);
    },
  });

  return (
    <Box {...getRootProps()} sx={sx}>
      <input {...getInputProps()} />
      {children}
    </Box>
  );
}
export default ImageDropzone;
