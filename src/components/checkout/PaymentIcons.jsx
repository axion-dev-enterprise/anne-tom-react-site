import React from "react";

export const PixIcon = ({ className = "" }) => (
  <svg viewBox="0 0 32 32" width={24} height={24} className={className} fill="none"><rect width="32" height="32" rx="8" fill="#06B26B"/><path d="M16 8l8 8-8 8-8-8 8-8z" fill="#fff"/></svg>
);

export const CardIcon = ({ className = "" }) => (
  <svg viewBox="0 0 32 32" width={24} height={24} className={className} fill="none"><rect width="32" height="32" rx="8" fill="#2563eb"/><rect x="7" y="13" width="18" height="10" rx="2" fill="#fff"/><rect x="7" y="11" width="18" height="4" fill="#dbeafe"/><rect x="10" y="19" width="4" height="2" rx="1" fill="#a5b4fc"/></svg>
);

export const MoneyIcon = ({ className = "" }) => (
  <svg viewBox="0 0 32 32" width={24} height={24} className={className} fill="none"><rect width="32" height="32" rx="8" fill="#f59e42"/><rect x="8" y="13" width="16" height="6" rx="2" fill="#fff7ed"/><circle cx="16" cy="16" r="2" fill="#f59e42"/></svg>
);
