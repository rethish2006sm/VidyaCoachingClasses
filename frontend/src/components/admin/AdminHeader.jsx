import React from "react";

const AdminHeader = ({ isAdminAuthenticated }) => (
  <header className="max-w-6xl mx-auto px-6 pt-20 pb-10">
    <p className="text-xs uppercase tracking-[0.4em] text-orange-300">
      Operations Console
    </p>
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mt-3">
      Admin Desk
    </h1>
    <p className="mt-3 text-sm md:text-base text-white/70 max-w-3xl">
      Use this console to manage batches, top performers, leaderboard tiles,
      and gallery assets. Each tab contains just the fields you need for that
      area.
    </p>
    {!isAdminAuthenticated && (
      <div className="mt-3 text-xs uppercase tracking-[0.3em] text-red-400">
        Sign in using the admin username and password above.
      </div>
    )}
  </header>
);

export default AdminHeader;
