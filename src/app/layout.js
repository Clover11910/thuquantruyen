import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Thư Viện Ngôn Tình',
  description: 'Đọc truyện ngôn tình online & offline',
  manifest: '/manifest.json',
  themeColor: '#E84766',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {/* Anti-DevTools Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Chống F12 / Ctrl+Shift+I / Ctrl+U
              document.addEventListener('keydown', function(e) {
                if (e.key === 'F12') { e.preventDefault(); return false; }
                if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
                if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
                if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
                if (e.ctrlKey && e.key === 'p') { e.preventDefault(); return false; }
              });
              // Chống chuột phải
              document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
              // Chống kéo thả
              document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
              // Phát hiện DevTools bằng debugger
              (function() {
                function detectDevTools() {
                  const threshold = 160;
                  const widthDiff = window.outerWidth - window.innerWidth > threshold;
                  const heightDiff = window.outerHeight - window.innerHeight > threshold;
                  if (widthDiff || heightDiff) {
                    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#E84766;"><h2>⚠️ Vui lòng tắt công cụ kiểm tra phần tử để tiếp tục đọc</h2></div>';
                  }
                }
                setInterval(detectDevTools, 1000);
              })();
              // Chống copy
              document.addEventListener('copy', function(e) { e.preventDefault(); return false; });
              document.addEventListener('cut', function(e) { e.preventDefault(); return false; });
            `,
          }}
        />

        <AuthProvider>
          {/* Cánh hoa rơi */}
          <div className="petal"></div>
          <div className="petal"></div>
          <div className="petal"></div>
          <div className="petal"></div>
          <div className="petal"></div>
          <div className="petal"></div>

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}