/**
 * JsonLd Component Tests
 * Tests for the JSON-LD structured data SEO component
 */

import { render } from '../utils/test-utils';
import JsonLd, {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  ServiceJsonLd,
  FAQJsonLd,
  WebSiteJsonLd,
} from '@/components/JsonLd';

describe('JsonLd Components', () => {
  const getJsonLdContent = (container: HTMLElement): object | null => {
    const script = container.querySelector('script[type="application/ld+json"]');
    if (!script?.textContent) return null;
    return JSON.parse(script.textContent);
  };

  const getAllJsonLdContent = (container: HTMLElement): object[] => {
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(scripts)
      .map((script) => {
        if (!script.textContent) return null;
        return JSON.parse(script.textContent);
      })
      .filter(Boolean) as object[];
  };

  describe('OrganizationJsonLd', () => {
    it('should render organization structured data', () => {
      const { container } = render(<OrganizationJsonLd />);
      const data = getJsonLdContent(container);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'Organization');
    });

    it('should include organization name', () => {
      const { container } = render(<OrganizationJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.name).toBe('AutoMagicly');
    });

    it('should include organization URL', () => {
      const { container } = render(<OrganizationJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.url).toBeDefined();
      expect(typeof data.url).toBe('string');
    });

    it('should include contact point', () => {
      const { container } = render(<OrganizationJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.contactPoint).toBeDefined();
      expect((data.contactPoint as Record<string, unknown>)['@type']).toBe('ContactPoint');
    });
  });

  describe('LocalBusinessJsonLd', () => {
    it('should render local business structured data', () => {
      const { container } = render(<LocalBusinessJsonLd />);
      const data = getJsonLdContent(container);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'ProfessionalService');
    });

    it('should include service types', () => {
      const { container } = render(<LocalBusinessJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.serviceType).toBeDefined();
      expect(Array.isArray(data.serviceType)).toBe(true);
      expect(data.serviceType).toContain('AI Automation');
    });

    it('should include price range', () => {
      const { container } = render(<LocalBusinessJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.priceRange).toBeDefined();
    });
  });

  describe('ServiceJsonLd', () => {
    it('should render service structured data', () => {
      const { container } = render(<ServiceJsonLd />);
      const data = getJsonLdContent(container);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'Service');
    });

    it('should include provider information', () => {
      const { container } = render(<ServiceJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.provider).toBeDefined();
      expect((data.provider as Record<string, unknown>)['@type']).toBe('Organization');
      expect((data.provider as Record<string, unknown>).name).toBe('AutoMagicly');
    });

    it('should include service offers', () => {
      const { container } = render(<ServiceJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.offers).toBeDefined();
      expect(Array.isArray(data.offers)).toBe(true);
      expect((data.offers as unknown[]).length).toBeGreaterThan(0);
    });

    it('should include AI Partnership offer', () => {
      const { container } = render(<ServiceJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;
      const offers = data.offers as Record<string, unknown>[];

      const partnership = offers.find((o) => o.name === 'AI Partnership (Full Service)');
      expect(partnership).toBeDefined();
    });

    it('should include Simple Workflow offer', () => {
      const { container } = render(<ServiceJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;
      const offers = data.offers as Record<string, unknown>[];

      const workflow = offers.find((o) => o.name === 'Simple Workflow Automation');
      expect(workflow).toBeDefined();
    });
  });

  describe('FAQJsonLd', () => {
    it('should render FAQ structured data', () => {
      const { container } = render(<FAQJsonLd />);
      const data = getJsonLdContent(container);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'FAQPage');
    });

    it('should include FAQ entries', () => {
      const { container } = render(<FAQJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.mainEntity).toBeDefined();
      expect(Array.isArray(data.mainEntity)).toBe(true);
      expect((data.mainEntity as unknown[]).length).toBeGreaterThan(0);
    });

    it('should have proper question structure', () => {
      const { container } = render(<FAQJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;
      const questions = data.mainEntity as Record<string, unknown>[];

      questions.forEach((q) => {
        expect(q['@type']).toBe('Question');
        expect(q.name).toBeDefined();
        expect(q.acceptedAnswer).toBeDefined();
        expect((q.acceptedAnswer as Record<string, unknown>)['@type']).toBe('Answer');
        expect((q.acceptedAnswer as Record<string, unknown>).text).toBeDefined();
      });
    });
  });

  describe('WebSiteJsonLd', () => {
    it('should render website structured data', () => {
      const { container } = render(<WebSiteJsonLd />);
      const data = getJsonLdContent(container);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'WebSite');
    });

    it('should include website name', () => {
      const { container } = render(<WebSiteJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.name).toBe('AutoMagicly');
    });

    it('should include website URL', () => {
      const { container } = render(<WebSiteJsonLd />);
      const data = getJsonLdContent(container) as Record<string, unknown>;

      expect(data.url).toBeDefined();
    });
  });

  describe('Combined JsonLd', () => {
    it('should render all JSON-LD schemas', () => {
      const { container } = render(<JsonLd />);
      const allData = getAllJsonLdContent(container);

      expect(allData.length).toBe(5);
    });

    it('should include all schema types', () => {
      const { container } = render(<JsonLd />);
      const allData = getAllJsonLdContent(container) as Record<string, unknown>[];
      const types = allData.map((d) => d['@type']);

      expect(types).toContain('Organization');
      expect(types).toContain('ProfessionalService');
      expect(types).toContain('Service');
      expect(types).toContain('FAQPage');
      expect(types).toContain('WebSite');
    });

    it('should render valid JSON in all scripts', () => {
      const { container } = render(<JsonLd />);
      const scripts = container.querySelectorAll('script[type="application/ld+json"]');

      scripts.forEach((script) => {
        expect(() => {
          if (script.textContent) {
            JSON.parse(script.textContent);
          }
        }).not.toThrow();
      });
    });
  });

  describe('Schema.org Compliance', () => {
    it('should use https://schema.org as context', () => {
      const { container } = render(<JsonLd />);
      const allData = getAllJsonLdContent(container) as Record<string, unknown>[];

      allData.forEach((data) => {
        expect(data['@context']).toBe('https://schema.org');
      });
    });

    it('should have @type for all schemas', () => {
      const { container } = render(<JsonLd />);
      const allData = getAllJsonLdContent(container) as Record<string, unknown>[];

      allData.forEach((data) => {
        expect(data['@type']).toBeDefined();
        expect(typeof data['@type']).toBe('string');
      });
    });
  });
});
