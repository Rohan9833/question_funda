import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleHelp, LogOut, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const leave = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const openProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const pageName = location.pathname.split("/").filter(Boolean).pop() || "Dashboard";

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        {user.role === "admin" ? "principal" : user.role} / <strong>{pageName}</strong>
      </div>

      <div className="top-actions">
        <button className="icon-btn" type="button" aria-label="Help">
          <CircleHelp size={17} />
        </button>

        <div className="profile-menu" ref={profileRef}>
          <button
            className="profile-trigger"
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="top-avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <span className="profile-trigger-info">
              <strong>{user.name}</strong>
              <small>{user.role === "admin" ? "Principal" : user.role}</small>
            </span>
            <ChevronDown
              className={profileOpen ? "profile-chevron open" : "profile-chevron"}
              size={15}
            />
          </button>

          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-head">
                <span className="top-avatar large">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.role === "admin" ? "Principal workspace" : `${user.role} workspace`}</span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-menu-item"
                type="button"
                role="menuitem"
                onClick={openProfile}
              >
                <UserRound size={16} />
                <span>Edit profile</span>
              </button>

              <button
                className="profile-menu-item danger"
                type="button"
                role="menuitem"
                onClick={leave}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
