"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./AppFrame.module.css";

const AppFrameContext = createContext({
  openMenu: () => {},
  closeMenu: () => {},
});

export const useAppFrame = () => useContext(AppFrameContext);

const AppFrame = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarBtnRef = useRef(null);
  const avatarAreaRef = useRef(null);
  const pathname = usePathname();

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => {
    setMenuOpen(false);
    // Defer blur until after state updates to ensure focus is released.
    requestAnimationFrame(() => {
      avatarBtnRef.current?.blur();
    });
  };

  useEffect(() => {
    setMenuOpen(false);
    avatarBtnRef.current?.blur();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event) => {
      if (!avatarAreaRef.current) return;
      if (!avatarAreaRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, closeMenu]);

  const value = {
    openMenu,
    closeMenu,
  };

  const isHome = pathname === "/";

  return (
    <AppFrameContext.Provider value={value}>
      <div className={styles.appFrame}>
        <nav className={styles.topNav} aria-label="主導覽">
          <div className={styles.topNavInner}>
            <div className={styles.navLeft}>
              {isHome ? (
                <h1 className={styles.navTitle}>My Apps</h1>
              ) : (
                <Link href="/" className={styles.backLink} aria-label="返回入口">
                  ←
                </Link>
              )}
            </div>

            <div className={styles.navActions}>
              <div className={styles.avatarArea} ref={avatarAreaRef}>
                <button
                  className={`${styles.avatarBtn} ${menuOpen ? styles.avatarBtnActive : ""}`}
                  ref={avatarBtnRef}
                  aria-label="開啟使用者選單"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onClick={() => (menuOpen ? closeMenu() : openMenu())}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.avatarIcon}
                    aria-hidden="true"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className={styles.avatarMenu}>
                    <div className={styles.menuHeader}>
                      <p className={styles.userName}>使用者名稱</p>
                      <p className={styles.userEmail}>user@example.com</p>
                    </div>

                    <button className={styles.menuButton} onClick={closeMenu}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.menuIcon}
                        aria-hidden="true"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.73l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.73l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      設定
                    </button>

                    <button className={`${styles.menuButton} ${styles.danger}`} onClick={closeMenu}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.menuIcon}
                        aria-hidden="true"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      登出
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {menuOpen && (
          <div className={styles.menuBackdrop} onClick={closeMenu} aria-hidden="true"></div>
        )}
        <div className={styles.appContent}>{children}</div>
      </div>
    </AppFrameContext.Provider>
  );
};

export default AppFrame;
