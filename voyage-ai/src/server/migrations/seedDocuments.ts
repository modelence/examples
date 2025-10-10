import { dbDocuments } from '../voyage/db';

export async function seedDocuments() {
  const now = new Date();
  const documents: { content: string; title: string; description: string; createdAt: Date }[] = [
    {
      content: 'Q: How do I reset my password?\nA: To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and we will send you a password reset link. The link expires in 24 hours for security reasons.',
      title: 'How do I reset my password?',
      description: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and we will send you a password reset link. The link expires in 24 hours for security reasons.',
      createdAt: now,
    },
    {
      content: 'Q: What payment methods do you accept?\nA: We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our PCI-compliant payment gateway.',
      title: 'What payment methods do you accept?',
      description: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our PCI-compliant payment gateway.',
      createdAt: now,
    },
    {
      content: 'Q: How long does shipping take?\nA: Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. International orders may take 10-14 business days. You will receive a tracking number once your order ships.',
      title: 'How long does shipping take?',
      description: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. International orders may take 10-14 business days. You will receive a tracking number once your order ships.',
      createdAt: now,
    },
    {
      content: 'Q: What is your return policy?\nA: We offer a 30-day money-back guarantee. Items must be unused and in original packaging. Contact customer support to initiate a return. Refunds are processed within 5-10 business days after we receive the returned item.',
      title: 'What is your return policy?',
      description: 'We offer a 30-day money-back guarantee. Items must be unused and in original packaging. Contact customer support to initiate a return. Refunds are processed within 5-10 business days after we receive the returned item.',
      createdAt: now,
    },
    {
      content: 'Q: How do I cancel my subscription?\nA: You can cancel your subscription anytime from your account settings. Go to Billing > Subscription > Cancel Subscription. You will retain access until the end of your current billing period. No refunds for partial months.',
      title: 'How do I cancel my subscription?',
      description: 'You can cancel your subscription anytime from your account settings. Go to Billing > Subscription > Cancel Subscription. You will retain access until the end of your current billing period. No refunds for partial months.',
      createdAt: now,
    },
    {
      content: 'Q: How do I contact customer support?\nA: Our support team is available 24/7. You can reach us via live chat on our website, email at support@example.com, or call 1-800-SUPPORT. Average response time is under 2 hours for email and instant for chat.',
      title: 'How do I contact customer support?',
      description: 'Our support team is available 24/7. You can reach us via live chat on our website, email at support@example.com, or call 1-800-SUPPORT. Average response time is under 2 hours for email and instant for chat.',
      createdAt: now,
    },
    {
      content: 'Q: Is my data secure?\nA: Yes, we use industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and GDPR compliant. We never share your data with third parties without consent.',
      title: 'Is my data secure?',
      description: 'Yes, we use industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and GDPR compliant. We never share your data with third parties without consent.',
      createdAt: now,
    },
    {
      content: 'Q: How do I upgrade my plan?\nA: To upgrade your plan, go to Account Settings > Subscription > Change Plan. Select your desired plan and confirm. Upgrades take effect immediately and you will be charged a prorated amount for the current billing period.',
      title: 'How do I upgrade my plan?',
      description: 'To upgrade your plan, go to Account Settings > Subscription > Change Plan. Select your desired plan and confirm. Upgrades take effect immediately and you will be charged a prorated amount for the current billing period.',
      createdAt: now,
    },
    {
      content: 'Q: Can I use the service on multiple devices?\nA: Yes, you can access your account from unlimited devices. However, concurrent sessions are limited based on your plan: Basic allows 1 session, Pro allows 3 sessions, and Enterprise allows unlimited concurrent sessions.',
      title: 'Can I use the service on multiple devices?',
      description: 'Yes, you can access your account from unlimited devices. However, concurrent sessions are limited based on your plan: Basic allows 1 session, Pro allows 3 sessions, and Enterprise allows unlimited concurrent sessions.',
      createdAt: now,
    },
    {
      content: 'Q: Do you offer student discounts?\nA: Yes, we offer a 50% discount for verified students. Sign up with your .edu email address or verify your student status through our partner SheerID. The discount is valid for up to 4 years or until graduation.',
      title: 'Do you offer student discounts?',
      description: 'Yes, we offer a 50% discount for verified students. Sign up with your .edu email address or verify your student status through our partner SheerID. The discount is valid for up to 4 years or until graduation.',
      createdAt: now,
    },
  ];

  await dbDocuments.insertMany(documents);
  
  console.log(`Successfully seeded ${documents.length} documents`);
}
