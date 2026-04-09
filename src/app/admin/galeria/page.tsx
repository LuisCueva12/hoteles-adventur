'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
    Images, Upload, Trash2, Star, Search, X, Loader2,
    ChevronDown, ChevronUp, Plus, Eye, Hotel,
    FolderPlus, Folder, FolderOpen
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Swal from 'sweetalert2'

interface Foto {
    id: string; url: string; es_principal: boolean
    alojamiento_id: string | null; album: string | null; titulo: string | null
}
interface Alojamiento {
    id: string; nombre: string; tipo: string; categoria: string; fotos: Foto[]
}
interface Album { nombre: string; fotos: Foto[] }
type Tab = 'alojamientos' | 'albumes'
const BUCKET = 'accommodation-photos'

export default function GaleriaAdminPage() {
    const supabase = createClient()
    const [tab, setTab] = useState<Tab>('alojamientos')
    const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([])
    const [albumes, setAlbumes] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
    const [uploading, setUploading] = useState<string | null>(null)
    const [lightbox, setLightbox] = useState<Foto | null>(null)
    const [showNuevoAlbum, setShowNuevoAlbum] = useState(false)
    const [nuevoAlbumNombre, setNuevoAlbumNombre] = useState('')
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

    useEffect(() => { cargar() }, [])

    async function cargar() {
        setLoading(true)
        try {
            const [resAloj, resFotos] = await Promise.all([
                supabase.from('alojamientos')
                    .select('id, nombre, tipo, categoria, fotos_alojamiento ( id, url, es_principal, alojamiento_id, album, titulo )')
                    .order('nombre'),
                supabase.from('fotos_alojamiento')
                    .select('id, url, es_principal, alojamiento_id, album, titulo')
                    .is('alojamiento_id', null).order('album').order('titulo')
            ])
            if (resAloj.error) throw resAloj.error
            const mapped: Alojamiento[] = (resAloj.data || []).map((a: any) => ({
                id: a.id, nombre: a.nombre, tipo: a.tipo, categoria: a.categoria,
                fotos: (a.fotos_alojamiento || []).sort((x: Foto, y: Foto) =>
                    x.es_principal === y.es_principal ? 0 : x.es_principal ? -1 : 1),
            }))
            setAlojamientos(mapped)
            const fotosGenerales: Foto[] = resFotos.data || []
            const albumMap: Record<string, Foto[]> = {}
            fotosGenerales.forEach(f => {
                const key = f.album || 'Sin album'
                if (!albumMap[key]) albumMap[key] = []
                albumMap[key].push(f)
            })
            setAlbumes(Object.entries(albumMap).map(([nombre, fotos]) => ({ nombre, fotos })))
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function ensureBucket() {
        const { data: buckets } = await supabase.storage.listBuckets()
        if (!buckets?.some((b: any) => b.id === BUCKET)) {
            await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 10485760 })
        }
    }

    function toggleExpandido(id: string) {
        setExpandidos(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
    }

    async function uploadFiles(files: File[], prefix: string): Promise<string[]> {
        await ensureBucket()
        const urls: string[] = []
        for (const file of files) {
            const ext = file.name.split('.').pop()
            const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`
            const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false })
            if (error) {
                if (error.message.includes('Bucket not found'))
                    throw new Error('Bucket no encontrado. Ejecuta la migracion 010_accommodation_photos_storage.sql en Supabase.')
                throw new Error(`Error subiendo ${file.name}: ${error.message}`)
            }
            const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
            urls.push(publicUrl)
        }
        return urls
    }

    async function handleUploadAlojamiento(alojamientoId: string, files: FileList | null) {
        if (!files || files.length === 0) return
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (!valid.length) return
        setUploading(alojamientoId)
        try {
            const aloj = alojamientos.find(a => a.id === alojamientoId)
            const yaHayFotos = (aloj?.fotos.length ?? 0) > 0
            const urls = await uploadFiles(valid, alojamientoId)
            const rows = urls.map((url, i) => ({ alojamiento_id: alojamientoId, url, es_principal: !yaHayFotos && i === 0 }))
            const { error } = await supabase.from('fotos_alojamiento').insert(rows)
            if (error) throw error
            await cargar()
            setExpandidos(prev => new Set([...prev, alojamientoId]))
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#3B82F6' })
        } finally {
            setUploading(null)
            const ref = fileRefs.current[alojamientoId]; if (ref) ref.value = ''
        }
    }

    async function handleUploadAlbum(albumNombre: string, files: FileList | null) {
        if (!files || files.length === 0) return
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (!valid.length) return
        setUploading('album_' + albumNombre)
        try {
            const urls = await uploadFiles(valid, `general/${albumNombre}`)
            const rows = urls.map((url, i) => ({ alojamiento_id: null, album: albumNombre, url, es_principal: false, titulo: valid[i].name.replace(/\.[^.]+$/, '') }))
            const { error } = await supabase.from('fotos_alojamiento').insert(rows)
            if (error) throw error
            await cargar()
            setExpandidos(prev => new Set([...prev, albumNombre]))
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#3B82F6' })
        } finally {
            setUploading(null)
            const ref = fileRefs.current['album_' + albumNombre]; if (ref) ref.value = ''
        }
    }

    async function crearAlbum() {
        const nombre = nuevoAlbumNombre.trim()
        if (!nombre) return
        if (albumes.some(a => a.nombre.toLowerCase() === nombre.toLowerCase())) {
            Swal.fire({ icon: 'warning', title: 'Ya existe', text: 'Ya hay un album con ese nombre', confirmButtonColor: '#3B82F6' }); return
        }
        setAlbumes(prev => [...prev, { nombre, fotos: [] }])
        setExpandidos(prev => new Set([...prev, nombre]))
        setNuevoAlbumNombre(''); setShowNuevoAlbum(false); setTab('albumes')
    }

    async function handleEliminarFoto(foto: Foto) {
        const result = await Swal.fire({ title: 'Eliminar foto?', text: 'Esta accion no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Si, eliminar', cancelButtonText: 'Cancelar' })
        if (!result.isConfirmed) return
        try {
            const urlObj = new URL(foto.url)
            const storagePath = urlObj.pathname.split(`/${BUCKET}/`)[1]
            if (storagePath) await supabase.storage.from(BUCKET).remove([storagePath])
            const { error } = await supabase.from('fotos_alojamiento').delete().eq('id', foto.id)
            if (error) throw error
            if (foto.es_principal && foto.alojamiento_id) {
                const aloj = alojamientos.find(a => a.id === foto.alojamiento_id)
                const siguiente = aloj?.fotos.find(f => f.id !== foto.id)
                if (siguiente) await supabase.from('fotos_alojamiento').update({ es_principal: true }).eq('id', siguiente.id)
            }
            await cargar()
        } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#3B82F6' }) }
    }

    async function handleSetPrincipal(foto: Foto) {
        try {
            await supabase.from('fotos_alojamiento').update({ es_principal: false }).eq('alojamiento_id', foto.alojamiento_id)
            const { error } = await supabase.from('fotos_alojamiento').update({ es_principal: true }).eq('id', foto.id)
            if (error) throw error
            await cargar()
        } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#3B82F6' }) }
    }

    async function eliminarAlbum(albumNombre: string) {
        const result = await Swal.fire({ title: 'Eliminar album?', text: 'Se eliminaran todas las fotos.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Si, eliminar', cancelButtonText: 'Cancelar' })
        if (!result.isConfirmed) return
        try {
            const album = albumes.find(a => a.nombre === albumNombre)
            if (album) for (const foto of album.fotos) {
                const urlObj = new URL(foto.url)
                const sp = urlObj.pathname.split(`/${BUCKET}/`)[1]
                if (sp) await supabase.storage.from(BUCKET).remove([sp])
            }
            await supabase.from('fotos_alojamiento').delete().eq('album', albumNombre).is('alojamiento_id', null)
            await cargar()
        } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#3B82F6' }) }
    }

    const filtradosAloj = alojamientos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.tipo.toLowerCase().includes(busqueda.toLowerCase()))
    const filtradosAlbumes = albumes.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    const totalFotosAloj = alojamientos.reduce((s, a) => s + a.fotos.length, 0)
    const totalFotosAlbum = albumes.reduce((s, a) => s + a.fotos.length, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Images className="w-7 h-7 text-blue-600" />
                        Gestion de Galeria
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{alojamientos.length} alojamientos · {albumes.length} albumes · {totalFotosAloj + totalFotosAlbum} fotos</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                        {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                    </div>
                    <button onClick={() => setShowNuevoAlbum(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all">
                        <FolderPlus className="w-4 h-4" /> Nuevo Album
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Alojamientos', value: alojamientos.length, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Albumes', value: albumes.length, color: 'bg-purple-50 text-purple-700' },
                    { label: 'Fotos aloj.', value: totalFotosAloj, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Fotos album', value: totalFotosAlbum, color: 'bg-green-50 text-green-700' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button onClick={() => setTab('alojamientos')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'alojamientos' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    <Hotel className="w-4 h-4" /> Por Alojamiento
                </button>
                <button onClick={() => setTab('albumes')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'albumes' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    <Folder className="w-4 h-4" /> Albumes Generales
                    {albumes.length > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{albumes.length}</span>}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : tab === 'alojamientos' ? (
                <div className="space-y-3">
                    {filtradosAloj.length === 0 ? (
                        <div className="text-center py-16 text-gray-400"><Hotel className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No se encontraron alojamientos</p></div>
                    ) : filtradosAloj.map(aloj => {
                        const abierto = expandidos.has(aloj.id)
                        const subiendo = uploading === aloj.id
                        return (
                            <div key={aloj.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpandido(aloj.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                            {aloj.fotos.length > 0
                                                ? <Image src={aloj.fotos.find(f => f.es_principal)?.url || aloj.fotos[0].url} alt={aloj.nombre} width={48} height={48} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center"><Hotel className="w-5 h-5 text-gray-300" /></div>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{aloj.nombre}</p>
                                            <p className="text-xs text-gray-500">{aloj.tipo} · {aloj.categoria}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${aloj.fotos.length === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>{aloj.fotos.length} foto{aloj.fotos.length !== 1 ? 's' : ''}</span>
                                        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>
                                {abierto && (
                                    <div className="border-t border-gray-100 px-5 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-semibold text-gray-700">Fotos del alojamiento</p>
                                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${subiendo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}>
                                                {subiendo ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Plus className="w-4 h-4" /> Agregar fotos</>}
                                                <input type="file" accept="image/*" multiple className="hidden" disabled={subiendo} ref={el => { fileRefs.current[aloj.id] = el }} onChange={e => handleUploadAlojamiento(aloj.id, e.target.files)} />
                                            </label>
                                        </div>
                                        {aloj.fotos.length === 0 ? (
                                            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-all">
                                                <Upload className="w-8 h-8 mb-2" /><p className="text-sm font-medium">Haz clic para subir fotos</p><p className="text-xs mt-1">PNG, JPG, WEBP</p>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUploadAlojamiento(aloj.id, e.target.files)} />
                                            </label>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {aloj.fotos.map(foto => (
                                                    <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-400 transition-all">
                                                        <Image src={foto.url} alt="foto" fill sizes="160px" className="object-cover" />
                                                        {foto.es_principal && <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> Principal</div>}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button onClick={() => setLightbox(foto)} className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></button>
                                                            {!foto.es_principal && <button onClick={() => handleSetPrincipal(foto)} className="w-8 h-8 bg-yellow-400/80 hover:bg-yellow-400 rounded-full flex items-center justify-center"><Star className="w-4 h-4 text-gray-900" /></button>}
                                                            <button onClick={() => handleEliminarFoto(foto)} className="w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4 text-white" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtradosAlbumes.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="mb-4">No hay albumes generales aun</p>
                            <button onClick={() => setShowNuevoAlbum(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold mx-auto transition-all">
                                <FolderPlus className="w-4 h-4" /> Crear primer album
                            </button>
                        </div>
                    ) : filtradosAlbumes.map(album => {
                        const abierto = expandidos.has(album.nombre)
                        const subiendo = uploading === 'album_' + album.nombre
                        return (
                            <div key={album.nombre} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpandido(album.nombre)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            {abierto ? <FolderOpen className="w-6 h-6 text-purple-600" /> : <Folder className="w-6 h-6 text-purple-600" />}
                                        </div>
                                        <div><p className="font-semibold text-gray-900">{album.nombre}</p><p className="text-xs text-gray-500">Album general</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${album.fotos.length === 0 ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-700'}`}>{album.fotos.length} foto{album.fotos.length !== 1 ? 's' : ''}</span>
                                        <button onClick={e => { e.stopPropagation(); eliminarAlbum(album.nombre) }} className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>
                                {abierto && (
                                    <div className="border-t border-gray-100 px-5 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-semibold text-gray-700">Fotos del album</p>
                                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${subiendo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'}`}>
                                                {subiendo ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Plus className="w-4 h-4" /> Agregar fotos</>}
                                                <input type="file" accept="image/*" multiple className="hidden" disabled={subiendo} ref={el => { fileRefs.current['album_' + album.nombre] = el }} onChange={e => handleUploadAlbum(album.nombre, e.target.files)} />
                                            </label>
                                        </div>
                                        {album.fotos.length === 0 ? (
                                            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-purple-200 rounded-2xl text-gray-400 cursor-pointer hover:border-purple-400 hover:text-purple-500 transition-all">
                                                <Upload className="w-8 h-8 mb-2" /><p className="text-sm font-medium">Subir fotos al album</p><p className="text-xs mt-1">PNG, JPG, WEBP</p>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUploadAlbum(album.nombre, e.target.files)} />
                                            </label>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {album.fotos.map(foto => (
                                                    <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-purple-400 transition-all">
                                                        <Image src={foto.url} alt={foto.titulo || 'foto'} fill sizes="160px" className="object-cover" />
                                                        {foto.titulo && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">{foto.titulo}</div>}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button onClick={() => setLightbox(foto)} className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></button>
                                                            <button onClick={() => handleEliminarFoto(foto)} className="w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4 text-white" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {showNuevoAlbum && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNuevoAlbum(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-blue-600" /> Nuevo Album</h2>
                            <button onClick={() => setShowNuevoAlbum(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-600" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del album</label>
                                <input type="text" value={nuevoAlbumNombre} onChange={e => setNuevoAlbumNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && crearAlbum()}
                                    placeholder="Ej: Piscina, Restaurante, Eventos..." autoFocus
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowNuevoAlbum(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">Cancelar</button>
                                <button onClick={crearAlbum} disabled={!nuevoAlbumNombre.trim()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm">Crear Album</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center" onClick={() => setLightbox(null)}><X className="w-5 h-5 text-white" /></button>
                    <div className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <Image src={lightbox.url} alt="preview" width={1200} height={800} className="w-full h-full object-contain" />
                    </div>
                </div>
            )}
        </div>
    )
}
