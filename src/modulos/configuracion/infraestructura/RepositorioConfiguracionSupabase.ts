import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { ConfiguracionSitio } from '../dominio/ConfiguracionSitio';
import { RepositorioConfiguracion } from '../dominio/RepositorioConfiguracion';

function mapearADominio(row: any): ConfiguracionSitio {
  return {
    id: row.id,
    nombreSitio: row.nombre_sitio || 'Hoteles Adventur',
    eslogan: row.eslogan || '',
    logoUrl: row.logo_url || '',
    emailContacto: row.email_contacto || '',
    telefonoContacto: row.telefono_contacto || '',
    redesSociales: {
      facebook: row.facebook_url,
      instagram: row.instagram_url,
      twitter: row.twitter_url,
      whatsapp: row.whatsapp,
    },
    terminosCondiciones: row.terminos_condiciones || '',
    politicaPrivacidad: row.politica_privacidad || '',
  };
}

export class RepositorioConfiguracionSupabase implements RepositorioConfiguracion {
  async obtenerConfiguracion(): Promise<ConfiguracionSitio | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('configuracion')
      .select('*')
      .single();
    
    if (error) return null;
    return mapearADominio(data);
  }

  async actualizarConfiguracion(datos: Partial<ConfiguracionSitio>): Promise<ConfiguracionSitio> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('configuracion')
      .update({
        ...(datos.nombreSitio && { nombre_sitio: datos.nombreSitio }),
        ...(datos.eslogan !== undefined && { eslogan: datos.eslogan }),
        ...(datos.logoUrl !== undefined && { logo_url: datos.logoUrl }),
        ...(datos.emailContacto && { email_contacto: datos.emailContacto }),
        ...(datos.telefonoContacto && { telefono_contacto: datos.telefonoContacto }),
        ...(datos.redesSociales?.facebook && { facebook_url: datos.redesSociales.facebook }),
        ...(datos.redesSociales?.instagram && { instagram_url: datos.redesSociales.instagram }),
        ...(datos.redesSociales?.twitter && { twitter_url: datos.redesSociales.twitter }),
        ...(datos.redesSociales?.whatsapp && { whatsapp: datos.redesSociales.whatsapp }),
        ...(datos.terminosCondiciones !== undefined && { terminos_condiciones: datos.terminosCondiciones }),
        ...(datos.politicaPrivacidad !== undefined && { politica_privacidad: datos.politicaPrivacidad }),
      })
      .eq('id', datos.id!)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }
}
