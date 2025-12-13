export function WelcomeEmail() {
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
      {/* Header with Logo */}
      <tr>
        <td style={{ padding: '40px 30px', textAlign: 'center', backgroundColor: '#1a1a1a' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>
            WEBFUDGE
          </div>
          <div style={{ fontSize: '12px', color: '#999999', marginTop: '5px', letterSpacing: '2px' }}>
            DIGITAL MARKETING AGENCY
          </div>
        </td>
      </tr>

      {/* Hero Section */}
      <tr>
        <td style={{ padding: '0' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '50px 30px',
              textAlign: 'center',
              color: '#ffffff',
            }}
          >
            <h1 style={{ margin: '0 0 15px 0', fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
              Welcome to WebFudge! 🎉
            </h1>
            <p style={{ margin: '0', fontSize: '18px', color: '#ffffff', opacity: 0.95 }}>
              We're excited to have you on board
            </p>
          </div>
        </td>
      </tr>

      {/* Main Content */}
      <tr>
        <td style={{ padding: '40px 30px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 20px 0' }}>
            Hi there! 👋
          </p>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 20px 0' }}>
            Thank you for choosing WebFudge as your digital marketing partner. We're thrilled to help you 
            grow your online presence and achieve your business goals.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 30px 0' }}>
            Our team of experts is ready to deliver outstanding results in:
          </p>

          {/* Services List */}
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginBottom: '30px' }}>
            <tbody>
            {[
              { icon: '🎨', title: 'Brand Strategy', desc: 'Building memorable brand identities' },
              { icon: '📱', title: 'Social Media Marketing', desc: 'Engaging your target audience' },
              { icon: '🚀', title: 'Digital Campaigns', desc: 'Driving growth and conversions' },
              { icon: '📊', title: 'Analytics & Insights', desc: 'Data-driven decision making' },
            ].map((service, index) => (
              <tr key={index}>
                <td style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
                    <tbody>
                    <tr>
                      <td style={{ width: '50px', fontSize: '32px', verticalAlign: 'top' }}>
                        {service.icon}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '16px', color: '#333333', marginBottom: '5px' }}>
                          {service.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666666' }}>
                          {service.desc}
                        </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* CTA Button */}
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginTop: '30px' }}>
            <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>
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
                  }}
                >
                  Get Started
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>

      {/* Footer */}
      <tr>
        <td style={{ padding: '30px', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666666', margin: '0 0 15px 0', textAlign: 'center' }}>
            Need help? We're here for you!
          </p>
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666666', margin: '0 0 20px 0', textAlign: 'center' }}>
            Email: <a href="mailto:hello@webfudge.in" style={{ color: '#667eea', textDecoration: 'none' }}>hello@webfudge.in</a>
            <br />
            Web: <a href="https://www.webfudge.in/" style={{ color: '#667eea', textDecoration: 'none' }}>www.webfudge.in</a>
          </p>
          
          {/* Social Links */}
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginTop: '20px' }}>
            <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>
                <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#666666', textDecoration: 'none', fontSize: '24px' }}>📘</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#666666', textDecoration: 'none', fontSize: '24px' }}>📷</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#666666', textDecoration: 'none', fontSize: '24px' }}>🐦</a>
                <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#666666', textDecoration: 'none', fontSize: '24px' }}>💼</a>
              </td>
            </tr>
            </tbody>
          </table>

          <p style={{ fontSize: '12px', lineHeight: '18px', color: '#999999', margin: '20px 0 0 0', textAlign: 'center' }}>
            © 2025 WebFudge. All rights reserved.
            <br />
            You're receiving this email because you signed up for WebFudge services.
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  );
}
