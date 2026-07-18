import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
} from 'lucide-react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'

const emptyForm = { name: '', category: '', price: '', stock: '', image: '' }
const FALLBACK_IMAGE = '/images/camiseta1.jpeg'

function normalizeProduct(snapshotDoc) {
  const data = snapshotDoc.data()
  return {
    id: snapshotDoc.id,
    name: data.nome ?? data.name ?? '',
    category: data.categoria ?? data.category ?? '',
    price: String(data.preco ?? data.price ?? '').replace('.', ','),
    stock: Number(data.estoque ?? data.stock ?? 0),
    image: data.imagem ?? data.image ?? '',
  }
}

function priceToNumber(value) {
  return Number(String(value).replace(/\./g, '').replace(',', '.'))
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [show, setShow] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageError, setImageError] = useState('')
  const [status, setStatus] = useState(firebaseReady ? 'Carregando produtos...' : 'Firebase não configurado.')
  const [saving, setSaving] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    if (!firebaseReady || !db) return undefined

    const unsubscribe = onSnapshot(
      collection(db, 'produtos'),
      snapshot => {
        setProducts(snapshot.docs.map(normalizeProduct))
        setStatus('')
      },
      error => {
        console.error(error)
        setStatus('Não foi possível acessar o Firestore. Confira as regras do banco.')
      },
    )

    return unsubscribe
  }, [])

  const total = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products],
  )

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setImageError('')
    setShow(true)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      stock: product.stock || '',
      image: product.image || '',
    })
    setImageError('')
    setShow(true)
  }

  function handleImage(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Escolha um arquivo de imagem.')
      return
    }

    // Firestore aceita no máximo 1 MiB por documento. Mantemos a foto pequena
    // enquanto o Firebase Storage não estiver disponível.
    if (file.size > 450 * 1024) {
      setImageError('Use uma imagem com no máximo 450 KB. Depois ligaremos um armazenamento de fotos.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm(current => ({ ...current, image: reader.result }))
      setImageError('')
    }
    reader.onerror = () => setImageError('Não foi possível carregar a imagem.')
    reader.readAsDataURL(file)
  }

  async function save(event) {
    event.preventDefault()
    if (!db) {
      setStatus('Firebase não configurado.')
      return
    }

    const price = priceToNumber(form.price)
    if (!Number.isFinite(price)) {
      setStatus('Digite um preço válido, por exemplo: 99,99.')
      return
    }

    const payload = {
      nome: form.name.trim(),
      categoria: form.category.trim(),
      preco: price,
      estoque: Number(form.stock),
      imagem: form.image || '',
      atualizadoEm: serverTimestamp(),
    }

    setSaving(true)
    setStatus('Salvando...')
    try {
      if (editingId) {
        await updateDoc(doc(db, 'produtos', editingId), payload)
      } else {
        await addDoc(collection(db, 'produtos'), {
          ...payload,
          criadoEm: serverTimestamp(),
        })
      }

      setForm(emptyForm)
      setEditingId(null)
      setShow(false)
      setStatus('Produto salvo no Firebase.')
      window.setTimeout(() => setStatus(''), 2500)
    } catch (error) {
      console.error(error)
      setStatus('Erro ao salvar. Confira as regras do Firestore.')
    } finally {
      setSaving(false)
    }
  }

  async function removeProduct(productId) {
    if (!db || !window.confirm('Excluir este produto?')) return
    try {
      await deleteDoc(doc(db, 'produtos', productId))
      setStatus('Produto excluído.')
      window.setTimeout(() => setStatus(''), 2000)
    } catch (error) {
      console.error(error)
      setStatus('Erro ao excluir o produto.')
    }
  }

  function logout() {
    localStorage.removeItem('ar_admin')
    nav('/admin')
  }

  return <div className="admin-shell">
    <aside>
      <div className="logo"><span>A.R</span> OUTLET</div>
      <p className="aside-title">ADMIN</p>
      <a className="active"><LayoutDashboard size={19}/>Dashboard</a>
      <a><Package size={19}/>Produtos</a>
      <a><ShoppingBag size={19}/>Pedidos</a>
      <a><Users size={19}/>Clientes</a>
      <a><Settings size={19}/>Configurações</a>
      <button onClick={logout}><LogOut size={19}/>Sair</button>
    </aside>

    <section className="admin-content">
      <header>
        <div><p>PAINEL ADMINISTRATIVO</p><h1>Bem-vinda à A.R Outlet</h1></div>
        <button className="btn" onClick={openNew}><Plus size={18}/> Novo produto</button>
      </header>

      {status && <p className="firebase-status">{status}</p>}

      <div className="stats">
        <div><span>Produtos cadastrados</span><strong>{products.length}</strong></div>
        <div><span>Itens em estoque</span><strong>{total}</strong></div>
        <div><span>Pedidos</span><strong>0</strong></div>
        <div><span>Faturamento</span><strong>R$ 0,00</strong></div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Produtos</h2><span>{products.length} cadastrados</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Foto</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
            <tbody>{products.map(product => <tr key={product.id}>
              <td><img className="product-thumb" src={product.image || FALLBACK_IMAGE} onError={event => { event.currentTarget.src = FALLBACK_IMAGE }} alt={product.name}/></td>
              <td><strong>{product.name}</strong></td>
              <td>{product.category}</td>
              <td>R$ {product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button className="icon" onClick={() => openEdit(product)} aria-label="Editar produto"><Pencil size={16}/></button>
                <button className="icon danger" onClick={() => removeProduct(product.id)} aria-label="Excluir produto"><Trash2 size={16}/></button>
              </td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {show && <div className="modal">
        <form onSubmit={save}>
          <div className="modal-head">
            <h2>{editingId ? 'Editar produto' : 'Novo produto'}</h2>
            <button type="button" onClick={() => setShow(false)}>×</button>
          </div>

          <label>Nome
            <input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/>
          </label>

          <label>Imagem do produto
            <span className="image-picker">
              {form.image
                ? <img src={form.image} alt="Pré-visualização do produto"/>
                : <span className="image-placeholder"><ImagePlus size={30}/><small>Escolher imagem</small></span>}
              <input type="file" accept="image/*" onChange={handleImage}/>
            </span>
          </label>
          {imageError && <p className="image-error">{imageError}</p>}

          <label>Categoria
            <input required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}/>
          </label>

          <div className="two">
            <label>Preço
              <input required value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} placeholder="99,99"/>
            </label>
            <label>Estoque
              <input required min="0" type="number" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })}/>
            </label>
          </div>

          <button className="btn" type="submit" disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar produto'}</button>
        </form>
      </div>}
    </section>
  </div>
}
