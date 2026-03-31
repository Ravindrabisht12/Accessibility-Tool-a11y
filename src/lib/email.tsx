import { Resend } from "resend";
import { render } from "@react-email/render";
import { ScanReportEmail } from "../../emails/scan-report";

// Lazy-initialize Resend so missing API key doesn't break build-time module evaluation
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

interface SendReportParams {
  subject: string;
  results: {
    successful: number;
    totalSites: number;
    failed: number;
    totalViolations: number;
  };
}

export async function sendScanReportEmail({ subject, results }: SendReportParams) {
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM;

  if (!to || !from) {
    console.warn("EMAIL_TO or EMAIL_FROM not configured — skipping email");
    return;
  }

  const html = await render(<ScanReportEmail results={results} />);

  const { error } = await getResend().emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send scan report email:", error.message);
  } else {
    console.log("✅ Scan report email sent");
  }
}
