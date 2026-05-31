export function emailLayout({
  heading,
  intro,
  ctaLabel,
  ctaUrl,
  outro,
}: {
  heading: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  outro: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0e0e16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e16;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#16131d;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:36px;">
            <tr><td style="color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.01em;">${heading}</td></tr>
            <tr><td style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;padding-top:12px;">${intro}</td></tr>
            <tr>
              <td style="padding-top:28px;">
                <a href="${ctaUrl}" style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 22px;border-radius:12px;">${ctaLabel}</a>
              </td>
            </tr>
            <tr><td style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;padding-top:28px;">${outro}</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;padding-top:20px;">
            <tr><td align="center" style="color:rgba(255,255,255,0.25);font-size:12px;">mySocials</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
