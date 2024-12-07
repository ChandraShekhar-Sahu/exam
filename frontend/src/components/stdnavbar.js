import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";

function StdNavbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate("/logout");
  };

  return (
    <div className="flex justify-between items-center p-4 backdrop-brightness-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <IconButton onClick={handleHomeClick} className="hover:text-purple-400">
        <HomeIcon color="success" fontSize="large" />
      </IconButton>
      <IconButton onClick={handleSettingsClick} className="hover:text-purple-400">
        <SettingsIcon color="success" fontSize="large" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { handleClose(); navigate("/change_password"); }} className="hover:bg-gray-200">Change Password</MenuItem>

        <MenuItem onClick={handleLogout} className="hover:bg-gray-200">Logout</MenuItem>
      </Menu>
    </div>
  );
}

export default StdNavbar;
