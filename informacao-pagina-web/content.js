(async () => {
  const getMetaContent = (name) => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.content : null;
  };

  const getOgContent = (property) => {
    const meta = document.querySelector(`meta[property="og:${property}"]`);
    return meta ? meta.content : null;
  };

  const getTwitterContent = (name) => {
    const meta = document.querySelector(`meta[name="twitter:${name}"]`);
    return meta ? meta.content : null;
  };

  const getHeadings = () => {
    const headings = {};
    for (let i = 1; i <= 6; i++) {
      const hTags = Array.from(document.querySelectorAll(`h${i}`)).map(
        (h) => h.innerText,
      );
      if (hTags.length) {
        headings[`h${i}`] = hTags;
      }
    }
    return headings;
  };

  const getLinks = () => {
    return Array.from(document.querySelectorAll("a")).map((a) => ({
      href: a.href,
      text: a.innerText,
      rel: a.rel,
      target: a.target,
    }));
  };

  const getPerformance = () => {
    const timing = performance.getEntriesByType("navigation")[0];
    return timing ? timing.duration : null;
  };

  const getCookies = () => {
    return document.cookie;
  };

  const getStorage = (type) => {
    try {
      const storage = window[type];
      const items = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        items[key] = storage.getItem(key);
      }
      return items;
    } catch (e) {
      return { error: e.message };
    }
  };

  const getTechnologies = () => {
    try {
      const scripts = Array.from(document.querySelectorAll("script[src]")).map(
        (s) => s.src,
      );
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      ).map((l) => l.href);

      const technologies = new Set();

      scripts.forEach((script) => {
        if (script.includes("jquery")) technologies.add("jQuery");
        if (script.includes("react")) technologies.add("React");
        if (script.includes("angular")) technologies.add("Angular");
        if (script.includes("vue")) technologies.add("Vue");
        if (script.includes("bootstrap")) technologies.add("Bootstrap");
      });

      styles.forEach((style) => {
        if (style.includes("bootstrap")) technologies.add("Bootstrap");
      });

      return Array.from(technologies);
    } catch (e) {
      return { error: e.message };
    }
  };

  const pageInfo = {
    title: document.title,
    description: getMetaContent("description"),
    keywords: getMetaContent("keywords"),
    author: getMetaContent("author"),
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    og: {
      title: getOgContent("title"),
      description: getOgContent("description"),
      image: getOgContent("image"),
      url: getOgContent("url"),
      type: getOgContent("type"),
      site_name: getOgContent("site_name"),
    },
    twitter: {
      card: getTwitterContent("card"),
      title: getTwitterContent("title"),
      description: getTwitterContent("description"),
      image: getTwitterContent("image"),
      creator: getTwitterContent("creator"),
    },
    headings: getHeadings(),
    links: getLinks(),
    loadTime: getPerformance(),
    jsErrors: [], // This would require a more complex setup to capture
    cookies: getCookies(),
    localStorage: getStorage("localStorage"),
    sessionStorage: getStorage("sessionStorage"),
    technologies: getTechnologies(),
  };

  chrome.runtime.sendMessage({ type: "pageInfo", data: pageInfo });
})();
