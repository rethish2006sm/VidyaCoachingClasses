import React from "react";

const buttonStyles =
  "rounded-2xl px-5 py-3 text-xs font-black tracking-[0.3em] uppercase transition duration-300";

const PasswordChangeCard = ({
  passwordForm,
  passwordStatus,
  passwordLoading,
  onChangeField,
  onSubmit,
  onLogout,
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
        Change admin password
      </p>
      <button
        type="button"
        onClick={onLogout}
        className="text-[10px] uppercase tracking-[0.3em] underline text-white/70"
      >
        Log out
      </button>
    </div>
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="password"
        value={passwordForm.currentPassword}
        onChange={(e) => onChangeField("currentPassword", e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
        placeholder="Current password"
      />
      <input
        type="password"
        value={passwordForm.newPassword}
        onChange={(e) => onChangeField("newPassword", e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
        placeholder="New password"
      />
      <input
        type="password"
        value={passwordForm.confirmPassword}
        onChange={(e) => onChangeField("confirmPassword", e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
        placeholder="Confirm new password"
      />
      <button
        type="submit"
        disabled={passwordLoading}
        className={`${buttonStyles} bg-white text-black ${passwordLoading ? "opacity-70" : ""}`}
      >
        {passwordLoading ? "Updating..." : "Update password"}
      </button>
    </form>
    {passwordStatus && (
      <p className="text-[12px] text-white/70">{passwordStatus}</p>
    )}
  </div>
);

export default PasswordChangeCard;
