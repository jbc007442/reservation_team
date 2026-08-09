import WelcomeTemplate from './WelcomeTemplate';
import MarketingTemplate from './MarketingTemplate';
import NotificationTemplate from './NotificationTemplate';

export { WelcomeTemplate, MarketingTemplate, NotificationTemplate };

export const emailTemplates = {
  welcome: WelcomeTemplate,
  marketing: MarketingTemplate,
  notification: NotificationTemplate,
} as const;

export type EmailTemplateType = keyof typeof emailTemplates;
