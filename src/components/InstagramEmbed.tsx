"use client";

import { useEffect } from "react";

interface InstagramEmbedProps {
  url: string;
}

/** Strip query-string and fragment (tracking params), keep the clean URL. */
function cleanUrl(url: string): string {
  return url.split("?")[0].split("#")[0];
}

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
  const clean = cleanUrl(url);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]'
    );

    const processEmbeds = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    if (existingScript) {
      // Script already present (e.g. after client-side navigation): re-scan.
      processEmbeds();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = processEmbeds;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="mx-auto mt-6 w-full max-w-lg overflow-hidden">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={clean}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "3px",
          boxShadow:
            "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          padding: "0",
          width: "calc(100% - 2px)",
        }}
      >
        <div style={{ padding: "16px" }}>
          <a
            href={clean}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#FFFFFF",
              lineHeight: "0",
              padding: "0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#F4F4F4",
                  borderRadius: "50%",
                  flexGrow: 0,
                  height: "40px",
                  marginRight: "14px",
                  width: "40px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "4px",
                    flexGrow: 0,
                    height: "14px",
                    marginBottom: "6px",
                    width: "100px",
                  }}
                />
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "4px",
                    flexGrow: 0,
                    height: "14px",
                    width: "60px",
                  }}
                />
              </div>
            </div>
            <div style={{ padding: "19% 0" }} />
            <div
              style={{
                display: "block",
                height: "50px",
                margin: "0 auto 12px",
                width: "50px",
              }}
            />
            <div
              style={{
                paddingTop: "8px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  color: "#3897f0",
                  fontFamily: "Arial,sans-serif",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 550,
                  lineHeight: "18px",
                }}
              >
                View this post on Instagram
              </div>
            </div>
            <div style={{ padding: "12.5% 0" }} />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "14px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "50%",
                    height: "12.5px",
                    width: "12.5px",
                    transform: "translateX(0px) translateY(7px)",
                  }}
                />
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    height: "12.5px",
                    transform: "rotate(-45deg) translateX(3px) translateY(1px)",
                    width: "12.5px",
                    flexGrow: 0,
                    marginRight: "14px",
                    marginLeft: "2px",
                  }}
                />
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "50%",
                    height: "12.5px",
                    width: "12.5px",
                    transform: "translateX(9px) translateY(-18px)",
                  }}
                />
              </div>
              <div style={{ marginLeft: "8px" }}>
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "50%",
                    flexGrow: 0,
                    height: "20px",
                    width: "20px",
                  }}
                />
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderTop: "2px solid transparent",
                    borderLeft: "6px solid #f4f4f4",
                    borderBottom: "2px solid transparent",
                    transform: "translateX(16px) translateY(-4px) rotate(30deg)",
                  }}
                />
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div
                  style={{
                    width: "0px",
                    borderTop: "8px solid #F4F4F4",
                    borderRight: "8px solid transparent",
                    transform: "translateY(16px)",
                  }}
                />
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    flexGrow: 0,
                    height: "12px",
                    width: "16px",
                    transform: "translateY(-4px)",
                  }}
                />
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderTop: "8px solid #F4F4F4",
                    borderLeft: "8px solid transparent",
                    transform: "translateY(-4px) translateX(8px)",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#F4F4F4",
                  borderRadius: "4px",
                  flexGrow: 0,
                  height: "14px",
                  marginBottom: "6px",
                  width: "224px",
                }}
              />
              <div
                style={{
                  backgroundColor: "#F4F4F4",
                  borderRadius: "4px",
                  flexGrow: 0,
                  height: "14px",
                  width: "144px",
                }}
              />
            </div>
            <p
              style={{
                color: "#c9c8cd",
                fontFamily: "Arial,sans-serif",
                fontSize: "14px",
                lineHeight: "17px",
                marginBottom: "0",
                marginTop: "8px",
                overflow: "hidden",
                padding: "8px 0 7px",
                textAlign: "center",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              A post shared by @4thquarterph
            </p>
          </a>
        </div>
      </blockquote>
    </div>
  );
}
