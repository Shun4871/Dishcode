// components/CookieConsent.tsx
"use client";

import { useState, useEffect, FC } from "react";
import Cookies from "js-cookie";

const CookieConsent: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // まだ consent が保存されていなければバナーを表示
    const consent = Cookies.get("cookieConsent");
    if (consent !== "accepted" && consent !== "declined") {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    Cookies.set("cookieConsent", "accepted", { expires: 365 });
    setVisible(false);
  };

  const decline = () => {
    Cookies.set("cookieConsent", "declined", { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#333",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <span>当サイトでは Cookie を使用します。よろしいですか？</span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={accept}
          style={{
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          すべてのCookieを受け入れる
        </button>
        <button
          onClick={decline}
          style={{
            background: "#f44336",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          すべて拒否する
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;