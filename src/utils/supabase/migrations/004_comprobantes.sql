-- Tabla para almacenar comprobantes electrónicos (facturas, boletas, notas)
CREATE TABLE IF NOT EXISTS comprobantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('factura', 'boleta', 'nota_credito', 'nota_debito')),
    serie VARCHAR(10) NOT NULL,
    numero INTEGER NOT NULL,
    reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Datos del cliente
    cliente_tipo_documento VARCHAR(1) NOT NULL,
    cliente_numero_documento VARCHAR(20) NOT NULL,
    cliente_denominacion VARCHAR(255) NOT NULL,
    cliente_direccion TEXT,
    cliente_email VARCHAR(255),
    
    -- Montos
    subtotal DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Datos de SUNAT
    aceptada_sunat BOOLEAN DEFAULT false,
    enlace_pdf TEXT,
    enlace_xml TEXT,
    enlace_cdr TEXT,
    hash_cpe VARCHAR(255),
    sunat_transaction_id VARCHAR(255),
    sunat_description TEXT,
    sunat_note TEXT,
    sunat_responsecode VARCHAR(10),
    
    -- Documento que se modifica (para notas de crédito/débito)
    documento_modificado_tipo VARCHAR(2),
    documento_modificado_serie VARCHAR(10),
    documento_modificado_numero INTEGER,
    motivo_nota TEXT,
    
    -- Metadatos
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anulado BOOLEAN DEFAULT false,
    fecha_anulacion TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tipo, serie, numero)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_comprobantes_reserva ON comprobantes(reserva_id);
CREATE INDEX idx_comprobantes_usuario ON comprobantes(usuario_id);
CREATE INDEX idx_comprobantes_tipo ON comprobantes(tipo);
CREATE INDEX idx_comprobantes_fecha ON comprobantes(fecha_emision);
CREATE INDEX idx_comprobantes_cliente ON comprobantes(cliente_numero_documento);

-- Comentarios
COMMENT ON TABLE comprobantes IS 'Almacena todos los comprobantes electrónicos generados (facturas, boletas, notas)';
COMMENT ON COLUMN comprobantes.tipo IS 'Tipo de comprobante: factura, boleta, nota_credito, nota_debito';
COMMENT ON COLUMN comprobantes.serie IS 'Serie del comprobante (F001, B001, NC01, etc)';
COMMENT ON COLUMN comprobantes.numero IS 'Número correlativo del comprobante';
COMMENT ON COLUMN comprobantes.aceptada_sunat IS 'Indica si el comprobante fue aceptado por SUNAT';
COMMENT ON COLUMN comprobantes.hash_cpe IS 'Hash del comprobante electrónico';
