/** Yapılandırılmış veri (schema.org) için JSON-LD etiketi. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // "<" kaçışı, metin içinden <script> kapatılmasını (XSS) engeller.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
