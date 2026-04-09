'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Images, Upload, Trash2, Star, Search, X, Loader2, ChevronDown, ChevronUp, Plus, Eye, Hotel, FolderPlus, Folder, FolderOpen } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Swal from 'sweetalert2'

interface Foto { id: string; url: string; es_principal: boolean; alojamiento_id: string | null; album: string | null; titulo: string | null }
interface Alojamiento { id: string; nombre: string; tipo: string; categoria: string; fotos: Foto[] }
interface Album { nombre: string; fotos: Foto[] }
type Tab = 'alojamientos' | 'albumes'
const BUCKET = 'accommodation-photos'
