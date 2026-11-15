import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  CirclePlus,
  CupSoda,
  Droplets,
  Flame,
  ImagePlus,
  Save,
  Sparkles,
  Tag,
  Upload,
  Utensils,
  X,
} from 'lucide-react'
import logo from '../../assets/Logo1.png'
import { adminCreateProduct } from '../../services/adminApi'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const CATEGORIES = [
  { id: 'burger', label: 'Burgers', icon: Flame },
  { id: 'side', label: 'Accompagnements', icon: Utensils },
  { id: 'sauce', label: 'Sauces', icon: Droplets },
  { id: 'drink', label: 'Boissons', icon: CupSoda },
]

const defaultForm = {
  name: '',
  description: '',
  category: 'burger',
  price: '',
  image: '',
  tag: '',
  order: '1',
  available: true,
}

async function uploadToCloudinary(file) {
  if (!file) return ''
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary non configuré. Vérifie VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('cloud_name', CLOUD_NAME)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || 'Échec de l’upload de l’image.')
  }

  return data.secure_url
}

export default function AddProductPage() {
  const reduce = useReducedMotion()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const previewCategory = useMemo(
    () => CATEGORIES.find((category) => category.id === form.category) ?? CATEGORIES[0],
    [form.category],
  )

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Le fichier sélectionné n’est pas une image valide.')
      return
    }

    try {
      setUploadingImage(true)
      setError('')

      const secureUrl = await uploadToCloudinary(file)
      updateField('image', secureUrl)
      setSuccess('Image uploadée avec succès.')
    } catch (err) {
      setError(err?.message || 'Impossible d’uploader l’image.')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanName = form.name.trim()
    const cleanDescription = form.description.trim()
    const cleanedPrice = Number(form.price)

    if (!cleanName) {
      setError('Le nom du produit est obligatoire.')
      return
    }

    if (!Number.isFinite(cleanedPrice) || cleanedPrice < 0) {
      setError('Le prix doit être un nombre valide.')
      return
    }

    if (!form.image) {
      setError('Tu dois ajouter une image avant de sauvegarder le produit.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const payload = {
        id: `prod-${Date.now()}`,
        category: form.category,
        name: cleanName,
        description: cleanDescription,
        price: cleanedPrice,
        image: form.image,
        image_url: form.image,
        tag: form.tag.trim(),
        order: Number(form.order) || 999,
        available: form.available,
      }

      const result = await adminCreateProduct(payload)
      setSuccess(result?.message || 'Produit ajouté avec succès.')
      setForm(defaultForm)
    } catch (err) {
      setError(err?.message || 'Impossible d’ajouter ce produit.')
    } finally {
      setSubmitting(false)
    }
  }

  const PreviewIcon = previewCategory.icon

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-white text-neutral-900">
      <header className="relative w-full overflow-hidden px-5 pb-8 pt-24 sm:px-6 sm:pb-10 md:pt-28 lg:px-12">
        <div className="pointer-events-none absolute left-0 top-0 z-0 h-36 w-44 sm:hidden">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 0,0 L 0,180 C 80,180 140,120 160,0 Z" />
          </svg>
        </div>

        <div className="pointer-events-none absolute left-2 top-3 z-10 flex items-center justify-center p-2 sm:hidden">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-72 w-80 sm:block md:h-80 md:w-[42%]">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 200,0 L 200,180 C 120,180 60,120 40,0 Z" />
          </svg>
        </div>

        <div className="pointer-events-none absolute right-10 top-20 z-10 hidden items-center justify-center p-2 sm:flex">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-24 w-auto object-contain brightness-0 invert drop-shadow-md md:h-32"
          />
        </div>

        <div className="relative z-10 w-full">
          <div className="pt-8 text-center sm:pr-60 sm:pt-0 sm:text-left md:pr-72">
            <div className="mb-3 hidden items-center gap-2 rounded-full bg-[#C62F1D]/10 px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-[#C62F1D] sm:inline-flex">
              <CirclePlus size={14} strokeWidth={2.5} />
              <span>Création de menu</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Nouveau plat
            </h1>
          </div>

          <div className="mt-4 w-full">
            <p className="w-full text-center text-sm leading-relaxed text-neutral-600 sm:text-left sm:text-base md:text-xl">
              Ajoute un burger, une boisson, un accompagnement ou une sauce directement dans la base de données du menu.
            </p>
          </div>
        </div>
      </header>

      <section className="relative min-h-[60vh] w-full rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-20 pt-10 text-white sm:px-6 lg:px-12">
        <div className="relative z-10 mx-auto max-w-7xl">
          {(error || success) && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-[1.5rem] border-2 px-5 py-3.5 text-sm font-bold ${
                error
                  ? 'border-[#F8C5B9] bg-[#FDEFEF] text-[#8A2115]'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {error ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
              <span>{error || success}</span>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <motion.form
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="rounded-[2rem] border-2 border-white/20 bg-white p-4 text-neutral-900 shadow-2xl shadow-black/20 sm:p-6 lg:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-3 border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold tracking-tighter sm:text-3xl">
                      Fiche produit
                    </h2>
                    <p className="text-xs font-semibold text-neutral-500 sm:text-sm">
                      Détails du menu et visibilité client
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Nom du plat
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D] focus:bg-white"
                    placeholder="Ex : Double Smash Burger"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 outline-none transition focus:border-[#C62F1D] focus:bg-white"
                    placeholder="Décrivez le produit pour les clients..."
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Catégorie
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) => updateField('category', event.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D] focus:bg-white"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Prix (DA)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={form.price}
                    onChange={(event) => updateField('price', event.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D] focus:bg-white"
                    placeholder="900"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Image du produit
                  </span>
                  <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-3">
                    <div className="flex items-center gap-2">
                      <ImagePlus size={16} className="text-[#C62F1D]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-neutral-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#C62F1D] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                      />
                    </div>

                    {uploadingImage && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#C62F1D]/10 px-3 py-2 text-xs font-bold text-[#C62F1D]">
                        <Upload size={14} className="animate-pulse" />
                        Upload en cours...
                      </div>
                    )}

                    {form.image && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                        Image prête : {form.image.slice(0, 60)}...
                      </div>
                    )}
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Tag
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-3 py-2.5 focus-within:border-[#C62F1D] focus-within:bg-white">
                    <Tag size={16} className="text-[#C62F1D]" />
                    <input
                      value={form.tag}
                      onChange={(event) => updateField('tag', event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:text-neutral-400"
                      placeholder="Le préféré de la maison"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                    Ordre dans le menu
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={(event) => updateField('order', event.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D] focus:bg-white"
                    placeholder="1"
                  />
                </label>

                <div className="flex items-end md:col-span-2">
                  <label className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-800">
                    <span>Visible pour les clients</span>
                    <button
                      type="button"
                      onClick={() => updateField('available', !form.available)}
                      aria-pressed={form.available}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        form.available ? 'bg-[#C62F1D]' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          form.available ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setForm(defaultForm)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-200 bg-neutral-100 px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-neutral-700 transition hover:bg-neutral-200"
                >
                  <X size={16} />
                  Réinitialiser
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C62F1D] px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-black/15 transition hover:bg-[#a62216] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {submitting ? 'Enregistrement...' : 'Ajouter le plat'}
                </button>
              </div>
            </motion.form>

            <motion.aside
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.06 }}
              className="rounded-[2rem] border-2 border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm sm:p-5"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#C62F1D] shadow-md">
                  <PreviewIcon size={20} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-white/80">Aperçu</p>
                  <h3 className="font-display text-2xl font-extrabold tracking-tighter">
                    {previewCategory.label}
                  </h3>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] bg-white text-neutral-900 shadow-xl shadow-black/10">
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F9E6D1] via-[#F4EFEA] to-[#F7D1B0] p-4">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt={form.name || 'Produit'}
                      className="h-full w-full rounded-[1.2rem] object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[1.2rem] border-2 border-dashed border-[#C62F1D]/25 bg-white/40 text-center text-xs font-bold uppercase tracking-wider text-[#C62F1D]">
                      Image du produit
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl font-extrabold tracking-tight">
                        {form.name || 'Nom du produit'}
                      </p>
                      {form.tag && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-[#C62F1D]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#C62F1D]">
                          {form.tag}
                        </span>
                      )}
                    </div>
                    <div className="rounded-full bg-[#C62F1D] px-2.5 py-1 text-sm font-extrabold text-white">
                      {Number(form.price || 0).toLocaleString('fr-DZ')} DA
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm text-neutral-600">
                    {form.description || 'La description du produit apparaîtra ici et sera visible sur le menu client.'}
                  </p>

                  <div className="flex items-center justify-between rounded-2xl bg-neutral-100 px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                    <span>Disponibilité</span>
                    <span className={form.available ? 'text-emerald-700' : 'text-[#C62F1D]'}>
                      {form.available ? 'Visible' : 'Masqué'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </div>
  )
}
