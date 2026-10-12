import PaymentConfirmation from './PaymentConfirmation';

interface ConfirmationPageProps {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  return (
    <PaymentConfirmation reference={params.reference || params.trxref || ''} />
  );
}
