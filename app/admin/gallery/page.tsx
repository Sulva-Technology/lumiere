'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, LoaderCircle, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Glass } from '@/components/ui/glass';
import type { GalleryItem } from '@/lib/types';

type GalleryForm = {
  id: string | null;
  title: string;
  alt: string;
  category: string;
  imageUrl: string;
  mediaAssetId: string | null;
  sortOrder: string;
  active: boolean;
};

const EMPTY_FORM: GalleryForm = { id: null, title: '', alt: '', category: '', imageUrl: '', mediaAssetId: null, sortOrder: '0', active: true };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<GalleryForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/gallery');
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to load gallery.');
      setItems(json.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load gallery.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await fetch('/api/admin/uploads/gallery-image', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to upload image.');
      setForm((current) => ({ ...current, imageUrl: json.url, mediaAssetId: json.mediaAsset?.id ?? null, alt: current.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload image.');
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/gallery', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id ?? undefined,
          title: form.title || null,
          alt: form.alt,
          category: form.category || null,
          imageUrl: form.imageUrl,
          mediaAssetId: form.mediaAssetId,
          sortOrder: Number(form.sortOrder || 0),
          active: form.active,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to save gallery image.');
      setItems((current) => form.id ? current.map((item) => item.id === json.item.id ? json.item : item) : [...current, json.item].sort((a, b) => a.sortOrder - b.sortOrder));
      setForm(EMPTY_FORM);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save gallery image.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this gallery image?')) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to remove gallery image.');
      setItems((current) => current.filter((item) => item.id !== id));
      if (form.id === id) setForm(EMPTY_FORM);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove gallery image.');
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Homepage Portfolio</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Gallery</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Upload your best work, add a label, then choose its order on the homepage.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-[#6d4a13]/40 bg-[#1a1108] px-4 py-2 text-sm text-white/70">{items.length} images</div>
      </div>

      {error && <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">{error}</Glass>}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Glass level="medium" className="border border-[#6d4a13]/35 bg-[#1a1108] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(212,168,71,0.14)] text-[#F0D080]">{form.id ? <Pencil size={18} /> : <Plus size={18} />}</div>
            <div><h2 className="font-serif text-2xl text-[#F7E7C1]">{form.id ? 'Edit Image' : 'Add Image'}</h2><p className="text-sm text-white/55">Only active images appear on the homepage.</p></div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={save}>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-dashed border-white/15 bg-black/20">
              {form.imageUrl ? <Image src={form.imageUrl} alt={form.alt || 'Gallery preview'} fill className="object-cover" unoptimized /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-white/40"><ImagePlus size={28} />Image preview</div>}
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
              {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{uploading ? 'Uploading...' : 'Upload from device'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ''; }} />
            </label>
            <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Image URL" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title (optional)" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category, e.g. Soft Glam" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <input value={form.alt} onChange={(event) => setForm({ ...form, alt: event.target.value })} placeholder="Describe the image for accessibility" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
            <div className="grid grid-cols-[1fr_auto] gap-3"><input value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} type="number" min="0" placeholder="Order" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" /><label className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm text-white/80"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />Live</label></div>
            <button type="submit" disabled={saving || uploading} className="w-full rounded-2xl bg-[#D4A847] px-5 py-3 font-medium text-[#140d05] disabled:opacity-60">{saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add to Gallery'}</button>
            {form.id && <button type="button" onClick={() => setForm(EMPTY_FORM)} className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm text-white/70 hover:bg-white/5">Cancel Editing</button>}
          </form>
        </Glass>

        {loading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-white/5" />)}</div> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => <div key={item.id} className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-black/20"><Image src={item.imageUrl} alt={item.alt} fill className="object-cover" unoptimized /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4"><p className="text-xs uppercase tracking-widest text-white/60">{item.category || 'Unlabelled'}</p><p className="mt-1 truncate font-serif text-xl text-white">{item.title || 'Gallery image'}</p></div><div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100"><button onClick={() => setForm({ id: item.id, title: item.title || '', alt: item.alt, category: item.category || '', imageUrl: item.imageUrl, mediaAssetId: item.mediaAssetId, sortOrder: String(item.sortOrder), active: item.active })} className="rounded-full bg-black/65 p-2 text-white" aria-label={`Edit ${item.title || 'gallery image'}`}><Pencil size={15} /></button><button onClick={() => void remove(item.id)} className="rounded-full bg-red-700/85 p-2 text-white" aria-label={`Remove ${item.title || 'gallery image'}`}><Trash2 size={15} /></button></div>{!item.active && <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">Hidden</span>}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
