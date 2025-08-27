import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ImageUploadPage = () => {
  const { variantId } = useParams(); // get variantId from URL
  const navigate = useNavigate();

  const [numImages, setNumImages] = useState(1);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [editFile, setEditFile] = useState(null);
  const [editId, setEditId] = useState(null);

  // Fetch existing images
  const fetchImages = async () => {
    if (!variantId) return;
    try {
      const res = await fetch(`https://apii.agrivemart.com/api/productImage/${variantId}`);
      const data = await res.json();
      setExistingImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [variantId]);

  const handleFileChange = (e, index) => {
    const files = [...imageFiles];
    files[index] = e.target.files[0];
    setImageFiles(files);
  };

  const handleUpload = async () => {
    if (!variantId) return;
    const formData = new FormData();
    formData.append('variantId', variantId);
    imageFiles.forEach((file) => {
      if (file) formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('https://apii.agrivemart.com/api/productImage/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert('Images uploaded successfully');
        setImageFiles([]);
        fetchImages();
      } else {
        const errText = await res.text();
        console.error('Upload failed:', errText);
        alert('Failed to upload images');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`https://apii.agrivemart.com/api/productImage/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Image deleted successfully');
        fetchImages();
      } else {
        const errText = await res.text();
        console.error('Delete failed:', errText);
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleEdit = (img) => {
    setEditId(img._id);
    setEditFile(null);
  };

  const handleUpdate = async () => {
    if (!editId || !editFile) return alert('Select a new image to replace');
    const formData = new FormData();
    formData.append('image', editFile);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`https://apii.agrivemart.com/api/productImage/${editId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert('Image updated successfully');
        setEditId(null);
        setEditFile(null);
        fetchImages();
      } else {
        const errText = await res.text();
        console.error('Update failed:', errText);
        alert('Failed to update image');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Images for Variant {variantId}
      </Typography>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {/* Upload new images */}
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

      {Array.from({ length: numImages }).map((_, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, idx)}
          />
        </Box>
      ))}

      <Button variant="contained" color="success" onClick={handleUpload} sx={{ mb: 3 }}>
        Upload New Images
      </Button>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Existing Images</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {existingImages.map((img) => (
              <Box key={img._id} sx={{ position: 'relative' }}>
                <img
                  src={`https://apii.agrivemart.com${img.filename}`}
                  alt="Variant"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <IconButton size="small" color="primary" onClick={() => handleEdit(img)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(img._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {editId === img._id && (
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

export default ImageUploadPage;
