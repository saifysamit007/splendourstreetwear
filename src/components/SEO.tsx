import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: any;
}

export default function SEO({ 
  title = "SPLENDOUR | Premium Streetwear Architecture", 
  description = "Defined by culture, crafted for luxury. SPLENDOUR offers high-end streetwear rooted in the urban energy of Dhaka. Explore our latest drops, collections, and visual narratives.",
  keywords = "streetwear, luxury fashion, Dhaka streetwear, premium hoodies, oversized tees, Splendour streetwear, high-end urban apparel",
  image = "/og-image.jpg", // Replace with actual OG image URL
  url = "https://splendour.cc",
  type = "website",
  schema
}: SEOProps) {
  const fullTitle = title.includes("SPLENDOUR") ? title : `${title} | SPLENDOUR`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="SPLENDOUR STREETWEAR" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="SPLENDOUR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={url} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Default Organization Schema */}
      {!schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SPLENDOUR",
            "url": "https://splendour.cc",
            "logo": "https://splendour.cc/logo.png",
            "sameAs": [
              "https://instagram.com/splendour.cc",
              "https://facebook.com/splendour.cc"
            ],
            "description": "Premium streetwear for the modern icon."
          })}
        </script>
      )}
    </Helmet>
  );
}
