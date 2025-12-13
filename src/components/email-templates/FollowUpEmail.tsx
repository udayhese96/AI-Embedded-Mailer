export function FollowUpEmail() {
  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      <tbody>
      {/* Header */}
      <tr>
        <td style={{ padding: '30px', textAlign: 'center', backgroundColor: '#1a1a1a' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>
            WEBFUDGE
          </div>
          <div style={{ fontSize: '11px', color: '#999999', marginTop: '5px', letterSpacing: '2px' }}>
            DIGITAL MARKETING AGENCY
          </div>
        </td>
      </tr>

      {/* Personal Touch */}
      <tr>
        <td style={{ padding: '40px 30px 20px 30px' }}>
          <h1 style={{ margin: '0 0 20px 0', fontSize: '26px', color: '#1a1a1a' }}>
            Just Checking In 👋
          </h1>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 20px 0' }}>
            Hi [Name],
          </p>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 20px 0' }}>
            I wanted to reach out personally to see how things are going. We haven't heard from you in a while, 
            and I'd love to know if there's anything we can do to help you achieve your marketing goals.
          </p>
        </td>
      </tr>

      {/* Value Proposition */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '30px',
              color: '#ffffff',
            }}
          >
            <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#ffffff' }}>
              Here's What We Can Do For You
            </h2>
            <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
              <tbody>
              {[
                'Free marketing audit of your current strategy',
                'Personalized growth plan tailored to your business',
                '30-minute consultation with our strategy team',
                'Competitive analysis report',
              ].map((item, index) => (
                <tr key={index}>
                  <td style={{ paddingBottom: '12px' }}>
                    <div style={{ fontSize: '15px', lineHeight: '22px', color: '#ffffff' }}>
                      ✓ {item}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>

      {/* Social Proof */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1a1a1a' }}>
            Recent Success Stories
          </h3>
          
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tbody>
            {[
              { metric: '300%', label: 'Increase in Social Engagement', client: 'Fashion Retailer' },
              { metric: '2.5x', label: 'ROI Improvement', client: 'SaaS Startup' },
              { metric: '150K', label: 'New Leads Generated', client: 'B2B Company' },
            ].map((success, index) => (
              <tr key={index}>
                <td style={{ paddingBottom: '20px' }}>
                  <div
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderLeft: '4px solid #667eea',
                      padding: '20px',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                      {success.metric}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '5px' }}>
                      {success.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666666' }}>
                      {success.client}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </td>
      </tr>

      {/* Simple Ask */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 20px 0' }}>
            I'd love to set up a quick call to discuss:
          </p>
          <ul style={{ fontSize: '15px', lineHeight: '26px', color: '#555555', margin: '0 0 20px 0', paddingLeft: '20px' }}>
            <li>Your current marketing challenges</li>
            <li>Opportunities we've identified for your industry</li>
            <li>How we can help you stand out from competitors</li>
          </ul>
        </td>
      </tr>

      {/* CTA */}
      <tr>
        <td style={{ padding: '20px 30px 40px 30px', textAlign: 'center' }}>
          <a
            href="https://www.webfudge.in/"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#667eea',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '15px',
            }}
          >
            Schedule a Free Consultation
          </a>
          <p style={{ margin: '0', fontSize: '14px', color: '#666666' }}>
            or simply reply to this email - I read every response personally
          </p>
        </td>
      </tr>

      {/* Alternative CTA */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '25px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '15px', color: '#333333', margin: '0 0 15px 0' }}>
              Not ready for a call yet? No problem!
            </p>
            <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 20px 0' }}>
              Download our free guide:
            </p>
            <a
              href="#"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#ffffff',
                color: '#667eea',
                border: '2px solid #667eea',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              "10 Marketing Mistakes to Avoid in 2025"
            </a>
          </div>
        </td>
      </tr>

      {/* Personal Sign-off */}
      <tr>
        <td style={{ padding: '30px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 10px 0' }}>
            Looking forward to connecting,
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 5px 0' }}>
            [Your Name]
          </p>
          <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
            Marketing Strategist, WebFudge
          </p>
        </td>
      </tr>

      {/* Footer */}
      <tr>
        <td style={{ padding: '30px', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tr>
              <td style={{ textAlign: 'center', paddingBottom: '15px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '5px' }}>
                  WEBFUDGE
                </div>
              </td>
            </tr>
          </table>
          
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666666', margin: '0 0 15px 0', textAlign: 'center' }}>
            📧 <a href="mailto:hello@webfudge.in" style={{ color: '#667eea', textDecoration: 'none' }}>hello@webfudge.in</a>
            <br />
            🌐 <a href="https://www.webfudge.in/" style={{ color: '#667eea', textDecoration: 'none' }}>www.webfudge.in</a>
          </p>
          
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginTop: '20px' }}>
            <tr>
              <td style={{ textAlign: 'center' }}>
                <a href="#" style={{ display: 'inline-block', margin: '0 8px', fontSize: '20px' }}>📘</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 8px', fontSize: '20px' }}>📷</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 8px', fontSize: '20px' }}>🐦</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 8px', fontSize: '20px' }}>💼</a>
              </td>
            </tr>
          </table>

          <p style={{ fontSize: '12px', lineHeight: '18px', color: '#999999', margin: '20px 0 0 0', textAlign: 'center' }}>
            © 2025 WebFudge. All rights reserved.
            <br />
            <a href="#" style={{ color: '#999999', textDecoration: 'underline' }}>Update preferences</a> | 
            <a href="#" style={{ color: '#999999', textDecoration: 'underline' }}> Unsubscribe</a>
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  );
}
