if (window.location.hostname === "adexgpt.vercel.app") {
    var currentPath = window.location.pathname + window.location.search + window.location.hash;
    var newUrl = "https://adexgpt.adexpartners.com" + currentPath;
    window.location.href = newUrl;
}
