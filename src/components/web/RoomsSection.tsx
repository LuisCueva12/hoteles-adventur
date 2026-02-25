import Link from 'next/link'

const ROOMS = [
    {
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
        title: 'Suite Deluxe',
        price: 'S/. 350',
    },
    {
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        title: 'Habitacion Estandar',
        price: 'S/. 180',
    },
    {
        img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
        title: 'Suite Premium',
        price: 'S/. 520',
    },
]

export function RoomsSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-3">
                        Bienvenido al Hotel
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        Ofrecemos habitaciones de lujo con vistas espectaculares y servicios de primera clase para hacer de tu estadia una experiencia inolvidable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {ROOMS.map((room) => (
                        <div key={room.title} className="group overflow-hidden rounded-sm shadow-md">
                            <div className="relative h-56 overflow-hidden">
                                <img src={room.img} alt={room.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            </div>
                            <div className="p-4 flex items-center justify-between bg-white border border-gray-100">
                                <h3 className="font-semibold text-gray-900">{room.title}</h3>
                                <span className="text-red-600 font-bold text-sm">desde {room.price}/noche</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/hoteles"
                        className="inline-block px-10 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm uppercase tracking-wider transition-colors">
                        Ver todos
                    </Link>
                </div>
            </div>
        </section>
    )
}
