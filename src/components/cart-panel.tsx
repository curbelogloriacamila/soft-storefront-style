import { useState } from "react";
import { ArrowRight, Check, Copy, CreditCard, MessageCircle, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { AgendaImage } from "@/components/agenda-image";
import { cartSummary, moneyCents, orderMessage, whatsappOrderUrl, type CartProduct } from "@/lib/cart";
import { TRANSFER_ALIAS } from "@/lib/store-config";
import type { useCart } from "@/hooks/use-cart";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; cartState: ReturnType<typeof useCart>; catalog: readonly CartProduct[]; onBrowse: () => void };

export function CartPanel({ open, onOpenChange, cartState, catalog, onBrowse }: Props) {
  const { cart, ready, error, quantity, remove, complete } = cartState;
  const { lines, count, totalCents } = cartSummary(cart, catalog);
  const [transferOpen, setTransferOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [started, setStarted] = useState(false);
  const [finishPrompt, setFinishPrompt] = useState(false);
  const [completed, setCompleted] = useState(false);
  const confirmationUrl = whatsappOrderUrl(orderMessage(cart, catalog));
  const receiptUrl = whatsappOrderUrl(orderMessage(cart, catalog, true));

  async function copyAlias() {
    setCopied(false); setCopyError("");
    try { await navigator.clipboard.writeText(TRANSFER_ALIAS); setCopied(true); }
    catch { setCopyError("No pudimos copiar el alias. Seleccioná el texto y copialo manualmente."); }
  }
  function continueShopping() { onOpenChange(false); onBrowse(); }

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="campanella-cart">
    <span className="eyebrow">CAMPANELLA · TU SELECCIÓN</span>
    <SheetTitle className="cart-heading">Tu carrito <span className="cart-title-count">({count})</span></SheetTitle>
    <SheetDescription className="sr-only">Revisá tus productos y coordiná tu pedido por WhatsApp. El pago se verifica manualmente.</SheetDescription>
    {error && <p className="cart-notice" role="alert">{error}</p>}
    {!ready ? <p role="status">Recuperando tu carrito…</p> : !lines.length ? <div className="empty-cart"><ShoppingBag size={42} strokeWidth={1} />
      {completed ? <p role="status">Tu selección fue finalizada y el carrito quedó vacío.</p> : <><h3>Todavía no hay nada en tu carrito</h3><p>Descubrí tus favoritos y encontrá algo lindo para acompañar tus días</p></>}
      <Button onClick={continueShopping}>Seguir explorando <ArrowRight /></Button>
    </div> : <>
      <Button variant="link" className="cart-continue" onClick={continueShopping}>Seguir explorando <ArrowRight /></Button>
      <div className="cart-items">{lines.map(line => <div className="cart-row" key={`${line.id}:${line.color}`}>
        <AgendaImage image={line.product.image} name={line.product.name} cover={line.product.cover} />
        <div><h3>{line.product.name}</h3><p>Variante: {line.color}</p><p>Precio unitario: {moneyCents(line.unitCents)}</p>
          <div className="quantity"><Button variant="ghost" size="icon" aria-label={`Reducir ${line.product.name} ${line.color}`} disabled={line.quantity <= 1} onClick={() => quantity(line.id, line.color, line.quantity - 1)}><Minus /></Button><span aria-label="Cantidad">{line.quantity}</span><Button variant="ghost" size="icon" aria-label={`Aumentar ${line.product.name} ${line.color}`} onClick={() => quantity(line.id, line.color, line.quantity + 1)}><Plus /></Button></div>
          <p className="line-subtotal">Subtotal: <strong>{moneyCents(line.subtotalCents)}</strong></p>
        </div><Button variant="ghost" size="icon" aria-label={`Eliminar ${line.product.name} ${line.color}`} title="Eliminar producto" onClick={() => remove(line.id, line.color)}><X /></Button>
      </div>)}</div>
      <section className="cart-summary" aria-labelledby="order-summary-title"><h3 id="order-summary-title">Resumen de tu pedido</h3><div className="cart-total" aria-live="polite"><span>Total de tu compra</span><strong>{moneyCents(totalCents)}</strong></div><p className="cart-small">Importes en ARS. Envío o entrega a coordinar por WhatsApp; no incluidos en este total.</p><p className="cart-small">Los precios del catálogo todavía son ilustrativos. Confirmá el importe con Campanella antes de transferir.</p></section>
      <section className="transfer-section" aria-labelledby="payment-title"><h3 id="payment-title">Medio de pago</h3><p className="payment-method"><CreditCard size={18} /> Transferencia bancaria</p>
        <Button className="cart-action" onClick={() => setTransferOpen(value => !value)} aria-expanded={transferOpen} aria-controls="transfer-details">Pagar por transferencia <CreditCard /></Button>
        {transferOpen && <div id="transfer-details" className="transfer-details"><div className="alias-row"><div><span className="cart-small">Alias</span><strong className="transfer-alias">{TRANSFER_ALIAS}</strong></div><Button variant="outline" size="sm" onClick={copyAlias}>{copied ? <Check /> : <Copy />}{copied ? "Alias copiado" : "Copiar alias"}</Button></div>
          <p className="transfer-amount">Importe total: <strong>{moneyCents(totalCents)}</strong></p><p>Podés realizar la transferencia por el importe total de tu pedido. Una vez realizada, escribinos por WhatsApp para enviarnos el comprobante y coordinar la entrega o el envío</p><p className="cart-small">La recepción de la transferencia se verifica manualmente.</p>
          {copied && <p className="cart-feedback" role="status">Alias copiado al portapapeles.</p>}{copyError && <p role="alert" className="cart-notice">{copyError}</p>}
        </div>}
      </section>
      <div className="cart-order-actions">{confirmationUrl ? <Button asChild className="cart-action"><a href={confirmationUrl} target="_blank" rel="noopener noreferrer" onClick={() => { setStarted(true); setCompleted(false); }}>Confirmar pedido por WhatsApp <MessageCircle /></a></Button> : <><p role="alert" className="cart-notice">La confirmación por WhatsApp no está disponible por el momento. Conservamos tu carrito.</p><p className="cart-small">Configuración de la tienda: completá WHATSAPP_NUMBER en src/lib/store-config.ts con el número internacional, solo dígitos.</p></>}
        {receiptUrl && <Button asChild variant="outline" className="cart-action"><a href={receiptUrl} target="_blank" rel="noopener noreferrer" onClick={() => { setStarted(true); setCompleted(false); }}>Enviar comprobante por WhatsApp <MessageCircle /></a></Button>}
        <p className="cart-small">Podés revisar el mensaje antes de enviarlo y adjuntar el comprobante dentro de WhatsApp. Abrir el chat no confirma el pedido ni el pago.</p>
        {started && <div className="cart-completion"><p className="cart-small">Tu carrito se conserva mientras coordinás el pedido.</p>{finishPrompt ? <><p>¿Campanella ya confirmó tu pedido por WhatsApp?</p><p className="cart-small">Finalizar vacía el carrito. No registra el pedido como pagado.</p><div className="cart-completion-buttons"><Button onClick={() => { complete(); setStarted(false); setFinishPrompt(false); setCompleted(true); }}>Sí, finalizar y vaciar</Button><Button variant="outline" onClick={() => setFinishPrompt(false)}>Conservar carrito</Button></div></> : <Button variant="link" onClick={() => setFinishPrompt(true)}>Ya confirmé mi pedido</Button>}</div>}
      </div>
    </>}
  </SheetContent></Sheet>;
}
