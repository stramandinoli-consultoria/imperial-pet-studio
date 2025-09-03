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
            <li>WhatsApp: (00) 00000-0000</li>
            <li>Email: contato@imperialpet.studio</li>
            <li>Endereço: Rua dos Pets, 123, Centro</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Horário</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Seg–Sex: 9h às 19h</li>
            <li>Sábado: 9h às 17h</li>
            <li>Domingo: fechado</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Imperial Pet Studio. Todos os direitos reservados.</div>
    </footer>
  );
};
