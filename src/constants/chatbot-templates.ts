import { ChatbotNode, ChatbotEdge, FlowNodeData, MessageNodeData } from '@/types/nodes';

export interface ChatbotTemplate {
  id: string;
  name: string;
  description: string;
  category: 'all' | 'lead_gen' | 'support' | 'sales' | 'automation';
  badge: string;
  icon: string;
  trigger: string;
  nodes: ChatbotNode[];
  edges: ChatbotEdge[];
}

export const CHATBOT_TEMPLATES: ChatbotTemplate[] = [
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Begin with a clean canvas. Ideal for crafting unique, custom conversation paths.',
    category: 'all',
    badge: 'Custom',
    icon: 'Sparkles',
    trigger: 'hello',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 280, y: 50 },
        data: {
          label: 'Start Trigger',
          content: 'Triggered when keyword matches',
          trigger: 'hello',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 280, y: 200 },
        data: {
          label: 'Welcome Message',
          content: '[Hi|Hello] {{name}}! How can we assist you today?',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [{ id: 'e-start-1', source: 'flow-1', target: 'msg-1' }],
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Bot',
    description: 'Engage inbound prospects, identify their requirements, budget range, and capture high-intent leads.',
    category: 'lead_gen',
    badge: 'Popular',
    icon: 'Target',
    trigger: 'quote',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 300, y: 50 },
        data: {
          label: 'Lead Capture Trigger',
          content: 'Triggered on quote or inquiry',
          trigger: 'quote',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 300, y: 200 },
        data: {
          label: 'Welcome & Intent',
          content:
            '[Hi|Hello] {{name}}! Thanks for reaching out to us.\n\nTo help us find the best solution for you, which service are you looking for?\n\n1. Marketing & Lead Gen\n2. CRM & Automation\n3. Custom Development',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 300, y: 350 },
        data: {
          label: 'Budget Qualification',
          content:
            'Awesome! What is your estimated monthly budget for this project?\n\n1. Under $1,000\n2. $1,000 - $5,000\n3. $5,000+',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-3',
        type: 'message',
        position: { x: 300, y: 500 },
        data: {
          label: 'Confirmation & Contact',
          content:
            'Thank you for the details, {{name}}! A dedicated specialist is reviewing your requirements and will connect with you shortly.',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [
      { id: 'e-1-2', source: 'flow-1', target: 'msg-1' },
      { id: 'e-2-3', source: 'msg-1', target: 'msg-2' },
      { id: 'e-3-4', source: 'msg-2', target: 'msg-3' },
    ],
  },
  {
    id: 'customer-support-faq',
    name: 'Customer Support & FAQ Bot',
    description: 'Provide 24/7 instant answers to frequent questions and escalate complex requests to a human agent.',
    category: 'support',
    badge: 'Essential',
    icon: 'LifeBuoy',
    trigger: 'help',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 300, y: 50 },
        data: {
          label: 'Help Trigger',
          content: 'Triggered when user types "help"',
          trigger: 'help',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 300, y: 200 },
        data: {
          label: 'Main Support Menu',
          content:
            '[Hello|Hey] {{name}}! Welcome to Support.\n\nPlease reply with the number corresponding to your query:\n\n1. Business Hours & Location\n2. Pricing & Plans\n3. Talk to a Live Agent',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 300, y: 350 },
        data: {
          label: 'FAQ Details & Resolution',
          content:
            '• *Business Hours*: Monday – Saturday, 9:00 AM – 6:00 PM\n• *Email*: support@leadbajaar.com\n\nIf you need immediate assistance, reply *3* to connect with our team.',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-3',
        type: 'message',
        position: { x: 300, y: 500 },
        data: {
          label: 'Human Agent Handoff',
          content:
            'We have notified our support team! An agent has been assigned to this conversation and will message you shortly.',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [
      { id: 'e-sup-1', source: 'flow-1', target: 'msg-1' },
      { id: 'e-sup-2', source: 'msg-1', target: 'msg-2' },
      { id: 'e-sup-3', source: 'msg-2', target: 'msg-3' },
    ],
  },
  {
    id: 'appointment-booking',
    name: 'Appointment & Demo Booking',
    description: 'Share scheduling links, qualify meeting intent, and send automated preparation guidelines.',
    category: 'sales',
    badge: 'Conversion',
    icon: 'CalendarCheck',
    trigger: 'book',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 300, y: 50 },
        data: {
          label: 'Booking Trigger',
          content: 'Triggered when user types "book"',
          trigger: 'book',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 300, y: 200 },
        data: {
          label: 'Meeting Invitation',
          content:
            '[Hi|Hello] {{name}}! We would love to schedule a 1-on-1 strategy session with you.\n\nPlease choose a convenient time slot on our calendar:\n👉 https://app.leadbajaar.com/book/demo',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 300, y: 350 },
        data: {
          label: 'Preparation Note',
          content:
            'Once booked, you will receive an instant confirmation email and Google Meet link. Looking forward to speaking with you!',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [
      { id: 'e-book-1', source: 'flow-1', target: 'msg-1' },
      { id: 'e-book-2', source: 'msg-1', target: 'msg-2' },
    ],
  },
  {
    id: 'away-autoresponder',
    name: 'After-Hours / Away Responder',
    description: 'Automatically greet customers outside business hours, set expectations, and record their messages.',
    category: 'automation',
    badge: 'Always-On',
    icon: 'Moon',
    trigger: '*',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 300, y: 50 },
        data: {
          label: 'Wildcard Inbound Trigger',
          content: 'Triggered on all incoming messages (*)',
          trigger: '*',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 300, y: 200 },
        data: {
          label: 'After-Hours Notice',
          content:
            '[Hello|Hi] {{name}}! Thanks for reaching out. We are currently away from our desks.\n\nOur operating hours are Monday – Saturday, 9:00 AM – 6:00 PM. Please leave your question or requirement below and we will respond first thing in the morning!',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [{ id: 'e-away-1', source: 'flow-1', target: 'msg-1' }],
  },
  {
    id: 'product-pricing-showcase',
    name: 'Product & Pricing Showcase',
    description: 'Showcase key product offerings, package tiers, and give prospects clear next steps.',
    category: 'sales',
    badge: 'Sales',
    icon: 'Package',
    trigger: 'pricing',
    nodes: [
      {
        id: 'flow-1',
        type: 'flow',
        position: { x: 300, y: 50 },
        data: {
          label: 'Pricing Trigger',
          content: 'Triggered when user types "pricing"',
          trigger: 'pricing',
        } as FlowNodeData,
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 300, y: 200 },
        data: {
          label: 'Package Overview',
          content:
            '[Hello|Hey] {{name}}! Here are our primary subscription tiers:\n\n⭐ *Starter Plan*: Essential CRM & Lead Syncing\n🚀 *Pro Plan*: WhatsApp Automation, Chatbots & Multi-Agent\n👑 *Enterprise*: Custom Integrations & Dedicated Support\n\nReply with *1*, *2*, or *3* to learn more about a specific package!',
          messageType: 'text',
        } as MessageNodeData,
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 300, y: 350 },
        data: {
          label: 'Special Offer CTA',
          content:
            'Ready to get started? Visit our plans page to activate your trial or talk with an account manager:\n👉 https://app.leadbajaar.com/plans',
          messageType: 'text',
        } as MessageNodeData,
      },
    ],
    edges: [
      { id: 'e-price-1', source: 'flow-1', target: 'msg-1' },
      { id: 'e-price-2', source: 'msg-1', target: 'msg-2' },
    ],
  },
];

export const getChatbotTemplates = () => CHATBOT_TEMPLATES;

export const getChatbotTemplateById = (id?: string | null): ChatbotTemplate | undefined => {
  if (!id) return undefined;
  return CHATBOT_TEMPLATES.find((t) => t.id === id);
};
