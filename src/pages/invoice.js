import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";

function InvoicePage() {
  const { order: encodedOrder } = useParams();
  const order = JSON.parse(decodeURIComponent(encodedOrder));

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch("https://apii.agrivemart.com/api/generate-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [encodedOrder]);

  return (
    <Box sx={{ width: "100%", height: "100vh", backgroundColor: "#f4f6f8" }}>
      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20% auto" }} />
      ) : pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Invoice PDF"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      ) : (
        <Typography align="center" color="error" sx={{ mt: 5 }}>
          Failed to load invoice
        </Typography>
      )}
    </Box>
  );
}

export default InvoicePage;
