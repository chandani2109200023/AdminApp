import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const DealImagePage = () => {
  const [deals, setDeals] = useState([]);
  const [numImages, setNumImages] = useState(1);
  const [imageFiles, setImageFiles] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const fetchDeals = async () => {
    try {
      const res = await fetch("https://apii.agrivemart.com/api/deal/");
      const data = await res.json();
      setDeals(data);
    } catch (err) {
      console.error("Error fetching deals:", err);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Handle file change
  const handleFileChange = (e, index) => {
    const files = [...imageFiles];
    files[index] = e.target.files[0];
    setImageFiles(files);
  };
  const handleUpload = async () => {
    if (imageFiles.length === 0) return alert("Please select images");

    const formData = new FormData();
    imageFiles.forEach((file) => {
      if (file) formData.append("image", file);
    });

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        "https://apii.agrivemart.com/api/deal/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (res.ok) {
        alert("Deals uploaded successfully");
        setImageFiles([]);
        setNumImages(1);
        fetchDeals();
      } else {
        alert("Failed to upload deals");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://apii.agrivemart.com/api/deal/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Deal deleted successfully");
        fetchDeals();
      } else {
        alert("Failed to delete deal");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };
  const handleUpdate = async () => {
    if (!editId || !editFile) return alert("Select a new image to update");
    const formData = new FormData();
    formData.append("image", editFile);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://apii.agrivemart.com/api/deal/${editId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (res.ok) {
        alert("Deak updated successfully");
        setEditId(null);
        setEditFile(null);
        fetchDeals();
      } else {
        alert("Failed to update deal");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Deal Image Management
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Number of Images</InputLabel>
        <Select
          value={numImages}
          onChange={(e) => {
            setNumImages(Number(e.target.value));
            setImageFiles(Array(Number(e.target.value)).fill(null));
          }}
        >
          {[...Array(10).keys()].map((i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* File inputs */}
      {Array.from({ length: numImages }).map((_, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, idx)}
          />
        </Box>
      ))}

      <Button
        variant="contained"
        color="success"
        onClick={handleUpload}
        sx={{ mb: 3 }}
      >
        Upload Deals
      </Button>
      {deals.length > 0 && (
        <Box>
          <Typography variant="h6">Existing Deals</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            {deals.map((deal) => (
              <Box key={deal._id} sx={{ position: "relative" }}>
                <img
                  src={`https://apii.agrivemart.com/uploads/deal/${deal.filename}`}
                  alt="Deal"
                  style={{
                    width: 200,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setEditId(deal._id)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(deal._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {editId === deal._id && (
                  <Box sx={{ mt: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditFile(e.target.files[0])}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      sx={{ mt: 1 }}
                    >
                      Update
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DealImagePage;
