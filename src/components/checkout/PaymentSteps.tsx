import { cn } from '@/lib/utils';

type Step = { n: number; title: string; detail: string };

const cardSteps: Step[] = [
  { n: 1, title: 'Open Guardarian', detail: 'Use the button below to buy crypto with your card (new tab).' },
  { n: 2, title: 'Return here', detail: 'Switch to the Crypto tab and send the order total to our wallet.' },
  { n: 3, title: 'Paste TxID', detail: 'Copy your transaction hash into the field, then place your order.' },
];

export function PaymentStepsCard() {
  return (
    <ol className="mt-6 space-y-4">
      {cardSteps.map((step) => (
        <li key={step.n} className="flex gap-4">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary'
            )}
            aria-hidden
          >
            {step.n}
          </span>
          <div>
            <p className="font-medium text-foreground">{step.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const cryptoSteps: Step[] = [
  { n: 1, title: 'Pick a coin', detail: 'BTC, ETH, USDT, or USDC — send only that asset to the address shown.' },
  { n: 2, title: 'Send the total', detail: 'Match your cart total in USD; your wallet shows the equivalent.' },
  { n: 3, title: 'Confirm with TxID', detail: 'Paste your transaction hash and submit — we verify on-chain.' },
];

export function PaymentStepsCrypto() {
  return (
    <ol className="mt-6 space-y-3">
      {cryptoSteps.map((step) => (
        <li key={step.n} className="flex gap-3 rounded-lg border border-border/80 bg-background/50 p-3">
          <span className="text-xs font-bold text-primary" aria-hidden>
            {step.n}.
          </span>
          <div>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
