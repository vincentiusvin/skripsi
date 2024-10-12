import { Backdrop, SxProps, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ReactNode, useState } from "react";
import { useDropzone } from "react-dropzone";

type FileDropzoneProps = {
  onChange: (file: File | null) => void;
  children?: ReactNode;
  sx?: SxProps;
};

function FileDropzone(props: FileDropzoneProps) {
  const { onChange, children, sx } = props;

  const [isHovered, setIsHovered] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: () => {
      setIsHovered(false);
    },
    onDropAccepted: (files) => {
      for (const file of files) {
        onChange(file);
      }
    },
    onDragEnter: () => {
      setIsHovered(() => true);
    },
    onDragLeave: () => {
      setIsHovered(() => false);
    },
  });

  return (
    <Box {...getRootProps()} sx={sx}>
      <input
        {...getInputProps()}
        onClick={(e) => {
          e.preventDefault();
        }}
      />
      {children}
      {isHovered ? (
        <Backdrop open={isHovered} onClick={() => setIsHovered(() => false)}>
          <Typography variant="h6">Lepas untuk menambahkan file</Typography>
        </Backdrop>
      ) : null}
    </Box>
  );
}
export default FileDropzone;
