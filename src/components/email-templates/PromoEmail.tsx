export function PromoEmail() {
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
        <td style={{ padding: '25px 30px', textAlign: 'center', backgroundColor: '#1a1a1a' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>
            WEBFUDGE
          </div>
        </td>
      </tr>

      {/* Announcement Badge */}
      <tr>
        <td style={{ padding: '30px 30px 0 30px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: '#ff6b6b',
              color: '#ffffff',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '1px',
            }}
          >
            LIMITED TIME OFFER
          </div>
        </td>
      </tr>

      {/* Hero Section */}
      <tr>
        <td style={{ padding: '30px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              padding: '50px 30px',
              textAlign: 'center',
            }}
          >
            <h1 style={{ margin: '0 0 15px 0', fontSize: '36px', fontWeight: '700', color: '#1a1a1a' }}>
              Get 30% OFF
            </h1>
            <p style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1a1a1a', fontWeight: '600' }}>
              On All Digital Marketing Packages
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#333333' }}>
              New Year Special - Valid Until December 31st
            </p>
          </div>
        </td>
      </tr>

      {/* Offer Details */}
      <tr>
        <td style={{ padding: '0 30px 30px 30px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', margin: '0 0 30px 0', textAlign: 'center' }}>
            Start the new year with a powerful marketing strategy. Our comprehensive packages are designed to boost your brand visibility and drive real results.
          </p>

          {/* Package Cards */}
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tbody>
            {[
              {
                name: 'Starter Package',
                original: '$999',
                discounted: '$699',
                features: ['Social Media Management', 'Content Creation', 'Monthly Reports'],
              },
              {
                name: 'Growth Package',
                original: '$1,999',
                discounted: '$1,399',
                features: ['Everything in Starter', 'Paid Advertising', 'SEO Optimization', 'Email Campaigns'],
              },
              {
                name: 'Enterprise Package',
                original: '$3,999',
                discounted: '$2,799',
                features: ['Everything in Growth', 'Custom Strategy', 'Dedicated Account Manager', '24/7 Support'],
              },
            ].map((pkg, index) => (
              <tr key={index}>
                <td style={{ paddingBottom: '20px' }}>
                  <div
                    style={{
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      padding: '25px',
                      backgroundColor: index === 1 ? '#f8f9fa' : '#ffffff',
                    }}
                  >
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#1a1a1a' }}>
                      {pkg.name}
                    </h3>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontSize: '16px', color: '#999999', textDecoration: 'line-through', marginRight: '10px' }}>
                        {pkg.original}
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                        {pkg.discounted}
                      </span>
                      <span style={{ fontSize: '14px', color: '#666666' }}>/month</span>
                    </div>
                    <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '15px' }}>
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} style={{ fontSize: '14px', color: '#555555', marginBottom: '8px' }}>
                          ✓ {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </td>
      </tr>

      {/* Urgency Message */}
      <tr>
        <td style={{ padding: '0 30px 30px 30px' }}>
          <div
            style={{
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0', fontSize: '15px', color: '#856404', fontWeight: '600' }}>
              ⏰ Hurry! Only 5 spots left at this discounted rate
            </p>
          </div>
        </td>
      </tr>

      {/* CTA Button */}
      <tr>
        <td style={{ padding: '0 30px 40px 30px', textAlign: 'center' }}>
          <a
            href="https://www.webfudge.in/"
            style={{
              display: 'inline-block',
              padding: '18px 50px',
              backgroundColor: '#667eea',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '18px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            Claim Your Discount Now
          </a>
          <p style={{ margin: '20px 0 0 0', fontSize: '13px', color: '#999999' }}>
            No credit card required • Free consultation included
          </p>
        </td>
      </tr>

      {/* Testimonial */}
      <tr>
        <td style={{ padding: '30px', backgroundColor: '#f8f9fa' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <p style={{ fontSize: '16px', lineHeight: '24px', color: '#333333', fontStyle: 'italic', margin: '0 0 15px 0' }}>
              "WebFudge transformed our online presence! Within 3 months, our engagement increased by 400% and sales doubled. Best investment we've made!"
            </p>
            <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
              <strong>Sarah Johnson</strong> - CEO, TechStart Inc.
            </p>
          </div>
        </td>
      </tr>

      {/* Footer */}
      <tr>
        <td style={{ padding: '30px', backgroundColor: '#1a1a1a' }}>
          <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
            <tbody>
            <tr>
              <td style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px' }}>
                  WEBFUDGE
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#999999', margin: '0 0 15px 0', textAlign: 'center' }}>
            Questions? Reach out to us:
            <br />
            <a href="mailto:hello@webfudge.in" style={{ color: '#667eea', textDecoration: 'none' }}>hello@webfudge.in</a>
            {' | '}
            <a href="https://www.webfudge.in/" style={{ color: '#667eea', textDecoration: 'none' }}>www.webfudge.in</a>
          </p>
          
          <p style={{ fontSize: '11px', lineHeight: '16px', color: '#666666', margin: '20px 0 0 0', textAlign: 'center' }}>
            © 2025 WebFudge. All rights reserved.
            <br />
            This offer cannot be combined with other promotions.
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  );
}
