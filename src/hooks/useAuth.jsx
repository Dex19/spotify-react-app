import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function useAuth(code) {
  const firstEffectRan = useRef(false);
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    if (!firstEffectRan.current) {
      axios
        .post(`${import.meta.env.VITE_SERVER_URL}/login`, {
          code,
        })
        .then((res) => {
          console.log(res.data);
          setAccessToken(res.data.accessToken);
          setRefreshToken(res.data.refreshToken);
          setExpiresIn(res.data.expiresIn);
          window.history.pushState({}, null, "/");
        })
        .catch(() => {
          window.location = "/";
        });
      firstEffectRan.current = true;
    }
  }, [code]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post(`${import.meta.env.VITE_SERVER_URL}/refresh`, {
          refreshToken,
        })
        .then((res) => {
          console.log(res.data);
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          window.location = "/";
        });
    }, (expiresIn - 60) * 1000);

    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return accessToken;
}
