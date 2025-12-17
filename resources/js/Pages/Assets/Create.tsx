import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AssetForm from './Partials/AssetForm';

interface CreateProps extends PageProps {
  categories: Array<{ id: number; name: string }>;
}

export default function AssetCreate({ auth, categories }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    code: '',
    category_id: '',
    status: 'active',
    location: '',
    purchase_date: '',
    purchase_price: '',
    maintenance_interval_days: '',
    image: null as File | null,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    // Gunakan POST untuk create
    post(route('assets.store'));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={[
        { label: 'Daftar Aset', href: route('assets.index') },
        { label: 'Tambah Baru' },
      ]}
    >
      <Head title="Tambah Aset Baru" />
      <AssetForm
        title="Tambah Aset Baru"
        data={data}
        setData={setData}
        errors={errors}
        processing={processing}
        submit={submit}
        categories={categories}
      />
    </AuthenticatedLayout>
  );
}
