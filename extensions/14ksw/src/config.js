var BASE_URL = "https://www.14ksw.com";
try {
    if (CONFIG_URL) {
        if (CONFIG_URL.indexOf("m.14ksw") >= 0) {
            BASE_URL = "https://m.14ksw.com";
        } else if (CONFIG_URL.indexOf("www.14ksw") >= 0) {
            BASE_URL = "https://www.14ksw.com";
        }
    }
} catch (e) {}
