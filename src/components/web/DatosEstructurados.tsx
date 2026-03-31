interface DatosEstructuradosProps {
    data: object | object[]
}

export function DatosEstructurados({ data }: DatosEstructuradosProps) {
    const jsonLd = Array.isArray(data) ? data : [data]

    return (
        <>
            {jsonLd.map((item, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
                />
            ))}
        </>
    )
}
