import { useState } from "react";
import { Link } from "react-router-dom";

const topLinks = [
  { label: "Recipes", href: "/search" },
  { label: "Collections", href: "/wishlist" },
  { label: "Settings", href: "/settings", active: true },
];

const sideLinks = [
  { icon: "search", label: "Search Recipes", href: "/search" },
  { icon: "menu_book", label: "My Collections", href: "/wishlist" },
  { icon: "bookmark", label: "Saved Recipes", href: "/wishlist" },
  { icon: "settings", label: "Profile Settings", href: "/settings", active: true },
];

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: "Julian Marcelle",
    email: "julian.marcelle@epicurean.com",
    phone: "+1 (555) 012-3456",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert("Profile changes saved.");
  };

  const handleCancel = () => {
    setFormData({
      fullName: "Julian Marcelle",
      email: "julian.marcelle@epicurean.com",
      phone: "+1 (555) 012-3456",
    });
  };

  return (
    <div className="min-h-screen bg-[#fff9ec] font-body text-[#37331e]">
      <nav className="fixed top-0 z-50 w-full border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="font-headline text-2xl font-extrabold tracking-tight text-[#954b00]"
          >
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
            src="https://lh3.https://substackcdn.com/image/fetch/$s_!rg7E!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6ccabba-ea38-411f-a673-04f26b5e919c_980x980.jpeg.com/aida-public/AB6AXuBVyLl0WqL9TccAIiQEwwXHQY9hXsUZwptveySGHU-aLErpepZq9cnnP6W41IV-eHDJr0zVhZuUyyYPlvdU_bMLl98jDKiIIeeqH-tDQN2Z_u7aa7eNPUselJwgZeMOZygOequxkJ3JzvykIuTVtJzmCEMf0NJnaekdbFT_mrvEwsQYUeoL89MDAEgblW6ulPVU2CiRagDiYKI86nmftNMqttNPRDMIJv-g3Xos-psQcI8smyq1SbkZ7oZoI4m2W8dg_hYudIWm8teR"
            alt="User chef profile"
            className="h-10 w-10 rounded-full border-2 border-[#ffaf75] object-cover"
          />
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-stone-200/50 bg-stone-50 px-0 pb-8 pt-24 shadow-xl">
        <div className="mb-8 px-8">
          <div className="mb-2 flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/https://substackcdn.com/image/fetch/$s_!rg7E!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6ccabba-ea38-411f-a673-04f26b5e919c_980x980.jpeg-tafVwn4EyhBHMGFnPLLAJHvq8FplgliDiqdPi0NOqczOlIKUiQ6GQXy01VcV-xjYU6yIyc-7QTRJw8Mv0n0QupKcFURh65nSYyRnhT1GQPg89Jj4ht73SjPXK4AgHLsC6GKnKwiGmCRsHQBp4Wzoc_G1t0NF0TXMQ8pWqSzSCRxSrtcvGU82chlZgrsdedpECpOU8ql-OBJ9Ec9cTCYykWKcV6LJbX3Mx8t43y8UhaOo7-sEHqGWI_Qvp3dRzkUENm"
              alt="Executive chef avatar"
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
                      ? "ml-0 mr-4 flex items-center gap-3 rounded-r-full bg-stone-200/50 px-6 py-3 font-headline text-sm font-semibold uppercase tracking-widest text-[#954b00]"
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
          <button
            type="button"
            className="w-full rounded-full px-6 py-4 font-headline font-bold uppercase tracking-widest text-white transition-all active:opacity-80"
            style={{ background: "linear-gradient(135deg, #954b00 0%, #ffaf75 100%)" }}
          >
            Start Cooking
          </button>
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC-P7UbzK4lmFydKzzfWba1mZW7Ot6MeT8xppPYN2sVlSQ19eBQnAoKH-wLQnT2equ_5WxNC73CJmKX6cmCqxK5XILQbIisXYg4rlxrmHBoVQn5GdyX4qn8_4aEDXCK7-h7EtrmToU3Ix0QCTphXNEiqqebIbfhuYNmkRjpBkIMdoRKMfC9oQDwrQTdVVMfUwrQ67Tds-8_zc7ti9LcQypgTxvBPjR-QMEKwTWI2gV5tepGbRSRrF7g-d30PM5vmfPx5spKxMYa9Lu"
                    alt="Chef avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  className="absolute bottom-2 right-2 rounded-full bg-[#954b00] p-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>
              </div>

              <h2 className="mb-1 font-headline text-2xl font-bold text-[#37331e]">
                Julian Marcelle
              </h2>
              <p className="mb-6 font-label text-xs uppercase tracking-widest text-[#655f47]">
                Executive Chef
              </p>

              <button
                type="button"
                className="rounded-full border-2 border-[#b9b296]/60 px-8 py-3 font-headline font-bold text-[#954b00] transition-all hover:bg-[#ebe2c4]/60"
              >
                Edit Photo
              </button>

              <p className="mt-8 text-xs leading-relaxed text-[#655f47]">
                PNG, JPG or GIF.
                <br />
                Max size of 2MB.
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
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none ring-0 transition-all focus:ring-2 focus:ring-[#954b00]"
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
                    className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none ring-0 transition-all focus:ring-2 focus:ring-[#954b00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-3 block font-headline text-sm font-bold uppercase tracking-widest text-[#37331e]"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (234) 567-8900"
                    className="w-full rounded-xl bg-[#f6eed5] p-4 font-body text-[#37331e] outline-none ring-0 transition-all focus:ring-2 focus:ring-[#954b00]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-10">
                  <button
                    type="submit"
                    className="rounded-full px-10 py-4 font-headline font-extrabold uppercase tracking-widest text-white transition-all hover:shadow-lg active:scale-95"
                    style={{ background: "linear-gradient(135deg, #954b00 0%, #ffaf75 100%)" }}
                  >
                    Save Changes
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
