import UserPermission from '@/components/admin/permission/UserPermission';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <UserPermission id={id} />;
}
