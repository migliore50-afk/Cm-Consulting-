(() => {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    const requestUrl =
      typeof args[0] === "string"
        ? args[0]
        : args[0]?.url || "";

    const contentType =
      response.headers.get("content-type") || "";

    if (
      !requestUrl.includes("/api/admin") ||
      !contentType.includes("application/json")
    ) {
      return response;
    }

    try {
      const payload = await response.clone().json();

      if (
        payload &&
        typeof payload.qrCode === "string" &&
        payload.qrCode.trim()
      ) {
        const qr = payload.qrCode.trim();

        if (
          /^<\?xml[\s\S]*<svg[\s>]/i.test(qr) ||
          /^<svg[\s>]/i.test(qr)
        ) {
          payload.qrCode =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(qr);

          const headers = new Headers(response.headers);
          headers.set(
            "content-type",
            "application/json; charset=utf-8"
          );

          return new Response(
            JSON.stringify(payload),
            {
              status: response.status,
              statusText: response.statusText,
              headers
            }
          );
        }
      }
    } catch (_) {}

    return response;
  };
})();
