import { logger } from '../utils/logger.js';

/**
 * Schema.org structured data generation
 */

export type SchemaType =
  | 'WebSite'
  | 'Organization'
  | 'Product'
  | 'Article'
  | 'BlogPosting'
  | 'LocalBusiness'
  | 'Person'
  | 'BreadcrumbList';

export interface SchemaConfig {
  type: SchemaType;
  name: string;
  url: string;
  description?: string;
  logo?: string;
  image?: string;
  sameAs?: string[]; // Social media profiles
  contactPoint?: ContactPoint;
  author?: Person;
  datePublished?: string;
  dateModified?: string;
}

export interface ContactPoint {
  contactType: string;
  telephone?: string;
  email?: string;
  areaServed?: string;
  availableLanguage?: string[];
}

export interface Person {
  name: string;
  url?: string;
  image?: string;
  sameAs?: string[];
}

/**
 * Generate Schema.org JSON-LD
 */
export function generateSchema(config: SchemaConfig): object {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': config.type
  };

  switch (config.type) {
    case 'WebSite':
      return generateWebSiteSchema(config);
    case 'Organization':
      return generateOrganizationSchema(config);
    case 'Product':
      return generateProductSchema(config);
    case 'Article':
    case 'BlogPosting':
      return generateArticleSchema(config);
    case 'LocalBusiness':
      return generateLocalBusinessSchema(config);
    case 'Person':
      return generatePersonSchema(config);
    default:
      return baseSchema;
  }
}

/**
 * Generate WebSite schema
 */
function generateWebSiteSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    description: config.description,
    ...(config.url && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${config.url}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  };
}

/**
 * Generate Organization schema
 */
function generateOrganizationSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    logo: config.logo,
    description: config.description,
    sameAs: config.sameAs || [],
    ...(config.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: config.contactPoint.contactType,
        telephone: config.contactPoint.telephone,
        email: config.contactPoint.email,
        areaServed: config.contactPoint.areaServed,
        availableLanguage: config.contactPoint.availableLanguage
      }
    })
  };
}

/**
 * Generate Product schema
 */
function generateProductSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.name,
    description: config.description,
    image: config.image,
    url: config.url
    // Add more product-specific fields as needed
  };
}

/**
 * Generate Article/BlogPosting schema
 */
function generateArticleSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': config.type,
    headline: config.name,
    description: config.description,
    image: config.image,
    url: config.url,
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    ...(config.author && {
      author: {
        '@type': 'Person',
        name: config.author.name,
        url: config.author.url,
        image: config.author.image
      }
    })
  };
}

/**
 * Generate LocalBusiness schema
 */
function generateLocalBusinessSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    url: config.url,
    logo: config.logo,
    image: config.image,
    description: config.description,
    ...(config.contactPoint && {
      telephone: config.contactPoint.telephone,
      email: config.contactPoint.email
    })
  };
}

/**
 * Generate Person schema
 */
function generatePersonSchema(config: SchemaConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.name,
    url: config.url,
    image: config.image,
    description: config.description,
    sameAs: config.sameAs || []
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Convert schema to JSON-LD script tag
 */
export function schemaToScriptTag(schema: object): string {
  const json = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">
${json}
</script>`;
}

/**
 * Generate multiple schemas combined
 */
export function generateCombinedSchema(configs: SchemaConfig[]): object {
  if (configs.length === 1) {
    return generateSchema(configs[0]);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': configs.map(config => generateSchema(config))
  };
}

/**
 * Validate schema
 */
export function validateSchema(schema: object): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const schemaObj = schema as any;

  // Check required fields
  if (!schemaObj['@context']) {
    errors.push('Missing @context field');
  }

  if (!schemaObj['@type']) {
    errors.push('Missing @type field');
  }

  // Type-specific validation
  if (schemaObj['@type'] === 'WebSite') {
    if (!schemaObj.name) {
      errors.push('WebSite schema requires name');
    }
    if (!schemaObj.url) {
      errors.push('WebSite schema requires url');
    }
  }

  if (schemaObj['@type'] === 'Organization') {
    if (!schemaObj.name) {
      errors.push('Organization schema requires name');
    }
    if (!schemaObj.logo) {
      warnings.push('Organization schema should include logo');
    }
  }

  if (schemaObj['@type'] === 'Article' || schemaObj['@type'] === 'BlogPosting') {
    if (!schemaObj.headline) {
      errors.push('Article schema requires headline');
    }
    if (!schemaObj.author) {
      warnings.push('Article schema should include author');
    }
    if (!schemaObj.datePublished) {
      warnings.push('Article schema should include datePublished');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Common schema templates for different site types
 */
export const SchemaTemplates = {
  /**
   * Standard web application
   */
  webApp: (name: string, url: string, description: string) =>
    generateSchema({
      type: 'WebSite',
      name,
      url,
      description
    }),

  /**
   * Company/Organization site
   */
  company: (
    name: string,
    url: string,
    description: string,
    logo?: string,
    socialProfiles?: string[]
  ) =>
    generateSchema({
      type: 'Organization',
      name,
      url,
      description,
      logo,
      sameAs: socialProfiles
    }),

  /**
   * Blog site
   */
  blog: (name: string, url: string, description: string) =>
    generateCombinedSchema([
      {
        type: 'WebSite',
        name,
        url,
        description
      },
      {
        type: 'Organization',
        name,
        url,
        description
      }
    ]),

  /**
   * Personal site/portfolio
   */
  personal: (
    name: string,
    url: string,
    description: string,
    image?: string,
    socialProfiles?: string[]
  ) =>
    generateSchema({
      type: 'Person',
      name,
      url,
      description,
      image,
      sameAs: socialProfiles
    })
};

/**
 * Generate Next.js metadata with schema
 */
export function generateNextJSSchemaMetadata(schema: object): string {
  const json = JSON.stringify(schema, null, 2);

  return `// Add this to your layout or page metadata
export const metadata = {
  // ... other metadata
  other: {
    'application/ld+json': ${json.split('\n').map((line, i) => i === 0 ? line : `    ${line}`).join('\n')}
  }
};`;
}

export default {
  generateSchema,
  generateBreadcrumbSchema,
  generateCombinedSchema,
  schemaToScriptTag,
  validateSchema,
  generateNextJSSchemaMetadata,
  SchemaTemplates
};
