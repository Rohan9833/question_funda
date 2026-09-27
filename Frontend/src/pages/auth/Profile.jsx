import { useState } from "react";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveProfile = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateProfile({ name: trimmedName, phone: phone.trim() });
      navigate(-1);
    } catch (saveError) {
      setError(saveError.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Edit profile</h1>
          <p>Update the details shown across your Question Funda workspace.</p>
        </div>
      </div>

      <div className="profile-page-card">
        <div className="profile-page-avatar"><UserRound size={26} /></div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" autoComplete="name" /></label>
          <label>Email<input value={user?.email || ""} readOnly /></label>
          <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter your phone number" autoComplete="tel" /></label>
          <label>Role<input value={user?.role || ""} readOnly /></label>

          {error && <div className="login-error">{error}</div>}

          <div className="profile-form-actions">
            <button className="btn secondary" type="button" onClick={() => navigate(-1)}><ArrowLeft size={15} />Cancel</button>
            <button className="btn primary" type="submit" disabled={saving}><Save size={15} />{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
