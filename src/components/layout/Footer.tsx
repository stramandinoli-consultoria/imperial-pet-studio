export const Footer = () => {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">Imperial Pet Studio</p>
          <p className="mt-2 text-sm text-muted-foreground">Elegância para o seu melhor amigo.</p>
        </div>
        <div>
          <p className="font-semibold">Contato</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>WhatsApp: (11) 94753-9384</li>
            <li>Email: imperialpetstudio@gmail.com</li>
            <li>CNPJ: 14.197.223/0001-03</li>
            <li>Rua Luiz Onofre de Amorim nº 50, Bloco "D"</li>
            <li>Parque Fernão Dias, Atibaia (SP) — CEP 12.948-009</li>
            <li>Outlet Fernão Dias</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Horário</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Seg–Sex: 9h às 21h</li>
            <li>Sábado: 9h às 21h</li>
            <li>Domingo: fechado</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Imperial Pet Studio. Todos os direitos reservados.</div>
    </footer>
  );
};
