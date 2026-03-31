import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components";

interface ScanReportEmailProps {
  subject?: string;
  results: {
    successful: number;
    totalSites: number;
    failed: number;
    totalViolations: number;
  };
  dashboardUrl?: string;
}

export function ScanReportEmail({
  results,
  dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
}: ScanReportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`A11y scan complete — ${results.totalViolations} violations across ${results.successful} pages`}
      </Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            margin: "40px auto",
            padding: "40px",
            maxWidth: "560px",
          }}
        >
          <Heading style={{ fontSize: "24px", color: "#1a1a2e", marginBottom: "8px" }}>
            ♿ Accessibility Scan Report
          </Heading>
          <Text style={{ color: "#6b7280", marginTop: 0 }}>
            Your scheduled accessibility scan has completed.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Section>
            <Row>
              <Column style={{ textAlign: "center", padding: "16px" }}>
                <Text style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6", margin: 0 }}>
                  {String(results.successful)}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                  Pages Scanned
                </Text>
              </Column>
              <Column style={{ textAlign: "center", padding: "16px" }}>
                <Text
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: results.totalViolations > 0 ? "#ef4444" : "#22c55e",
                    margin: 0,
                  }}
                >
                  {String(results.totalViolations)}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                  Total Violations
                </Text>
              </Column>
              {results.failed > 0 && (
                <Column style={{ textAlign: "center", padding: "16px" }}>
                  <Text style={{ fontSize: "32px", fontWeight: "bold", color: "#f97316", margin: 0 }}>
                    {String(results.failed)}
                  </Text>
                  <Text style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                    Failed
                  </Text>
                </Column>
              )}
            </Row>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Text style={{ color: "#374151" }}>
            View the full report and breakdown in your dashboard:
          </Text>

          <Link
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              borderRadius: "6px",
              padding: "12px 24px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Open Dashboard
          </Link>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            This is an automated report from A11y Monitor.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ScanReportEmail;
