import { useState } from "react";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");

  const saveProfile = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    updateProfile({ name: trimmedName });
    navigate(-1);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Edit profile</h1>
          <p>Update the name shown across your Question Funda workspace.</p>
        </div>
      </div>

      <div className="profile-page-card">
        <div className="profile-page-avatar">
          <UserRound size={26} />
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
            />
          </label>

          <label>
            Role
            <input value={user?.role || ""} readOnly />
          </label>

          <div className="profile-form-actions">
            <button
              className="btn secondary"
              type="button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={15} />
              Cancel
            </button>

            <button className="btn primary" type="submit">
              <Save size={15} />
              Save changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
