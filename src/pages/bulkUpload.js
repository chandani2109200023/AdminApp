import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const BulkUploadProducts = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠️ Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Missing token");

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const res = await axios.post(
        "https://apii.agrivemart.com/api/admin/products/bulk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`✅ ${res.data.message} (${res.data.count} products uploaded)`);
    } catch (err) {
      setError(
        `❌ Upload failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Card
        sx={{
          maxWidth: 500,
          mx: "auto",
          borderRadius: 3,
          backgroundColor: "#2C3E50",
          color: "#ECF0F1",
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{ color: "#F1C40F" }}
          >
            Bulk Upload Products
          </Typography>

          <Box
            sx={{
              border: "2px dashed #7F8C8D",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 2,
              backgroundColor: "#34495E",
            }}
          >
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ backgroundColor: "#1ABC9C", "&:hover": { backgroundColor: "#16A085" } }}
              >
                Choose File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                📂 {file.name}
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            disabled={uploading}
            onClick={handleUpload}
            sx={{
              py: 1.2,
              fontWeight: "bold",
              backgroundColor: "#3498DB",
              "&:hover": { backgroundColor: "#2980B9" },
            }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
          </Button>

          {message && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BulkUploadProducts;
