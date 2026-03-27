import { organizationJsonLd } from '@/lib/schema';

export default function Head() {
  return (
    <>
      <script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
