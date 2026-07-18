import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { Search } from 'lucide-react'
import { db, firebaseReady } from '../firebase'

const fallbackProducts = [
  {
    id: 'tenis-premium',
    image: '/images/tenis1.jpeg',
    category: 'CALÇADOS',
    name: 'Tênis premium',
    price: '',
    priceValue: 0,
    stock: 1,
  },
  {
    id: 'tenis-preto-branco',
    image: '/images/tenis2.jpeg',
    category: 'CALÇADOS',
    name: 'Tênis preto e branco',
    price: '',
    priceValue: 0,
    stock: 1,
  },
  {
    id: 'look-jaqueta-calca',
    image: '/images/look1.jpeg',
    category: 'LOOKS',
    name: 'Jaqueta + calça',
    price: '',
    priceValue: 0,
    stock: 1,
  },
  {
    id: 'camisetas-estampadas',
    image: '/images/camiseta1.jpeg',
    category: 'CAMISETAS',
    name: 'Camisetas estampadas',
    price: '',
    priceValue: 0,
    stock: 1,
  },
  {
    id: 'camiseta-esportiva',
    image: '/images/camiseta2.jpeg',
    category: 'ESPORTIVO',
    name: 'Camiseta esportiva',
    price: '',
    priceValue: 0,
    stock: 1,
  },
  {
    id: 'look-completo',
    image: '/images/look2.jpeg',
    category: 'LOOKS',
    name: 'Look completo',
    price: '',
    priceValue: 0,
    stock: 1,
  },
]

const whatsappNumber = '5511922082338'
const whatsappUrl = `https://wa.me/${whatsappNumber}`
const FALLBACK_IMAGE = '/images/camiseta1.jpeg'

function normalizeProduct(snapshotDoc) {
  const data = snapshotDoc.data()
  const priceValue = Number(data.preco ?? data.price ?? 0)

  return {
    id: snapshotDoc.id,
    image: data.imagem ?? data.image ?? FALLBACK_IMAGE,
    category: String(
      data.categoria ?? data.category ?? 'PRODUTO',
    ).toUpperCase(),
    name: data.nome ?? data.name ?? 'Produto',
    stock: Number(data.estoque ?? data.stock ?? 0),
    priceValue,
    price: Number.isFinite(priceValue)
      ? priceValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : '',
  }
}

function createProductMessage(product) {
  return encodeURIComponent(
    `Olá! Tenho interesse neste produto da A.R Outlet:

Produto: ${product.name}
Categoria: ${product.category}
Preço: ${product.price || 'Consultar'}
Disponibilidade: ${product.stock} em estoque

Pode me passar mais informações?`,
  )
}

export default function Store() {
  const [products, setProducts] = useState(fallbackProducts)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODOS')
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!firebaseReady || !db) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onSnapshot(
      collection(db, 'produtos'),
      snapshot => {
        const firebaseProducts = snapshot.docs
          .map(normalizeProduct)
          .filter(product => product.stock > 0)

        setProducts(
          firebaseProducts.length ? firebaseProducts : fallbackProducts,
        )

        setLoading(false)
      },
      error => {
        console.error('Erro ao carregar produtos:', error)
        setProducts(fallbackProducts)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const categories = useMemo(() => {
    const productCategories = products
      .map(product => product.category)
      .filter(Boolean)

    return ['TODOS', ...new Set(productCategories)]
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter(product => {
      const matchesCategory =
        selectedCategory === 'TODOS' ||
        product.category === selectedCategory

      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategory])

  return (
    <div className="store-page">
      <header className="topbar">
        <div className="wrap nav">
          <a className="logo" href="#inicio">
            <span>A.R</span> OUTLET
          </a>

          <nav>
            <a href="#promo">Promoção</a>
            <a href="#produtos">Produtos</a>
            <a href="#loja">Loja</a>
          </nav>

          <a
            className="btn small"
            href={`${whatsappUrl}?text=${encodeURIComponent(
              'Olá! Vim pelo site da A.R Outlet.',
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="shade" />

          <div className="wrap hero-content">
            <span className="tag">
              MODA MASCULINA • INFANTIL AO ADULTO
            </span>

            <h1>Camisetas multimarcas</h1>

            <p className="sub">Malha algodão 30.1</p>

            <div className="offer">
              4 por <strong>R$ 99,99</strong>
            </div>

            <p>
              Variedade de estampas, cores e tamanhos. Consulte a
              disponibilidade pelo WhatsApp.
            </p>

            <div className="actions">
              <a
                className="btn"
                href={`${whatsappUrl}?text=${encodeURIComponent(
                  'Olá! Quero aproveitar a promoção de 4 camisetas por R$ 99,99.',
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Quero essa promoção
              </a>

              <a className="btn ghost" href="#produtos">
                Ver produtos
              </a>
            </div>
          </div>
        </section>

        <section id="promo" className="promo">
          <div className="wrap promo-grid">
            <img
              src="/images/promo.jpeg"
              alt="Promoção de camisetas da A.R Outlet"
            />

            <div>
              <span className="tag">OFERTA ESPECIAL</span>

              <h2>1 camiseta por R$ 30,00</h2>

              <h3>ou 4 por R$ 99,99</h3>

              <p>
                Todas multimarcas, em malha algodão 30.1. Escolha seus
                modelos favoritos e monte seu combo.
              </p>

              <a
                className="btn"
                href={`${whatsappUrl}?text=${encodeURIComponent(
                  'Olá! Quero ver os modelos disponíveis da promoção de camisetas.',
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver modelos no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section id="produtos" className="products">
          <div className="wrap">
            <div className="section-title">
              <span className="tag">NOVIDADES</span>
              <h2>Produtos em destaque</h2>
            </div>

            <div className="product-tools">
              <label className="product-search">
                <Search size={19} />

                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Pesquisar produto..."
                  aria-label="Pesquisar produtos"
                />
              </label>

              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={
                      selectedCategory === category ? 'active' : ''
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <p className="products-message">Carregando produtos...</p>
            )}

            {!loading && filteredProducts.length === 0 && (
              <p className="products-message">
                Nenhum produto encontrado.
              </p>
            )}

            <div className="grid">
              {filteredProducts.map(product => (
                <article key={product.id || product.name}>
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={event => {
                      event.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />

                  <div>
                    <small>{product.category}</small>

                    <h3>{product.name}</h3>

                    {product.price && <strong>{product.price}</strong>}

                    <span className="stock-info">
                      {product.stock} disponível
                    </span>

                    <a
                      href={`${whatsappUrl}?text=${createProductMessage(
                        product,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Comprar pelo WhatsApp →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="models">
          <img
            src="/images/modelos.jpeg"
            alt="Modelos usando roupas da A.R Outlet"
          />

          <div>
            <span className="tag">DO CASUAL AO PREMIUM</span>

            <h2>Moda masculina completa</h2>

            <p>
              Camisetas, calças, jaquetas, conjuntos, tênis, bonés,
              perfumes e acessórios.
            </p>

            <a
              className="btn"
              href="https://instagram.com/a_r.outlet"
              target="_blank"
              rel="noreferrer"
            >
              Ver Instagram
            </a>
          </div>
        </section>

        <section id="loja" className="store">
          <div className="wrap store-grid">
            <div>
              <span className="tag">VISITE A LOJA</span>

              <h2>A.R Outlet</h2>

              <p>
                <strong>Endereço</strong>
                <br />
                Av. Getúlio Vargas, 1033 — Calmon Viana — Poá/SP
              </p>

              <p>
                <strong>Horário</strong>
                <br />
                Segunda a sábado: 09h às 18h
                <br />
                Domingos e feriados: 09h às 14h
              </p>

              <p>
                <strong>WhatsApp:</strong> (11) 92208-2338
                <br />
                <strong>Instagram:</strong> @a_r.outlet
              </p>
            </div>

            <img
              src="/images/fachada.jpeg"
              alt="Fachada da loja A.R Outlet"
            />
          </div>
        </section>
      </main>

      <a
        className="whatsapp"
        href={`${whatsappUrl}?text=${encodeURIComponent(
          'Olá! Vim pelo site da A.R Outlet.',
        )}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a A.R Outlet pelo WhatsApp"
      >
        💬
      </a>

      <footer>
        <div className="wrap">
          A.R Outlet — Moda masculina do infantil ao adulto.
        </div>
      </footer>
    </div>
  )
}