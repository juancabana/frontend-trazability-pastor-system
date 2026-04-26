import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../infra/config-api';
import type { BusinessConfig } from '../domain/business-config';
import {
  COMPLIANCE_THRESHOLD,
  DEFAULT_REPORT_DEADLINE_DAY,
} from '@/constants/shared';
import { setExportComplianceThresholds } from '@/lib/export-utils';

/**
 * Fallback usado mientras la query carga o si el endpoint falla.
 * Estos valores deben mantenerse alineados con `backend/src/config/constants.ts`.
 * La fuente de verdad es el server.
 */
const FALLBACK_CONFIG: BusinessConfig = {
  timezone: 'America/Bogota',
  compliance: {
    // El frontend usa porcentaje (70) historicamente; el server usa decimal (0.7).
    // Aqui normalizamos a decimal para coincidir con la respuesta del server.
    threshold: COMPLIANCE_THRESHOLD / 100,
    amberThreshold: 0.4,
  },
  reportDeadlineDay: {
    default: DEFAULT_REPORT_DEADLINE_DAY,
    min: 1,
    max: 28,
  },
  yearRange: {
    min: 2000,
    max: 2100,
  },
};

const QUERY_KEY = ['config', 'public'] as const;
const ONE_HOUR = 1000 * 60 * 60;

/**
 * Hook para obtener la configuracion publica de reglas de negocio.
 * Cachea por 1 hora; mientras carga devuelve fallback con valores seguros.
 *
 * Uso recomendado:
 *   const { thresholdPct, amberThresholdPct } = useComplianceThresholds();
 */
export function useBusinessConfig() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: configApi.getPublic,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
    retry: 2,
  });

  const config = query.data ?? FALLBACK_CONFIG;

  // Sincroniza los umbrales usados por las funciones de exportacion (no React)
  // con los valores del server. Solo se ejecuta cuando los umbrales cambian.
  useEffect(() => {
    setExportComplianceThresholds({
      green: Math.round(config.compliance.threshold * 100),
      amber: Math.round(config.compliance.amberThreshold * 100),
    });
  }, [config.compliance.threshold, config.compliance.amberThreshold]);

  return {
    config,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Atajo para los umbrales de cumplimiento expresados como porcentaje 0-100,
 * que es como los usan la mayoria de pages.
 */
export function useComplianceThresholds() {
  const { config } = useBusinessConfig();
  return {
    /** Umbral verde como porcentaje (e.g. 70) */
    thresholdPct: Math.round(config.compliance.threshold * 100),
    /** Umbral ambar como porcentaje (e.g. 40) */
    amberThresholdPct: Math.round(config.compliance.amberThreshold * 100),
    /** Umbrales en formato decimal 0-1 */
    threshold: config.compliance.threshold,
    amberThreshold: config.compliance.amberThreshold,
  };
}
