"use client";

// components/Navbar.tsx

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <AppBar position="fixed" sx={{ height: "48px" }}>
      <Toolbar sx={{ height: "100%", alignItems: "center" }}>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        {/* Logo or Brand */}
        {/* Add your logo or brand component here if needed */}
        {/* Navigation Buttons */}
        <div style={{ flexGrow: 1 }} /> {/* Pushes buttons to right */}
        <Button color="inherit" component={Link} href="/about">
          About
        </Button>
        <Button color="inherit" component={Link} href="/foo">
          Foo
        </Button>
        <Button color="inherit" component={Link} href="/bar">
          Bar
        </Button>
        {/* Login Button */}
        <Button color="inherit" component={Link} href="/login">
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
