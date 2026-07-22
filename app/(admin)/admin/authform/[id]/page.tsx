import AuthView from '@/components/admin/authform/view/AuthView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <AuthView id={id} />;
}
