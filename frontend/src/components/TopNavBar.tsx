import React from "react";
import { AppBar, Toolbar, Typography, Button, InputBase, Box } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

interface TopNavBarProps {
  onLogout: () => void;
  onSearchChange: (query: string) => void;
  onGoToPlaylists: () => void;
  isLoggedIn: boolean;
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: { width: "auto" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: { width: "20ch", "&:focus": { width: "30ch" } },
  },
}));

const TopNavBar: React.FC<TopNavBarProps> = ({ onLogout, onSearchChange, onGoToPlaylists, isLoggedIn }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          STMV
        </Typography>
        <Button color="inherit" onClick={onGoToPlaylists}>
          Playlists
        </Button>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} onChange={(e) => onSearchChange(e.target.value)} />
        </Search>
        <Box sx={{ marginLeft: 2 }}>
          {isLoggedIn ? (
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit">Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
