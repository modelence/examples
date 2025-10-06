import { dbDocuments } from '../voyage/db';
import { generateEmbedding } from '../voyage/voyage';

export async function seedDocuments() {
  const now = new Date();
  const documents: { content: string; metadata: { title: string; description: string }; embedding: number[]; createdAt: Date }[] = [
    {
      content: 'Q: How do I reset my password?\nA: To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and we will send you a password reset link. The link expires in 24 hours for security reasons.',
      metadata: {
        title: 'How do I reset my password?',
        description: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and we will send you a password reset link. The link expires in 24 hours for security reasons.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: What payment methods do you accept?\nA: We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our PCI-compliant payment gateway.',
      metadata: {
        title: 'What payment methods do you accept?',
        description: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our PCI-compliant payment gateway.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: How long does shipping take?\nA: Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. International orders may take 10-14 business days. You will receive a tracking number once your order ships.',
      metadata: {
        title: 'How long does shipping take?',
        description: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. International orders may take 10-14 business days. You will receive a tracking number once your order ships.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: What is your return policy?\nA: We offer a 30-day money-back guarantee. Items must be unused and in original packaging. Contact customer support to initiate a return. Refunds are processed within 5-10 business days after we receive the returned item.',
      metadata: {
        title: 'What is your return policy?',
        description: 'We offer a 30-day money-back guarantee. Items must be unused and in original packaging. Contact customer support to initiate a return. Refunds are processed within 5-10 business days after we receive the returned item.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: How do I cancel my subscription?\nA: You can cancel your subscription anytime from your account settings. Go to Billing > Subscription > Cancel Subscription. You will retain access until the end of your current billing period. No refunds for partial months.',
      metadata: {
        title: 'How do I cancel my subscription?',
        description: 'You can cancel your subscription anytime from your account settings. Go to Billing > Subscription > Cancel Subscription. You will retain access until the end of your current billing period. No refunds for partial months.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: How do I contact customer support?\nA: Our support team is available 24/7. You can reach us via live chat on our website, email at support@example.com, or call 1-800-SUPPORT. Average response time is under 2 hours for email and instant for chat.',
      metadata: {
        title: 'How do I contact customer support?',
        description: 'Our support team is available 24/7. You can reach us via live chat on our website, email at support@example.com, or call 1-800-SUPPORT. Average response time is under 2 hours for email and instant for chat.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: Is my data secure?\nA: Yes, we use industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and GDPR compliant. We never share your data with third parties without consent.',
      metadata: {
        title: 'Is my data secure?',
        description: 'Yes, we use industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and GDPR compliant. We never share your data with third parties without consent.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: How do I upgrade my plan?\nA: To upgrade your plan, go to Account Settings > Subscription > Change Plan. Select your desired plan and confirm. Upgrades take effect immediately and you will be charged a prorated amount for the current billing period.',
      metadata: {
        title: 'How do I upgrade my plan?',
        description: 'To upgrade your plan, go to Account Settings > Subscription > Change Plan. Select your desired plan and confirm. Upgrades take effect immediately and you will be charged a prorated amount for the current billing period.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: Can I use the service on multiple devices?\nA: Yes, you can access your account from unlimited devices. However, concurrent sessions are limited based on your plan: Basic allows 1 session, Pro allows 3 sessions, and Enterprise allows unlimited concurrent sessions.',
      metadata: {
        title: 'Can I use the service on multiple devices?',
        description: 'Yes, you can access your account from unlimited devices. However, concurrent sessions are limited based on your plan: Basic allows 1 session, Pro allows 3 sessions, and Enterprise allows unlimited concurrent sessions.',
      },
      embedding: [],
      createdAt: now,
    },
    {
      content: 'Q: Do you offer student discounts?\nA: Yes, we offer a 50% discount for verified students. Sign up with your .edu email address or verify your student status through our partner SheerID. The discount is valid for up to 4 years or until graduation.',
      metadata: {
        title: 'Do you offer student discounts?',
        description: 'Yes, we offer a 50% discount for verified students. Sign up with your .edu email address or verify your student status through our partner SheerID. The discount is valid for up to 4 years or until graduation.',
      },
      embedding: [],
      createdAt: now,
    },
  ];

  for (const doc of documents) {
    doc.embedding = await generateEmbedding(doc.content, 'document');
  }

  await dbDocuments.insertMany(documents);
  
  console.log(`Successfully seeded ${documents.length} documents`);
}
