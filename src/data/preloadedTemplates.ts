import { EmailTemplate } from '../types/template';

export const preloadedTemplates: EmailTemplate[] = [
  {
    id: 'welcome-template',
    name: 'Welcome Email',
    category: 'welcome',
    subject: 'Welcome to WebFudge - Let\'s Build Something Amazing!',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to WebFudge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tbody>
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tbody>
                            <!-- Header with Logo and Gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px;">WebFudge</h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Marketing Excellence</p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Welcome Aboard!</h2>
                                    
                                    <p style="color: #666666; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                                        Thank you for choosing WebFudge as your digital marketing partner. We're excited to help you achieve your business goals and elevate your online presence.
                                    </p>
                                    
                                    <p style="color: #666666; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                                        Our team is dedicated to delivering exceptional results through innovative strategies and creative solutions.
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="https://www.webfudge.in/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Get Started</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <p style="color: #666666; margin: 24px 0 0 0; font-size: 16px; line-height: 1.6;">
                                        If you have any questions, feel free to reach out to our team anytime.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        © 2025 WebFudge. All rights reserved.
                                    </p>
                                    <p style="color: #999999; margin: 0; font-size: 14px;">
                                        <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none;">Visit our website</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`,
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false
  },
  {
    id: 'newsletter-template',
    name: 'Newsletter',
    category: 'newsletter',
    subject: 'WebFudge Monthly Newsletter - Digital Marketing Insights',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebFudge Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tbody>
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tbody>
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">WebFudge Newsletter</h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">December 2025 Edition</p>
                                </td>
                            </tr>
                            
                            <!-- Featured Article -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">This Month's Highlights</h2>
                                    
                                    <!-- Article 1 -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 18px;">Marketing Trends for 2025</h3>
                                                    <p style="color: #666666; margin: 0 0 12px 0; font-size: 15px; line-height: 1.6;">
                                                        Discover the latest trends shaping digital marketing this year. From AI-powered campaigns to personalized customer experiences.
                                                    </p>
                                                    <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">Read More →</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <!-- Article 2 -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 18px;">Success Story: Client Growth</h3>
                                                    <p style="color: #666666; margin: 0 0 12px 0; font-size: 15px; line-height: 1.6;">
                                                        See how we helped our clients achieve 300% ROI through strategic digital marketing campaigns.
                                                    </p>
                                                    <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">Read More →</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <!-- CTA Section -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; padding: 30px; margin-top: 30px;">
                                        <tbody>
                                            <tr>
                                                <td align="center">
                                                    <h3 style="color: #333333; margin: 0 0 16px 0; font-size: 20px;">Ready to Grow Your Business?</h3>
                                                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 15px;">Let's discuss your marketing goals</p>
                                                    <a href="https://www.webfudge.in/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 600;">Schedule a Call</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        © 2025 WebFudge. All rights reserved.
                                    </p>
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none;">Visit Website</a> | 
                                        <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`,
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false
  },
  {
    id: 'promotional-template',
    name: 'Promotional Offer',
    category: 'promotional',
    subject: 'Special Offer: 20% Off WebFudge Marketing Services',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Offer from WebFudge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tbody>
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tbody>
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px;">WebFudge</h1>
                                </td>
                            </tr>
                            
                            <!-- Offer Banner -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                                    <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 36px;">20% OFF</h2>
                                    <p style="color: #ffffff; margin: 0; font-size: 18px;">Limited Time Offer</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Exclusive Discount on All Services</h2>
                                    
                                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                        For a limited time, get 20% off on all WebFudge marketing services. Whether you need SEO, social media management, or content marketing, we've got you covered.
                                    </p>
                                    
                                    <!-- Services List -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 15px; border-left: 3px solid #667eea;">
                                                    <p style="color: #333333; margin: 0; font-size: 16px; font-weight: 600;">✓ Digital Marketing Strategy</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px; border-left: 3px solid #667eea;">
                                                    <p style="color: #333333; margin: 0; font-size: 16px; font-weight: 600;">✓ SEO & Content Marketing</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px; border-left: 3px solid #667eea;">
                                                    <p style="color: #333333; margin: 0; font-size: 16px; font-weight: 600;">✓ Social Media Management</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px; border-left: 3px solid #667eea;">
                                                    <p style="color: #333333; margin: 0; font-size: 16px; font-weight: 600;">✓ Email Marketing Campaigns</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <!-- Urgency -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 6px; padding: 20px; margin: 30px 0;">
                                        <tbody>
                                            <tr>
                                                <td align="center">
                                                    <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 600;">Offer ends December 31, 2025</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="https://www.webfudge.in/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: 600;">Claim Your Discount</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        © 2025 WebFudge. All rights reserved.
                                    </p>
                                    <p style="color: #999999; margin: 0; font-size: 14px;">
                                        <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none;">Visit our website</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`,
    thumbnail: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false
  },
  {
    id: 'follow-up-template',
    name: 'Follow-Up Email',
    category: 'follow-up',
    subject: 'Following Up - WebFudge Marketing Solutions',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Follow-Up from WebFudge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tbody>
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tbody>
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">WebFudge</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">Just Checking In</h2>
                                    
                                    <p style="color: #666666; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                                        Hi there,
                                    </p>
                                    
                                    <p style="color: #666666; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                                        I wanted to follow up on our previous conversation about your digital marketing needs. We're excited about the possibility of working together and helping you achieve your business goals.
                                    </p>
                                    
                                    <p style="color: #666666; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                                        At WebFudge, we specialize in creating data-driven marketing strategies that deliver measurable results. Here's what we can help you with:
                                    </p>
                                    
                                    <!-- Benefits -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 30px 0;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="color: #333333; margin: 0; font-size: 15px;">✓ Increase your online visibility</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="color: #333333; margin: 0; font-size: 15px;">✓ Generate quality leads</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="color: #333333; margin: 0; font-size: 15px;">✓ Build stronger customer relationships</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="color: #333333; margin: 0; font-size: 15px;">✓ Maximize your ROI</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <p style="color: #666666; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                                        Would you be available for a quick call this week to discuss how we can help your business grow?
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="https://www.webfudge.in/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Schedule a Call</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <p style="color: #666666; margin: 24px 0 0 0; font-size: 16px; line-height: 1.6;">
                                        Looking forward to hearing from you!
                                    </p>
                                    
                                    <p style="color: #666666; margin: 16px 0 0 0; font-size: 16px; line-height: 1.6;">
                                        Best regards,<br>
                                        The WebFudge Team
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        © 2025 WebFudge. All rights reserved.
                                    </p>
                                    <p style="color: #999999; margin: 0; font-size: 14px;">
                                        <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none;">Visit our website</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false
  }
];
