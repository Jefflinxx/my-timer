import Link from "next/link";

export default function NotFound() {
  return (
    <div className="feature-wrapper">
      <div className="placeholder">
        <div>
          <h2>找不到頁面</h2>
          <p className="muted">請檢查網址或返回入口頁。</p>
          <Link className="primary-btn" href="/" style={{ marginTop: "12px" }}>
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
