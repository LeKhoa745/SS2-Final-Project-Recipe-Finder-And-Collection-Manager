import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { getStoredUser, updateStoredUser } from "../utils/session";

const topLinks = [
  { label: "Recipes", href: "/search" },
  { label: "Collection", href: "/collection" },
  { label: "Saved Recipes", href: "/wishlist" },
  { label: "Settings", href: "/settings", active: true },
];

const sideLinks = [
  { icon: "search", label: "Search Recipes", href: "/search" },
  { icon: "menu_book", label: "Collection", href: "/collection" },
  { icon: "bookmark", label: "Saved Recipes", href: "/wishlist" },
  { icon: "settings", label: "Profile Settings", href: "/settings", active: true },
];

function getPhoneDigits(phone) {
  if (!phone) return "";
  return phone.startsWith("+84") ? phone.slice(3).replace(/\D/g, "").slice(0, 9) : phone.replace(/\D/g, "").slice(0, 9);
}

function getAvatarFallback(name = "Chef") {
  return `https://ui-avatars.com/api/?background=fff1eb&color=954b00&name=${encodeURIComponent(name)}`;
}

export default function ProfileSettings() {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(getStoredUser());
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
    phoneDigits: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [showAvatarUrl, setShowAvatarUrl] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // For tracking changes
  const isDirty = (
    formData.fullName !== (user?.name || "") ||
    formData.email !== (user?.email || "") ||
    formData.avatar !== (user?.avatar || "") ||
    formData.phoneDigits !== getPhoneDigits(user?.phone) ||
    passwordData.newPassword !== ""
  );

  useEffect(() => {
    const syncUser = () => {
      const storedUser = getStoredUser();
      setUser(storedUser);
      setAvatarLoadFailed(false);
      setFormData({
        fullName: storedUser?.name || "",
        email: storedUser?.email || "",
        avatar: storedUser?.avatar || "",
        phoneDigits: getPhoneDigits(storedUser?.phone),
      });
    };

    syncUser();
    window.addEventListener("session:changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("session:changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const avatarPreview = !avatarLoadFailed && formData.avatar
    ? formData.avatar
    : !avatarLoadFailed && user?.avatar
      ? user.avatar
      : getAvatarFallback(formData.fullName || user?.name || "Chef");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMessage("");
    setError("");

    if (name === "phoneDigits") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 9);
      setFormData((current) => ({ ...current, phoneDigits: digitsOnly }));
      return;
    }

    if (name === "avatar") {
      setAvatarLoadFailed(false);
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for your avatar.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    try {
      setAvatarLoadFailed(false);
      setError("");
      setMessage("Uploading avatar...");

      const response = await apiClient("/auth/avatar", {
        method: "POST",
        body: formDataUpload,
      });

      setUser(response.data.user);
      updateStoredUser(response.data.user);
      setFormData((current) => ({
        ...current,
        avatar: response.data.avatarUrl || response.data.user.avatar,
      }));
      setMessage("Avatar uploaded successfully!");
    } catch (apiError) {
      setError(apiError.message || "Failed to upload avatar.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    // Validate password if user is trying to change it
    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        setSaving(false);
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match.");
        setSaving(false);
        return;
      }
      if (user?.hasPassword && !passwordData.oldPassword) {
        setError("Current password is required to set a new one.");
        setSaving(false);
        return;
      }
    }

    try {
      const response = await apiClient("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          avatar: formData.avatar.trim(),
          phone: formData.phoneDigits ? `+84${formData.phoneDigits}` : null,
          oldPassword: passwordData.oldPassword || undefined,
          newPassword: passwordData.newPassword || undefined,
        }),
      });

      setUser(response.data.user);
      updateStoredUser(response.data.user);
      setAvatarLoadFailed(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Profile and security settings updated successfully.");
    } catch (apiError) {
      setError(apiError.message || "Unable to update profile right now.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleCancel = () => {
    setAvatarLoadFailed(false);
    setFormData({
      fullName: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      phoneDigits: getPhoneDigits(user?.phone),
    });
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#fff9ec] font-body text-[#37331e]">
      <nav className="fixed top-0 z-50 w-full border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-headline text-2xl font-extrabold tracking-tight text-[#954b00]">
            Recipe Finder
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {topLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={
                  link.active
                    ? "border-b-2 border-[#954b00] font-headline font-bold text-[#954b00]"
                    : "font-headline font-medium text-stone-600 transition-colors hover:text-[#954b00]"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <img
            src={avatarPreview}
            alt="User chef profile"
            onError={() => setAvatarLoadFailed(true)}
            className="h-10 w-10 rounded-full border-2 border-[#ffaf75] object-cover"
          />
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-stone-200/50 bg-stone-50 pb-8 pt-24 shadow-xl">
        <div className="mb-8 px-8">
          <div className="mb-2 flex items-center gap-3">
            <img
              src={avatarPreview}
              alt="Executive chef avatar"
              onError={() => setAvatarLoadFailed(true)}
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-headline text-sm font-black uppercase tracking-widest text-stone-900">
                Chef de Cuisine
              </h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                The Digital Epicurean
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {sideLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={
                    link.active
                      ? "mr-4 flex items-center gap-3 rounded-r-full bg-stone-200/50 px-6 py-3 font-headline text-sm font-semibold uppercase tracking-widest text-[#954b00]"
                      : "flex items-center gap-3 px-6 py-3 font-headline text-sm font-semibold uppercase tracking-widest text-stone-500 transition-all duration-300 hover:translate-x-1"
                  }
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 py-4">
          <Link
            to="/"
            className="block text-center w-full rounded-full px-6 py-4 font-headline font-bold uppercase tracking-widest text-white transition-all active:opacity-80"
            style={{ background: "linear-gradient(135deg, #954b00 0%, #ffaf75 100%)" }}
          >
            Start Cooking
          </Link>
        </div>

        <div className="mt-auto space-y-1">
          <Link
            to="/login"
            className="flex items-center gap-3 px-6 py-3 font-headline text-sm font-semibold uppercase tracking-widest text-stone-500 transition-all duration-300 hover:translate-x-1"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="mx-auto ml-0 max-w-6xl px-6 pb-20 pt-24 lg:ml-72 lg:px-12">
        <header className="mb-12 mt-8">
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-[#37331e] md:text-5xl">
            Profile Settings
          </h1>
          <p className="text-lg text-[#655f47]">
            Manage your culinary identity and digital kitchen preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <section className="lg:col-span-4">
            <div className="top-32 flex flex-col items-center rounded-xl bg-[#fbf3dd] p-8 text-center lg:sticky">
              <div className="relative mb-6">
                <div className="h-48 w-48 overflow-hidden rounded-full border-8 border-[#ebe2c4] shadow-xl">
                  <img
                    src={avatarPreview}
                    alt="Chef avatar"
                    onError={() => setAvatarLoadFailed(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-full bg-[#954b00] p-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              <h2 className="mb-1 font-headline text-2xl font-bold text-[#37331e]">
                {formData.fullName || "Your name"}
              </h2>
              <p className="mb-6 font-label text-xs uppercase tracking-widest text-[#655f47]">
                Executive Chef
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border-2 border-[#b9b296]/60 px-8 py-3 font-headline font-bold text-[#954b00] transition-all hover:bg-[#ebe2c4]/60"
              >
                Edit Photo
              </button>

              <p className="mt-8 text-xs leading-relaxed text-[#655f47]">
                Upload an image or{" "}
                <button
                  type="button"
                  onClick={() => setShowAvatarUrl(!showAvatarUrl)}
                  className="font-bold underline text-[#954b00]"
                >
                  {showAvatarUrl ? "hide link" : "use link"}
                </button>
                <br />
                Changes save to your account.
              </p>
            </div>
          </section>

          <section className="lg:col-span-8">
            <div className="rounded-xl bg-white p-8 shadow-sm md:p-10">
              <form className="space-y-10" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                  >
                    Username
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="chef@kitchen.com"
                    className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneDigits"
                    className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                  >
                    Phone Number
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl bg-[#f6eed5]">
                    <span className="px-4 font-headline font-bold text-[#954b00]">+84</span>
                    <input
                      id="phoneDigits"
                      name="phoneDigits"
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      value={formData.phoneDigits}
                      onChange={handleChange}
                      placeholder="912345678"
                      className="w-full bg-transparent p-4 font-body text-[#37331e] outline-none"
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#655f47]">
                    Enter 9 digits after +84.
                  </p>
                </div>

                {showAvatarUrl && (
                  <div>
                    <label
                      htmlFor="avatar"
                      className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                    >
                      Avatar URL
                    </label>
                    <input
                      id="avatar"
                      name="avatar"
                      type="text"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-stone-100">
                  <h3 className="mb-6 font-headline text-lg font-bold text-[#37331e]">Security</h3>
                  {!!user?.hasPassword && (
                    <div className="mb-6">
                      <label
                        htmlFor="oldPassword"
                        className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="oldPassword"
                          name="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="w-full rounded-xl bg-[#f6eed5] p-4 pr-12 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                        >
                          <span className="material-symbols-outlined">{showOldPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Min 8 characters"
                          className="w-full rounded-xl bg-[#f6eed5] p-4 pr-12 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                        >
                          <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Repeat password"
                          className="w-full rounded-xl bg-[#f6eed5] p-4 pr-12 font-body text-[#37331e] outline-none transition-all focus:ring-2 focus:ring-[#954b00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                        >
                          <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to="/forgot-password" size="sm" className="text-sm font-bold text-orange-600 hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">lock_reset</span>
                      Forgot password or want to reset via phone?
                    </Link>
                  </div>
                </div>

                {message && (
                  <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-10">
                  <button
                    type="submit"
                    disabled={saving || !isDirty || (formData.phoneDigits.length > 0 && formData.phoneDigits.length !== 9)}
                    className="rounded-full px-10 py-4 font-headline font-extrabold uppercase tracking-widest text-white transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50"
                    style={{ background: isDirty ? "linear-gradient(135deg, #954b00 0%, #ffaf75 100%)" : "#ccc" }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border-2 border-[#b9b296]/60 px-10 py-4 font-headline font-bold uppercase tracking-widest text-[#655f47] transition-all hover:bg-[#f6eed5] active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#c8f17a] text-[#3f5a00] shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <span className="material-symbols-outlined text-3xl">restaurant</span>
      </button>
    </div>
  );
}
