# Tài liệu Cú pháp Crypto Bridge (VBook)

> [!NOTE]
> Bản này sử dụng **Native Bridge** giúp tốc độ xử lý nhanh hơn hàng chục lần so với các bản `.js` thuần cũ bằng cách gọi trực tiếp các hàm mã hóa chuẩn của hệ thống (Kotlin/Java).

## 1. Khởi tạo
Luôn đặt dòng này ở đầu script của bạn:
```javascript
load("crypto.js");
```

## 2. Các hàm Băm (Hash)
Mặc định trả về chuỗi Hex khi gọi `.toString()`.

| Thuật toán | Cú pháp |
| :--- | :--- |
| **MD5** | `CryptoJS.MD5(data).toString()` |
| **SHA1** | `CryptoJS.SHA1(data).toString()` |
| **SHA256** | `CryptoJS.SHA256(data).toString()` |
| **SHA512** | `CryptoJS.SHA512(data).toString()` |

## 3. Các hàm HMAC (Hash-based Message Authentication Code)
Sử dụng khi cần băm kèm theo một khóa bí mật (Secret Key).

| Thuật toán | Cú pháp |
| :--- | :--- |
| **HmacMD5** | `CryptoJS.HmacMD5(data, key).toString()` |
| **HmacSHA1** | `CryptoJS.HmacSHA1(data, key).toString()` |
| **HmacSHA256** | `CryptoJS.HmacSHA256(data, key).toString()` |
| **HmacSHA512** | `CryptoJS.HmacSHA512(data, key).toString()` |

## 4. Mã hóa AES (Advanced Encryption Standard)
Đây là hàm mã hóa mạnh nhất được hỗ trợ qua Bridge.

### Mã hóa (Encrypt)
```javascript
var encrypted = CryptoJS.AES.encrypt("Nội dung cần mã hóa", "Mật mã", {
    iv: CryptoJS.enc.Hex.parse("16_ký_tự_hex_iv"), // Tùy chọn (để trống nếu không dùng IV)
    mode: CryptoJS.mode.CBC, // CBC (mặc định), ECB, CFB, OFB, CTR
    padding: CryptoJS.pad.Pkcs7 // Pkcs7 (mặc định), NoPadding, ZeroPadding
}).toString();
```

### Giải mã (Decrypt)
```javascript
var bytes = CryptoJS.AES.decrypt(encryptedStr, "Mật mã", {
    iv: CryptoJS.enc.Hex.parse("16_ký_tự_hex_iv"),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
});
var decryptedText = bytes.toString(CryptoJS.enc.Utf8);
```

## 5. Bộ chuyển đổi định dạng (Encoders)
Dùng để chuyển đổi giữa chuỗi văn bản và đối tượng dữ liệu của CryptoJS.

| Định dạng | Parse (String -> Object) | Stringify (Object -> String) |
| :--- | :--- | :--- |
| **Base64** | `CryptoJS.enc.Base64.parse(str)` | `CryptoJS.enc.Base64.stringify(obj)` |
| **Hex** | `CryptoJS.enc.Hex.parse(str)` | `CryptoJS.enc.Hex.stringify(obj)` |
| **Utf8** | `CryptoJS.enc.Utf8.parse(str)` | `CryptoJS.enc.Utf8.stringify(obj)` |
| **Utf16** | `CryptoJS.enc.Utf16.parse(str)` | `CryptoJS.enc.Utf16.stringify(obj)` |

## 6. Mẹo tương thích ngược (Base64 cũ)
Nếu bạn muốn giữ cách viết `Base64.encode` giống file `base64_ole.js` ngày xưa nhưng dùng sức mạnh của Bridge mới, hãy thêm đoạn này:

```javascript
var Base64 = {
    encode: function(str) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
    },
    decode: function(str) {
        return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
    }
};
```

---
**Lưu ý kỹ:** 
- Các thuật toán cổ điển (DES, RC4, Rabbit) và các hàm tạo khóa nâng cao (PBKDF2) **không hỗ trợ** ở bản Bridge này. 
- Nếu gặp website yêu cầu các thuật toán đó, hãy tiếp tục dùng file `crypto_ole.js` cũ.
