# E-posta şablonları (Supabase Auth)

Dört dilli (TR, EN, ES, DE) ve markalı şablonlar. Dil, kayıt sırasında kullanıcı verisine yazılan `lang` alanından seçilir; `lang` olmayan kullanıcılar (ör. Google ile girenler) İngilizce görür.

| Supabase şablonu | Dosya | Konu (Subject) |
|---|---|---|
| Confirm signup | `confirm-signup.html` | `{{ if and .Data.lang (eq .Data.lang "tr") }}Lock & Loft hesabınızı onaylayın{{ else if and .Data.lang (eq .Data.lang "es") }}Confirme su cuenta de Lock & Loft{{ else if and .Data.lang (eq .Data.lang "de") }}Bestätigen Sie Ihr Lock & Loft-Konto{{ else }}Confirm your Lock & Loft account{{ end }}` |
| Reset password | `reset-password.html` | `{{ if and .Data.lang (eq .Data.lang "tr") }}Lock & Loft şifrenizi sıfırlayın{{ else if and .Data.lang (eq .Data.lang "es") }}Restablezca su contraseña de Lock & Loft{{ else if and .Data.lang (eq .Data.lang "de") }}Lock & Loft-Passwort zurücksetzen{{ else }}Reset your Lock & Loft password{{ end }}` |
| Magic link | `magic-link.html` | `{{ if and .Data.lang (eq .Data.lang "tr") }}Lock & Loft giriş bağlantınız{{ else if and .Data.lang (eq .Data.lang "es") }}Su enlace de acceso a Lock & Loft{{ else if and .Data.lang (eq .Data.lang "de") }}Ihr Lock & Loft-Anmeldelink{{ else }}Your Lock & Loft sign-in link{{ end }}` |
| Change email address | `change-email.html` | `{{ if and .Data.lang (eq .Data.lang "tr") }}Lock & Loft e-posta değişikliğini onaylayın{{ else if and .Data.lang (eq .Data.lang "es") }}Confirme el cambio de correo de Lock & Loft{{ else if and .Data.lang (eq .Data.lang "de") }}E-Mail-Änderung bei Lock & Loft bestätigen{{ else }}Confirm your Lock & Loft email change{{ end }}` |

## Supabase'e nasıl girilir
Supabase paneli → **Authentication → Emails (Email Templates)**. Her şablon türü için:
1. **Subject** alanına yukarıdaki tablodaki konuyu yapıştırın.
2. **Message body** (HTML) alanına ilgili `.html` dosyasının tamamını yapıştırın ve kaydedin.

## Site adresi (Faz 1.8)
**Authentication → URL Configuration**
- Site URL: `https://lockandloft.com`
- Redirect URLs: `https://lockandloft.com/**` (geçiş sürecinde eski GoDaddy adresi de kalabilir)

## Gönderici (önerilen)
Supabase'in varsayılan göndericisi saatte birkaç e-postayla sınırlıdır ve gönderen adı "Supabase"dir; gerçek müşteriler için yetmez.
**Authentication → Emails → SMTP Settings** bölümünden kendi SMTP hizmetinizi bağlayın (ör. Resend, Brevo, Postmark) ve gönderici olarak `lockandloft.com` alan adından bir adres kullanın (ör. `no-reply@lockandloft.com`).
Alan adı doğrulaması için sağlayıcının verdiği SPF/DKIM kayıtları GoDaddy DNS'e eklenir.

## Dil nasıl seçiliyor
Kayıt sırasında site, kullanıcı verisine `lang` (tr/es/en/de) yazar. Şablon `.Data.lang` değerine bakar. Şifre sıfırlama e-postası da aynı kullanıcı verisini kullanır. `lang` yoksa İngilizce gider.
