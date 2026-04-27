import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sistema de Trazabilidad Pastoral — IASD';
const DEFAULT_DESCRIPTION =
  'Plataforma para el registro y seguimiento de actividades diarias de pastores distritales en la Iglesia Adventista del Séptimo Día.';
const BASE_URL = import.meta.env.VITE_SITE_URL ?? 'https://trazabilidad-pastoral.vercel.app';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  /** Evita que la página sea indexada por buscadores (true para rutas protegidas) */
  noIndex?: boolean;
  /** Datos estructurados JSON-LD adicionales */
  jsonLd?: Record<string, unknown>;
}

/**
 * Componente SEO reutilizable.
 * Usa react-helmet-async para gestionar el <head> por ruta.
 *
 * @example
 * <SEO
 *   title="Iniciar Sesión"
 *   description="Accede al sistema de trazabilidad pastoral."
 *   canonicalPath="/login"
 * />
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = canonicalPath ? `${BASE_URL}${canonicalPath}` : undefined;

  return (
    <Helmet>
      {/* Básico */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Sistema de Trazabilidad Pastoral IASD" />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* JSON-LD adicional por página */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
