"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { LogOut, PackagePlus, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { categories as seedCategories, products as seedProducts } from "../catalog-data";
import { auth, db, firebaseConfigured, storage } from "../firebase-client";

const ADMIN_EMAIL = "admin@lunaraboutique.com";
type RecordItem = { id: string; name: string; [key: string]: unknown };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (current) => { setUser(current?.email === ADMIN_EMAIL ? current : null); setLoading(false); });
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!auth || email !== ADMIN_EMAIL) { setError("El acceso está restringido al correo administrador autorizado."); return; }
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setError("No se pudo iniciar sesión. Verificá la configuración y las credenciales."); }
  };

  if (!firebaseConfigured) return <main className="admin-setup"><img src="/logo-lunara.png" alt="Lunara Boutique" /><ShieldCheck /><h1>Firebase requiere configuración</h1><p>El panel no simula el acceso. Para habilitarlo, conectá el proyecto Firebase mediante las variables indicadas en <code>.env.example</code> y creá en Firebase Authentication la cuenta <strong>{ADMIN_EMAIL}</strong>.</p><Link className="outline-button" href="/">Volver a la tienda</Link></main>;
  if (loading) return <main className="loading-state">Verificando acceso…</main>;
  if (!user) return <main className="admin-login"><form onSubmit={login}><img src="/logo-lunara.png" alt="Lunara Boutique" /><p>Panel privado</p><h1>Administración</h1><label>Correo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Ingresar</button><Link href="/">Volver a la tienda</Link></form></main>;
  return <AdminDashboard onLogout={() => auth && signOut(auth)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"products" | "categories" | "brands">("products");
  const [products, setProducts] = useState<RecordItem[]>([]);
  const [categories, setCategories] = useState<RecordItem[]>([]);
  const [brands, setBrands] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!db) return;
    const unsubscribers = [
      onSnapshot(collection(db, "products"), (snapshot) => setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as RecordItem))),
      onSnapshot(collection(db, "categories"), (snapshot) => setCategories(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as RecordItem))),
      onSnapshot(collection(db, "brands"), (snapshot) => setBrands(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as RecordItem))),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const records = tab === "products" ? products : tab === "categories" ? categories : brands;
  const remove = async (id: string) => { if (!db || !window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return; await deleteDoc(doc(db, tab, id)); };
  const seed = async () => {
    if (!db || !window.confirm("Cargar datos de demostración solo en colecciones vacías?")) return;
    const targets = ["products", "categories", "brands"] as const;
    for (const target of targets) {
      const existing = await getDocs(query(collection(db, target), limit(1)));
      if (!existing.empty) continue;
      const source = target === "products" ? seedProducts : target === "categories" ? seedCategories.map((item, index) => ({ ...item, order: index, active: true })) : [{ name: "Bershka", slug: "bershka", active: true }, { name: "Demo Lunara", slug: "demo-lunara", active: true }];
      for (const item of source) await addDoc(collection(db, target), { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    setNotice("Se completaron únicamente las colecciones que estaban vacías.");
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar"><Link className="brand" href="/"><img src="/logo-lunara.png" alt="" /><span>Lunara Admin</span></Link><nav><button className={tab === "products" ? "active" : ""} onClick={() => { setTab("products"); setEditing(null); }}>Productos <span>{products.length}</span></button><button className={tab === "categories" ? "active" : ""} onClick={() => { setTab("categories"); setEditing(null); }}>Categorías <span>{categories.length}</span></button><button className={tab === "brands" ? "active" : ""} onClick={() => { setTab("brands"); setEditing(null); }}>Marcas <span>{brands.length}</span></button></nav><button className="admin-logout" onClick={onLogout}><LogOut size={17} /> Cerrar sesión</button></aside>
      <section className="admin-content"><div className="admin-heading"><div><p>Gestión de catálogo</p><h1>{tab === "products" ? "Productos" : tab === "categories" ? "Categorías" : "Marcas"}</h1></div><div><button className="outline-button" onClick={seed}>Cargar demo</button><button className="primary-button" onClick={() => setEditing({ id: "", name: "" })}><PackagePlus size={18} /> Nuevo</button></div></div>{notice && <p className="admin-notice">{notice}</p>}{editing && <AdminForm type={tab} record={editing} onClose={() => setEditing(null)} />}
        <div className="admin-table"><div className="admin-table-row admin-table-head"><span>Nombre</span><span>Estado / información</span><span>Acciones</span></div>{records.map((record) => <div className="admin-table-row" key={record.id}><strong>{record.name}</strong><span>{tab === "products" ? `Stock: ${String(record.stock ?? 0)} · ${record.brand ?? "Sin marca"}` : String(record.slug ?? "")}</span><span><button onClick={() => setEditing(record)}>Editar</button><button className="danger" onClick={() => remove(record.id)}><Trash2 size={16} /></button></span></div>)}</div>
      </section>
    </main>
  );
}

function AdminForm({ type, record, onClose }: { type: "products" | "categories" | "brands"; record: RecordItem; onClose: () => void }) {
  const [form, setForm] = useState<RecordItem>({ active: true, stock: 0, price: null, image: "", category: "", brand: "", slug: "", description: "", ...record });
  const [uploading, setUploading] = useState(false);
  const set = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!db) return;
    const { id, ...payload } = form;
    if (id) await updateDoc(doc(db, type, id), { ...payload, updatedAt: serverTimestamp() });
    else await addDoc(collection(db, type), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    onClose();
  };
  const upload = async (file?: File) => {
    if (!file || !storage) return; setUploading(true);
    const destination = ref(storage, `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`);
    await uploadBytes(destination, file); set("image", await getDownloadURL(destination)); setUploading(false);
  };
  return <form className="admin-form" onSubmit={submit}><div className="admin-form-head"><h2>{form.id ? "Editar" : "Nuevo"} {type === "products" ? "producto" : type === "categories" ? "categoría" : "marca"}</h2><button type="button" onClick={onClose}>Cerrar</button></div><div className="admin-form-grid"><label>Nombre<input value={form.name} onChange={(event) => set("name", event.target.value)} required /></label><label>Slug<input value={String(form.slug ?? "")} onChange={(event) => set("slug", event.target.value)} required /></label>{type === "products" && <><label>Marca<input value={String(form.brand ?? "")} onChange={(event) => set("brand", event.target.value)} /></label><label>Categoría<input value={String(form.category ?? "")} onChange={(event) => set("category", event.target.value)} /></label><label>Precio<input type="number" value={form.price === null ? "" : String(form.price)} onChange={(event) => set("price", event.target.value ? Number(event.target.value) : null)} /></label><label>Stock<input type="number" value={String(form.stock ?? 0)} onChange={(event) => set("stock", Number(event.target.value))} /></label><label className="wide">Descripción<textarea value={String(form.description ?? "")} onChange={(event) => set("description", event.target.value)} /></label><label className="wide upload-field"><span>Imagen</span><input value={String(form.image ?? "")} onChange={(event) => set("image", event.target.value)} placeholder="URL de imagen" /><span className="upload-button"><Upload size={16} /> {uploading ? "Subiendo…" : "Subir archivo"}<input type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} /></span></label></>}</div><button className="primary-button" type="submit"><Save size={17} /> Guardar cambios</button></form>;
}
