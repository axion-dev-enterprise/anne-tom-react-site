import { useEffect, useState } from "react";

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|Mobile/i;
const APP_WEBVIEW_PARAM_RE = /(?:app_webview|source)=app\b/i;
const APP_WEBVIEW_UA_RE = /Anne\s?&?\s?Tom|AnneTomApp|AnneTomWebView|AnneTomMobile/i;

const getNavigatorUserAgent = () => {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || "";
};

const getWindowSearch = () => {
  if (typeof window === "undefined") return "";
  return window.location.search || "";
};

export const useAppAccessInfo = () => {
  const [info, setInfo] = useState({
    isAppWebView: false,
    isMobileBrowser: false,
    hasAppParam: false,
    initialized: false,
  });

  useEffect(() => {
    const userAgent = getNavigatorUserAgent();
    const search = getWindowSearch();
    const hasAppParam = APP_WEBVIEW_PARAM_RE.test(search);
    const isAppWebView = hasAppParam || APP_WEBVIEW_UA_RE.test(userAgent);
    const isMobileBrowser = MOBILE_UA_RE.test(userAgent) && !isAppWebView;

    setInfo({
      isAppWebView,
      isMobileBrowser,
      hasAppParam,
      initialized: true,
    });
  }, []);

  return info;
};
