import type { Reserva, Usuario } from '@/types/basedatos'

export interface ReservaConRelaciones extends Reserva {
    usuarios?: { nombre: string; apellido: string; email: string } | null
    alojamientos?: { nombre: string; tipo: string } | null
    pagos?: { monto: number; estado: string; metodo: string }[]
}

export interface DatosReporte {
    reservas: ReservaConRelaciones[]
    usuarios: Usuario[]
    ingresosMensuales: { mes: string; ingresos: number }[]
    totalIngresos: number
    tasaOcupacion: number
}

async function loadImageAsBase64(path: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve('')
        img.src = path
    })
}

function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-PE', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    })
}

function formatMonto(n: number) {
    return `S/. ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function calcNochesDiff(inicio: string, fin: string) {
    const ms = new Date(fin).getTime() - new Date(inicio).getTime()
    return Math.round(ms / 86_400_000)
}

function drawHeader(
    doc: import('jspdf').jsPDF,
    logoBase64: string,
    titulo: string
) {
    const W = doc.internal.pageSize.getWidth()
    const GOLD: [number, number, number] = [234, 179, 8]
    const DARK: [number, number, number] = [15, 15, 15]

    // Fondo negro
    doc.setFillColor(DARK[0], DARK[1], DARK[2])
    doc.rect(0, 0, W, 50, 'F')

    // Franja dorada
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2])
    doc.rect(0, 48, W, 3, 'F')

    // Logo
    if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', 10, 7, 34, 34) } catch { /* sin logo */ }
    }

    // Nombre empresa
    const textX = logoBase64 ? 50 : 14
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('HOTEL ADVENTUR', textX, 22)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(200, 200, 200)
    doc.text('Atrévete y descubre', textX, 30)

    // Título del reporte (derecha)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2])
    doc.text(titulo.toUpperCase(), W - 12, 22, { align: 'right' })

    const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 180, 180)
    doc.text(fecha, W - 12, 31, { align: 'right' })
}

function drawFooter(doc: import('jspdf').jsPDF) {
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const total = doc.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
        doc.setPage(i)
        doc.setDrawColor(234, 179, 8)
        doc.setLineWidth(0.4)
        doc.line(14, H - 14, W - 14, H - 14)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(140, 140, 140)
        doc.text('© Hotel Adventur — Documento Confidencial', 14, H - 8)
        doc.text(`Página ${i} de ${total}`, W - 14, H - 8, { align: 'right' })
    }
}

function drawKpi(
    doc: import('jspdf').jsPDF,
    x: number, y: number, w: number, h: number,
    label: string, value: string, accent = false
) {
    if (accent) {
        doc.setFillColor(234, 179, 8)
    } else {
        doc.setFillColor(248, 248, 248)
    }
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, w, h, 3, 3, accent ? 'F' : 'FD')

    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text(value, x + w / 2, y + h / 2 - 1, { align: 'center' })

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(label, x + w / 2, y + h / 2 + 6.5, { align: 'center' })
}

function sectionTitle(doc: import('jspdf').jsPDF, text: string, y: number) {
    const DARK: [number, number, number] = [15, 15, 15]
    const GOLD: [number, number, number] = [234, 179, 8]
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK[0], DARK[1], DARK[2])
    doc.text(text, 14, y)
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2])
    doc.setLineWidth(0.8)
    doc.line(14, y + 2, 14 + text.length * 2.1, y + 2)
}

export const exportIngresosPDF = async (datos: DatosReporte) => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ])

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const GOLD: [number, number, number] = [234, 179, 8]
    const DARK: [number, number, number] = [15, 15, 15]
    const GRAY: [number, number, number] = [248, 248, 248]

    const logoBase64 = await loadImageAsBase64('/logoadventure.png')
    drawHeader(doc, logoBase64, 'Reporte de Ingresos')

    let y = 62
    sectionTitle(doc, 'RESUMEN EJECUTIVO', y)

    const totalReservas = datos.reservas.length
    const promedio = totalReservas > 0 ? Math.round(datos.totalIngresos / totalReservas) : 0
    const canceladas = datos.reservas.filter(r => r.estado === 'cancelada').length
    const tasaCancelacion = totalReservas > 0 ? Math.round((canceladas / totalReservas) * 100) : 0

    y += 8
    const kpis = [
        { label: 'Ingresos Totales', value: formatMonto(datos.totalIngresos), accent: true },
        { label: 'Total Reservas', value: String(totalReservas), accent: false },
        { label: 'Promedio/Reserva', value: formatMonto(promedio), accent: false },
        { label: 'Tasa Cancelación', value: `${tasaCancelacion}%`, accent: false },
    ]
    const kw = (W - 28 - 9) / 4
    kpis.forEach((k, i) => drawKpi(doc, 14 + i * (kw + 3), y, kw, 22, k.label, k.value, k.accent))

    y += 30
    sectionTitle(doc, 'INGRESOS MENSUALES', y)

    const mesesConDatos = datos.ingresosMensuales.filter(m => m.ingresos > 0)
    const totalMeses = mesesConDatos.reduce((s, m) => s + m.ingresos, 0)
    let ingresoPrevio = 0

    const bodyMeses = datos.ingresosMensuales.map((m) => {
        const variacion = ingresoPrevio === 0
            ? '—'
            : m.ingresos >= ingresoPrevio
                ? `+${formatMonto(m.ingresos - ingresoPrevio)}`
                : `-${formatMonto(ingresoPrevio - m.ingresos)}`
        const pct = totalMeses > 0 ? `${((m.ingresos / totalMeses) * 100).toFixed(1)}%` : '0%'
        ingresoPrevio = m.ingresos
        return [m.mes, formatMonto(m.ingresos), variacion, pct]
    })
    bodyMeses.push(['TOTAL', formatMonto(totalMeses), '—', '100%'])

    autoTable(doc, {
        startY: y + 6,
        head: [['Mes', 'Ingresos (S/.)', 'Variación', '% del Total']],
        body: bodyMeses,
        headStyles: { fillColor: DARK, textColor: GOLD, fontSize: 9, fontStyle: 'bold', halign: 'center', cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 3.5 },
        alternateRowStyles: { fillColor: GRAY },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 55 },
            1: { halign: 'right', cellWidth: 48 },
            2: { halign: 'right', cellWidth: 48 },
            3: { halign: 'center', cellWidth: 30 },
        },
        didParseCell(data) {
            const isLastRow = data.row.index === bodyMeses.length - 1
            if (isLastRow && data.section === 'body') {
                data.cell.styles.fillColor = GOLD
                data.cell.styles.textColor = DARK
                data.cell.styles.fontStyle = 'bold'
            }
        },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2,
    })

    const habitMap = new Map<string, { nombre: string; tipo: string; reservas: number; ingresos: number }>()
    datos.reservas.forEach(r => {
        if (r.alojamientos) {
            const key = r.alojamientos.nombre
            const prev = habitMap.get(key) || { nombre: key, tipo: r.alojamientos.tipo, reservas: 0, ingresos: 0 }
            prev.reservas++
            prev.ingresos += r.total || 0
            habitMap.set(key, prev)
        }
    })
    const topHabit = Array.from(habitMap.values()).sort((a, b) => b.ingresos - a.ingresos).slice(0, 8)

    const afterMeses = (doc as any).lastAutoTable.finalY + 10
    sectionTitle(doc, 'ALOJAMIENTOS MÁS RENTABLES', afterMeses)

    autoTable(doc, {
        startY: afterMeses + 6,
        head: [['#', 'Alojamiento', 'Tipo', 'Reservas', 'Ingresos (S/.)']],
        body: topHabit.map((h, i) => [
            String(i + 1), h.nombre, h.tipo, String(h.reservas), formatMonto(h.ingresos)
        ]),
        headStyles: { fillColor: DARK, textColor: GOLD, fontSize: 9, fontStyle: 'bold', halign: 'center', cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 3.5 },
        alternateRowStyles: { fillColor: GRAY },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { fontStyle: 'bold', cellWidth: 65 },
            2: { cellWidth: 28 },
            3: { halign: 'center', cellWidth: 25 },
            4: { halign: 'right', cellWidth: 45 },
        },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2,
    })

    drawFooter(doc)
    doc.save(`Reporte_Ingresos_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportReservasExcel = async (reservas: ReservaConRelaciones[]) => {
    const XLSX = await import('xlsx')

    const detalle = reservas.map((r, i) => ({
        '#': i + 1,
        'Código': r.codigo_reserva || r.id.substring(0, 8).toUpperCase(),
        'Cliente': r.usuarios ? `${r.usuarios.nombre} ${r.usuarios.apellido}` : '—',
        'Email': r.usuarios?.email || '—',
        'Alojamiento': r.alojamientos?.nombre || '—',
        'Tipo': r.alojamientos?.tipo || '—',
        'Check-in': formatFecha(r.fecha_inicio),
        'Check-out': formatFecha(r.fecha_fin),
        'Noches': calcNochesDiff(r.fecha_inicio, r.fecha_fin),
        'Huéspedes': r.personas,
        'Total (S/.)': r.total,
        'Adelanto (S/.)': r.adelanto,
        'Estado': r.estado.charAt(0).toUpperCase() + r.estado.slice(1),
        'Fecha Reserva': formatFecha(r.fecha_creacion),
    }))

    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(detalle)
    ws1['!cols'] = [
        { wch: 5 }, { wch: 14 }, { wch: 24 }, { wch: 28 }, { wch: 30 },
        { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 9 }, { wch: 10 },
        { wch: 13 }, { wch: 14 }, { wch: 13 }, { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Reservas Detalladas')

    const estados = ['pendiente', 'confirmada', 'cancelada']
    const resumenEstado = estados.map(estado => {
        const filtradas = reservas.filter(r => r.estado === estado)
        const ingresos = filtradas.reduce((s, r) => s + (r.total || 0), 0)
        return {
            'Estado': estado.charAt(0).toUpperCase() + estado.slice(1),
            'Cantidad': filtradas.length,
            'Porcentaje': reservas.length > 0 ? `${((filtradas.length / reservas.length) * 100).toFixed(1)}%` : '0%',
            'Ingresos (S/.)': ingresos.toFixed(2),
        }
    })
    resumenEstado.push({
        'Estado': 'TOTAL',
        'Cantidad': reservas.length,
        'Porcentaje': '100%',
        'Ingresos (S/.)': reservas.reduce((s, r) => s + (r.total || 0), 0).toFixed(2),
    })

    const ws2 = XLSX.utils.json_to_sheet(resumenEstado)
    ws2['!cols'] = [{ wch: 16 }, { wch: 11 }, { wch: 13 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Estado')

    const totalIngresos = reservas.reduce((s, r) => s + (r.total || 0), 0)
    const totalConfirmadas = reservas.filter(r => r.estado === 'confirmada').length
    const promedio = reservas.length > 0 ? (totalIngresos / reservas.length) : 0
    const duracionProm = reservas.length > 0
        ? (reservas.reduce((s, r) => s + calcNochesDiff(r.fecha_inicio, r.fecha_fin), 0) / reservas.length).toFixed(1)
        : '0'

    const estadisticas = [
        { 'Métrica': 'Total de Reservas', 'Valor': String(reservas.length) },
        { 'Métrica': 'Confirmadas', 'Valor': String(totalConfirmadas) },
        { 'Métrica': 'Ingresos Totales (S/.)', 'Valor': totalIngresos.toFixed(2) },
        { 'Métrica': 'Promedio por Reserva (S/.)', 'Valor': promedio.toFixed(2) },
        { 'Métrica': 'Duración Promedio (noches)', 'Valor': duracionProm },
        { 'Métrica': 'Tasa de Cancelación', 'Valor': reservas.length > 0 ? `${((reservas.filter(r => r.estado === 'cancelada').length / reservas.length) * 100).toFixed(1)}%` : '0%' },
        { 'Métrica': 'Fecha del Reporte', 'Valor': new Date().toLocaleDateString('es-PE') },
    ]
    const ws3 = XLSX.utils.json_to_sheet(estadisticas)
    ws3['!cols'] = [{ wch: 30 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Estadísticas')

    XLSX.writeFile(wb, `Reporte_Reservas_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export const exportUsuariosCSV = async (usuarios: Usuario[]) => {
    const fecha = new Date().toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    const headers = [
        'ID', 'Nombre', 'Apellido', 'Email', 'Teléfono',
        'Tipo Documento', 'Número Documento', 'País', 'Rol',
        'Verificado', 'Fecha Registro',
    ]

    const filas = usuarios.map(u => [
        u.id,
        u.nombre,
        u.apellido,
        u.email || '—',
        u.telefono || '—',
        u.tipo_documento || '—',
        u.documento_identidad || '—',
        u.pais || '—',
        u.rol,
        u.verificado ? 'Sí' : 'No',
        formatFecha(u.fecha_registro),
    ])

    const verificados = usuarios.filter(u => u.verificado).length
    const noVerificados = usuarios.length - verificados

    const csvRows = [
        ['=== HOTEL ADVENTUR — Atrévete y descubre ==='],
        ['REPORTE DE USUARIOS'],
        [`Generado el: ${fecha}`],
        [''],
        ['── LISTADO DE USUARIOS ──'],
        headers,
        ...filas,
        [''],
        ['── RESUMEN ──'],
        ['Total de Usuarios', String(usuarios.length)],
        ['Usuarios Verificados', String(verificados)],
        ['Usuarios No Verificados', String(noVerificados)],
        ['Administradores', String(usuarios.filter(u => u.rol === 'admin').length)],
        ['Propietarios', String(usuarios.filter(u => u.rol === 'propietario').length)],
        ['Turistas', String(usuarios.filter(u => u.rol === 'turista').length)],
    ]

    const csv = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.csv`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
