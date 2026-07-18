export default function ProductDetails() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Página do Produto</h1>

      <p>Aqui aparecerão:</p>

      <ul>
        <li>📸 Fotos</li>
        <li>📦 Estoque</li>
        <li>💲 Preço</li>
        <li>📏 Tamanhos</li>
        <li>🎨 Cores</li>
      </ul>

      <button
        style={{
          background: "#e53935",
          color: "#fff",
          border: "none",
          padding: "15px 30px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Comprar pelo WhatsApp
      </button>
    </div>
  )
}