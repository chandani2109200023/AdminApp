import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadIcon from "@mui/icons-material/CloudUpload";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import LockIcon from "@mui/icons-material/Lock";

const Sidebar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    console.log("Token removed. Admin logged out.");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Protected routes
  const navigationItems = [
    { text: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
    { text: "Upload Item", to: "/upload", icon: <UploadIcon /> },
    { text: "Item List", to: "/items", icon: <ListAltIcon /> },
  ];

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      alert("Please login first");
    }
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        "& .MuiDrawer-paper": {
          width: "250px",
          transition: "width 0.3s ease",
          overflowX: "hidden",
          backgroundColor: "#1E1E2F",
          color: "#FFFFFF",
          borderRight: "1px solid #30303F",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "20px",
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#FFC947",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "18px",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Agrive Mart
          </Typography>
        </Box>

        {/* Navigation */}
        <List>
          {navigationItems.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => handleNavigation(item.to)}
              sx={{
                padding: "10px 20px",
                borderRadius: "8px",
                margin: "5px 20px",
                color: isLoggedIn ? "#B0B0C3" : "#888",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#FFC947",
                  color: "#1E1E2F",
                  transform: "scale(1.05)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#FFC947", minWidth: "40px" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {!isLoggedIn && <LockIcon sx={{ fontSize: 16, color: "#FFC947" }} />}
            </ListItem>
          ))}
        </List>

        {/* Auth Buttons */}
        <Box sx={{ padding: "30px", marginTop: "auto" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogin}
            startIcon={<LoginIcon />}
            sx={{
              color: "#FFC947",
              borderColor: "#FFC947",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              padding: "10px 0",
              "&:hover": {
                backgroundColor: "#FFC947",
                color: "#1E1E2F",
              },
              marginBottom: "10px",
            }}
          >
            Login
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              backgroundColor: "#F0F0F0",
              color: "#6C849B",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              padding: "10px 0",
              "&:hover": {
                backgroundColor: "#D32F2F",
                color: "#FFFFFF",
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
