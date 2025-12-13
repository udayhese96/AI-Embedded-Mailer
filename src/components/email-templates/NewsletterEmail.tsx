export function NewsletterEmail() {
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
            MARKETING INSIGHTS & UPDATES
          </div>
        </td>
      </tr>

      {/* Header Image/Banner */}
      <tr>
        <td style={{ padding: '0' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '40px 30px',
              textAlign: 'center',
            }}
          >
            <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>
              📬 Monthly Newsletter
            </h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '16px', color: '#ffffff', opacity: 0.95 }}>
              December 2025 Edition
            </p>
          </div>
        </td>
      </tr>

      {/* Introduction */}
      <tr>
        <td style={{ padding: '30px 30px 20px 30px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0' }}>
            Hey there! Here's what's trending in digital marketing this month and how we can help you stay ahead of the curve.
          </p>
        </td>
      </tr>

      {/* Featured Article */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '25px' }}>
            <div style={{ fontSize: '12px', color: '#667eea', fontWeight: '600', letterSpacing: '1px', marginBottom: '10px' }}>
              FEATURED ARTICLE
            </div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#1a1a1a' }}>
              5 Marketing Trends That Will Dominate 2025
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '22px', color: '#555555', margin: '0 0 20px 0' }}>
              From AI-powered personalization to immersive brand experiences, discover the trends that will shape the future of digital marketing.
            </p>
            <a
              href="#"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#667eea',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Read More →
            </a>
          </div>
        </td>
      </tr>

      {/* Quick Tips Section */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1a1a1a' }}>
            💡 Quick Marketing Tips
          </h3>
          
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tbody>
            {[
              { title: 'Optimize for Mobile', desc: 'Over 60% of emails are opened on mobile devices' },
              { title: 'Use Video Content', desc: 'Videos increase engagement by up to 300%' },
              { title: 'Personalize Everything', desc: 'Personalized emails deliver 6x higher transaction rates' },
            ].map((tip, index) => (
              <tr key={index}>
                <td style={{ paddingBottom: '15px' }}>
                  <div style={{ borderLeft: '3px solid #667eea', paddingLeft: '15px' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#333333', marginBottom: '5px' }}>
                      {tip.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666666' }}>
                      {tip.desc}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </td>
      </tr>

      {/* Case Study/Success Story */}
      <tr>
        <td style={{ padding: '20px 30px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: '#ffffff',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '10px', opacity: 0.9 }}>
              CLIENT SUCCESS STORY
            </div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#ffffff' }}>
              How We Increased ROI by 250% in 3 Months
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '22px', color: '#ffffff', margin: '0', opacity: 0.95 }}>
              See how our data-driven approach helped a client triple their return on investment through strategic digital campaigns.
            </p>
          </div>
        </td>
      </tr>

      {/* Call to Action */}
      <tr>
        <td style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#333333', margin: '0 0 20px 0' }}>
            Ready to transform your marketing strategy?
          </p>
          <a
            href="https://www.webfudge.in/"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Let's Talk
          </a>
        </td>
      </tr>

      {/* Footer */}
      <tr>
        <td style={{ padding: '30px', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tbody>
            <tr>
              <td style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '5px' }}>
                  WEBFUDGE
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666666', margin: '0 0 15px 0', textAlign: 'center' }}>
            Contact: <a href="mailto:hello@webfudge.in" style={{ color: '#667eea', textDecoration: 'none' }}>hello@webfudge.in</a>
            <br />
            Website: <a href="https://www.webfudge.in/" style={{ color: '#667eea', textDecoration: 'none' }}>www.webfudge.in</a>
          </p>
          
          <p style={{ fontSize: '12px', lineHeight: '18px', color: '#999999', margin: '20px 0 0 0', textAlign: 'center' }}>
            © 2025 WebFudge. All rights reserved.
            <br />
            <a href="#" style={{ color: '#999999', textDecoration: 'underline' }}>Unsubscribe</a> | 
            <a href="#" style={{ color: '#999999', textDecoration: 'underline' }}> Preferences</a>
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  );
}
