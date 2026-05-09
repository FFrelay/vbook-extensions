//    var host = 'https://www.69shuba.com';
let BASE_URL = 'https://www.69shuba.com';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}