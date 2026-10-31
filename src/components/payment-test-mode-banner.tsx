const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">Betalning är inte aktiverad på sajten ännu.</div>;
  }
  if (clientToken.startsWith("pk_test_")) {
    return <div className="w-full border-b border-accent/40 bg-accent/10 px-4 py-2 text-center text-sm">Testläge – inga riktiga pengar dras. Testkort: 4242 4242 4242 4242.</div>;
  }
  return null;
}
