import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Función para exportar reporte de ingresos a PDF
export const exportIngresosPDF = async () => {
    const doc = new jsPDF()
    
    // Configuración de colores
    const primaryColor: [number, number, number] = [37, 99, 235] // Azul
    const secondaryColor: [number, number, number] = [243, 244, 246] // Gris claro
    
    // Encabezado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Hotel Adventur', 105, 15, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de Ingresos', 105, 25, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 33, { align: 'center' })
    
    // Resumen ejecutivo
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen Ejecutivo', 14, 50)
    
    // Tabla de resumen
    autoTable(doc, {
        startY: 55,
        head: [['Concepto', 'Valor']],
        body: [
            ['Ingresos Totales', 'S/. 125,450'],
            ['Ingresos Enero', 'S/. 95,000'],
            ['Ingresos Febrero', 'S/. 125,450'],
            ['Promedio por Reserva', 'S/. 1,410'],
            ['Total de Reservas', '89'],
        ],
        headStyles: {
            fillColor: primaryColor,
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 10
        },
        alternateRowStyles: {
            fillColor: secondaryColor
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right', cellWidth: 80 }
        }
    })
    
    // Ingresos mensuales
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ingresos Mensuales Detallados', 14, (doc as any).lastAutoTable.finalY + 15)
    
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Mes', 'Ingresos', 'Variación', 'Porcentaje']],
        body: [
            ['Enero 2024', 'S/. 95,000', '-', '43.1%'],
            ['Febrero 2024', 'S/. 125,450', '+S/. 30,450', '56.9%'],
            ['Total', 'S/. 220,450', '-', '100%'],
        ],
        headStyles: {
            fillColor: primaryColor,
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 10
        },
        alternateRowStyles: {
            fillColor: secondaryColor
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { halign: 'right', cellWidth: 50 },
            2: { halign: 'right', cellWidth: 50 },
            3: { halign: 'center', cellWidth: 40 }
        },
        footStyles: {
            fillColor: [220, 252, 231] as [number, number, number],
            textColor: [22, 163, 74] as [number, number, number],
            fontStyle: 'bold'
        }
    })
    
    // Pie de página
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            290,
            { align: 'center' }
        )
        doc.text(
            'Hotel Adventur - Reporte Confidencial',
            14,
            290
        )
    }
    
    // Guardar PDF
    doc.save(`Reporte_Ingresos_${new Date().toISOString().split('T')[0]}.pdf`)
}

// Función para exportar reporte de reservas a Excel
export const exportReservasExcel = async () => {
    // Datos de ejemplo (en producción vendrían de Supabase)
    const reservasData = [
        {
            'Código': 'RES-001',
            'Cliente': 'Juan Pérez',
            'Email': 'juan@example.com',
            'Habitación': 'Suite Premium 301',
            'Check-in': '2024-02-01',
            'Check-out': '2024-02-05',
            'Noches': 4,
            'Huéspedes': 2,
            'Total': 2080,
            'Adelanto': 1040,
            'Estado': 'Confirmada',
            'Fecha Reserva': '2024-01-15'
        },
        {
            'Código': 'RES-002',
            'Cliente': 'María García',
            'Email': 'maria@example.com',
            'Habitación': 'Suite Deluxe 101',
            'Check-in': '2024-02-10',
            'Check-out': '2024-02-13',
            'Noches': 3,
            'Huéspedes': 2,
            'Total': 1050,
            'Adelanto': 525,
            'Estado': 'Confirmada',
            'Fecha Reserva': '2024-01-20'
        },
        {
            'Código': 'RES-003',
            'Cliente': 'Carlos López',
            'Email': 'carlos@example.com',
            'Habitación': 'Habitación Superior 202',
            'Check-in': '2024-02-15',
            'Check-out': '2024-02-18',
            'Noches': 3,
            'Huéspedes': 1,
            'Total': 750,
            'Adelanto': 375,
            'Estado': 'Pendiente',
            'Fecha Reserva': '2024-02-01'
        }
    ]
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Hoja 1: Reservas detalladas
    const ws1 = XLSX.utils.json_to_sheet(reservasData)
    
    // Ajustar ancho de columnas
    const colWidths = [
        { wch: 12 }, // Código
        { wch: 20 }, // Cliente
        { wch: 25 }, // Email
        { wch: 25 }, // Habitación
        { wch: 12 }, // Check-in
        { wch: 12 }, // Check-out
        { wch: 8 },  // Noches
        { wch: 10 }, // Huéspedes
        { wch: 12 }, // Total
        { wch: 12 }, // Adelanto
        { wch: 12 }, // Estado
        { wch: 15 }  // Fecha Reserva
    ]
    ws1['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Reservas')
    
    // Hoja 2: Resumen por estado
    const resumenEstado = [
        { 'Estado': 'Confirmadas', 'Cantidad': 45, 'Porcentaje': '51%', 'Ingresos': 'S/. 63,450' },
        { 'Estado': 'Pendientes', 'Cantidad': 20, 'Porcentaje': '22%', 'Ingresos': 'S/. 28,200' },
        { 'Estado': 'Completadas', 'Cantidad': 18, 'Porcentaje': '20%', 'Ingresos': 'S/. 25,380' },
        { 'Estado': 'Canceladas', 'Cantidad': 6, 'Porcentaje': '7%', 'Ingresos': 'S/. 8,420' }
    ]
    const ws2 = XLSX.utils.json_to_sheet(resumenEstado)
    ws2['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Estado')
    
    // Hoja 3: Estadísticas
    const estadisticas = [
        { 'Métrica': 'Total de Reservas', 'Valor': '89' },
        { 'Métrica': 'Ingresos Totales', 'Valor': 'S/. 125,450' },
        { 'Métrica': 'Promedio por Reserva', 'Valor': 'S/. 1,410' },
        { 'Métrica': 'Duración Promedio', 'Valor': '3.2 días' },
        { 'Métrica': 'Tasa de Ocupación', 'Valor': '78%' },
        { 'Métrica': 'Tasa de Cancelación', 'Valor': '7%' }
    ]
    const ws3 = XLSX.utils.json_to_sheet(estadisticas)
    ws3['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Estadísticas')
    
    // Guardar archivo
    XLSX.writeFile(wb, `Reporte_Reservas_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Función para exportar reporte de usuarios a CSV
export const exportUsuariosCSV = async () => {
    // Datos de ejemplo (en producción vendrían de Supabase)
    const usuariosData = [
        {
            'ID': 'USR-001',
            'Nombre': 'Juan',
            'Apellido': 'Pérez',
            'Email': 'juan@example.com',
            'Teléfono': '+51 987654321',
            'Tipo Documento': 'DNI',
            'Número Documento': '12345678',
            'País': 'Perú',
            'Rol': 'Cliente',
            'Estado': 'Verificado',
            'Fecha Registro': '2024-01-15',
            'Total Reservas': 5,
            'Total Gastado': 'S/. 7,050'
        },
        {
            'ID': 'USR-002',
            'Nombre': 'María',
            'Apellido': 'García',
            'Email': 'maria@example.com',
            'Teléfono': '+51 987654322',
            'Tipo Documento': 'DNI',
            'Número Documento': '87654321',
            'País': 'Perú',
            'Rol': 'Cliente',
            'Estado': 'Verificado',
            'Fecha Registro': '2024-01-20',
            'Total Reservas': 3,
            'Total Gastado': 'S/. 4,230'
        },
        {
            'ID': 'USR-003',
            'Nombre': 'Carlos',
            'Apellido': 'López',
            'Email': 'carlos@example.com',
            'Teléfono': '+51 987654323',
            'Tipo Documento': 'Pasaporte',
            'Número Documento': 'P123456',
            'País': 'Colombia',
            'Rol': 'Cliente',
            'Estado': 'Pendiente',
            'Fecha Registro': '2024-02-01',
            'Total Reservas': 1,
            'Total Gastado': 'S/. 750'
        }
    ]
    
    // Crear CSV con formato elegante
    const headers = Object.keys(usuariosData[0])
    const csvContent = [
        // Encabezado del reporte
        ['HOTEL ADVENTUR'],
        ['Reporte de Usuarios'],
        [`Fecha de Generación: ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`],
        [''],
        ['DATOS DE USUARIOS'],
        headers,
        ...usuariosData.map(row => headers.map(header => row[header as keyof typeof row])),
        [''],
        ['RESUMEN'],
        ['Total de Usuarios', usuariosData.length],
        ['Usuarios Verificados', usuariosData.filter(u => u.Estado === 'Verificado').length],
        ['Usuarios Pendientes', usuariosData.filter(u => u.Estado === 'Pendiente').length],
        ['Total de Reservas', usuariosData.reduce((sum, u) => sum + u['Total Reservas'], 0)]
    ].map(row => row.join(',')).join('\n')
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
