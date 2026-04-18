export interface ConfiguracionSitio {
  id: string;
  nombreSitio: string;
  eslogan: string;
  logoUrl: string;
  emailContacto: string;
  telefonoContacto: string;
  redesSociales: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  terminosCondiciones: string;
  politicaPrivacidad: string;
}

export interface RepositorioConfiguracion {
  obtenerConfiguracion(): Promise<ConfiguracionSitio | null>;
  actualizarConfiguracion(datos: Partial<ConfiguracionSitio>): Promise<ConfiguracionSitio>;
}
