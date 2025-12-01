import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{ 
      display: "flex",
      gap: "20px",
      padding: "20px",
      background: "#2a5d2a",
      color: "white"
    }}>
      <Link href="/">Home</Link>
      <Link href="/sensores">Sensores</Link>
      <Link href="/atuadores">Atuadores</Link>
      <Link href="/indicadores">Indicadores</Link>
      <Link href="/contato">Contato/CV</Link>
    </nav>
  );
}