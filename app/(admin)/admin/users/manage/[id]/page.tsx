import UserDetails from '@/components/admin/users/UserDetails';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <UserDetails id={id} />;
}
