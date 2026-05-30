import { Helmet } from "react-helmet-async";

/**
 * @component SEO
 * @description مكون لتحسين محركات البحث (SEO).
 * يسمح بتغيير العنوان، الوصف، والكلمات المفتاحية لكل صفحة ديناميكياً.
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  schemaType = "WebPage",
  schemaData 
}) => {
  const siteName = "Crew";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Connect with your world`;
  const defaultDescription = "Crew is a luxury social media platform for elite communication, featuring HD video calls, group chats, and real-time interactions.";
  const defaultKeywords = "social media, crew, platform, networking, communication, video calls, luxury ui, تواصل اجتماعي, منصه, كرو, سوشيال ميديا";
  const siteUrl = "https://crew-socialmedia.up.railway.app";
  
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": fullTitle,
    "url": url || siteUrl,
    "description": description || defaultDescription,
    "image": image
  };

  const finalSchema = { ...defaultSchema, ...schemaData };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Crew Team" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || "/vite.svg"} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || "/vite.svg"} />

      {/* Canonical Link */}
      <link rel="canonical" href={url || siteUrl} />
      
      {/* Structured Data / JSON-LD for Google Rich Results */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
