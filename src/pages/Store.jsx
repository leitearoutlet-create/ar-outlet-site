import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'

const fallbackProducts = [
  { image: '/images/tenis1.jpeg', category: 'CALÇADOS', name: 'Tênis premium', price: '' },
  { image: '/images/tenis2.jpeg', category: 'CALÇADOS', name: 'Tênis preto e branco', price: '' },
  { image: '/images/look1.jpeg', category: 'LOOKS', name: 'Jaqueta + calça', price: '' },
  { image: '/images/camiseta1.jpeg', category: 'CAMISETAS', name: 'Camisetas estampadas', price: '' },
  { image: '/images/camiseta2.jpeg', category: 'ESPORTIVO', name: 'Camiseta esportiva', price: '' },
  { image: '/images/look2.jpeg', category: 'LOOKS', name: 'Look completo', price: '' },
]

const wa = 'https://wa.me/5511922082338'
const FALLBACK_IMAGE = '/images/camiseta1.jpeg'

function normalizeProduct(snapshotDoc) {
  const data = snapshotDoc.data()
  const price = Number(data.preco ?? data.price)
  return {
    id: snapshotDoc.id,
    image: data.imagem ?? data.image ?? FALLBACK_IMAGE,
    category: String(data.categoria ?? data.category ?? 'PRODUTO').toUpperCase(),
    name: data.nome ?? data.name ?? 'Produto',
    price: Number.isFinite(price) ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
  }
}

export default function Store() {
  const [products, setProducts] = useState(fallbackProducts)

  useEffect(() => {
    if (!firebaseReady || !db) return undefined
    return onSnapshot(collection(db, 'produtos'), snapshot => {
      const firebaseProducts = snapshot.docs.map(normalizeProduct)
      if (firebaseProducts.length) setProducts(firebaseProducts)
    }, error => console.error('Erro ao carregar produtos:', error))
  }, [])

  return <div className="store-page">
    <header className="topbar"><div className="wrap nav"><a className="logo" href="#inicio"><span>A.R</span> OUTLET</a><nav><a href="#promo">Promoção</a><a href="#produtos">Produtos</a><a href="#loja">Loja</a></nav><a className="btn small" href={`${wa}?text=Olá! Vim pelo site da A.R Outlet.`} target="_blank">WhatsApp</a></div></header>
    <main>
      <section id="inicio" className="hero"><div className="shade"/><div className="wrap hero-content"><span className="tag">MODA MASCULINA • INFANTIL AO ADULTO</span><h1>Camisetas multimarcas</h1><p className="sub">Malha algodão 30.1</p><div className="offer">4 por <strong>R$ 99,99</strong></div><p>Variedade de estampas, cores e tamanhos. Consulte disponibilidade pelo WhatsApp.</p><div className="actions"><a className="btn" href={`${wa}?text=Olá! Quero aproveitar a promoção de 4 camisetas por R$ 99,99.`} target="_blank">Quero essa promoção</a><a className="btn ghost" href="#produtos">Ver produtos</a></div></div></section>
      <section id="promo" className="promo"><div className="wrap promo-grid"><img src="/images/promo.jpeg"/><div><span className="tag">OFERTA ESPECIAL</span><h2>1 camiseta por R$ 30,00</h2><h3>ou 4 por R$ 99,99</h3><p>Todas multimarcas, em malha algodão 30.1. Escolha seus modelos favoritos e monte seu combo.</p><a className="btn" href={wa} target="_blank">Ver modelos no WhatsApp</a></div></div></section>
      <section id="produtos" className="products"><div className="wrap"><div className="section-title"><span className="tag">NOVIDADES</span><h2>Produtos em destaque</h2></div><div className="grid">{products.map(product => <article key={product.id || product.name}><img src={product.image || FALLBACK_IMAGE} onError={event => { event.currentTarget.src = FALLBACK_IMAGE }}/><div><small>{product.category}</small><h3>{product.name}</h3>{product.price && <strong>{product.price}</strong>}<a href={`${wa}?text=Olá! Quero saber mais sobre ${encodeURIComponent(product.name)}.`} target="_blank">Consultar →</a></div></article>)}</div></div></section>
      <section className="models"><img src="/images/modelos.jpeg"/><div><span className="tag">DO CASUAL AO PREMIUM</span><h2>Moda masculina completa</h2><p>Camisetas, calças, jaquetas, conjuntos, tênis, bonés, perfumes e acessórios.</p><a className="btn" href="https://instagram.com/a_r.outlet" target="_blank">Ver Instagram</a></div></section>
      <section id="loja" className="store"><div className="wrap store-grid"><div><span className="tag">VISITE A LOJA</span><h2>A.R Outlet</h2><p><strong>Endereço</strong><br/>Av. Getúlio Vargas, 1033 — Calmon Viana — Poá/SP</p><p><strong>Horário</strong><br/>Segunda a sábado: 09h às 18h<br/>Domingos e feriados: 09h às 14h</p><p><strong>WhatsApp:</strong> (11) 92208-2338<br/><strong>Instagram:</strong> @a_r.outlet</p></div><img src="/images/fachada.jpeg"/></div></section>
    </main><a className="whatsapp" href={wa} target="_blank">💬</a><footer><div className="wrap">A.R Outlet — Moda masculina do infantil ao adulto.</div></footer>
  </div>
}
