"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
// import AdbIcon from '@mui/icons-material/Adb';
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";

// Using router to navigate to different pages instead of Link
// import Link from "next/link";

import Locale from "../../locales";

const pages = ["Products", "Pricing", "Blog", "About"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function ResponsiveAppBar() {
  const router = useRouter();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(null);
    const target = event.currentTarget as HTMLAnchorElement;
    router.push(target.href);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <LocationSearchingIcon
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            WhereQ
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {/* {pages.map((page) => ( */}
              {/* <MenuItem key={page} onClick={handleCloseNavMenu}> */}
              {/* <Typography textAlign="center">{page}</Typography> */}
              {/* </MenuItem> */}
              {/* ))} */}

              <MenuItem
                component={"a"}
                href={"/products"}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">Products</Typography>
              </MenuItem>
              <MenuItem
                component={"a"}
                href={"/pricing"}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">Pricing</Typography>
              </MenuItem>
              <MenuItem
                component={"a"}
                href={"/blog"}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">Blog</Typography>
              </MenuItem>
              <MenuItem
                component={"a"}
                href={"/about"}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">About</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <LocationSearchingIcon
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            WhereQ
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {/*
            {pages.map((page) => (
              <Button
                key={page}
                name={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))} 
            */}

            <Button
              name="Products"
              onClick={handleCloseNavMenu}
              href="/products"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              {Locale.Navbar.Products}
            </Button>
            <Button
              name="Pricing"
              onClick={handleCloseNavMenu}
              href="/pricing"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              {Locale.Navbar.Pricing}
            </Button>
            <Button
              name="Blog"
              onClick={handleCloseNavMenu}
              href="/blog"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              {Locale.Navbar.Blog}
            </Button>
            <Button
              name="About"
              onClick={handleCloseNavMenu}
              href="/about"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              {Locale.Navbar.About}
            </Button>

            {/*
            <Link href="/products" style={{ textDecoration: "none" }}>
              <Button sx={{ my: 2, color: "white", display: "block" }}>
                Products
              </Button>
            </Link>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <Button sx={{ my: 2, color: "white", display: "block" }}>
                Pricing
              </Button>
            </Link>
            <Link href="/blog" style={{ textDecoration: "none" }}>
              <Button sx={{ my: 2, color: "white", display: "block" }}>
                Blog
              </Button>
            </Link>
            <Link href="/about" style={{ textDecoration: "none" }}>
              <Button sx={{ my: 2, color: "white", display: "block" }}>
                About
              </Button>
            </Link>
            */}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="WhereQ-Owl" src="/images/owl.png" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
