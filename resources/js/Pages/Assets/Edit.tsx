import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Import router
import { PageProps } from '@/types';
import AssetForm from './Partials/AssetForm';

interface AssetData {
  id: number;
  name: string;
  code: string;
  category_id: number;
  status_value: string; // Perhatikan ini dari Resource (value, bukan label)
  location: string;
  purchase_date: string;
  purchase_price: string;
  maintenance_interval_days: number;
  image_path: string;
}

interface EditProps extends PageProps {
  asset: { data: AssetData }; // Karena dibungkus resource
  categories: Array<{ id: number; name: string }>;
}

export default function AssetEdit({ auth, asset, categories }: EditProps) {
  const assetData = asset.data;

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT', // TRIK PENTING: Method spoofing agar bisa upload file saat edit
    name: assetData.name || '',
    code: assetData.code || '',
    category_id: assetData.category_id || '',
    status: assetData.status_value || 'active',
    location: assetData.location || '',
    purchase_date: assetData.purchase_date ? assetData.purchase_date.split('T')[0] : '', // Handle format tanggal
    purchase_price: assetData.purchase_price || '',
    maintenance_interval_days: assetData.maintenance_interval_days || '',
    image: null as File | null,
    image_path: assetData.image_path, // Untuk preview gambar lama
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    // Kita pakai POST ke route update, karena ada field _method: PUT
    // Ini cara standar Inertia menangani file upload pada method PUT/PATCH
    post(route('assets.update', assetData.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={[
        { label: 'Daftar Aset', href: route('assets.index') },
        { label: `Edit: ${assetData.code}` },
      ]}
    >
      <Head title="Edit Aset" />
      <AssetForm
        title={`Edit Aset: ${assetData.name}`}
        data={data}
        setData={setData}
        errors={errors}
        processing={processing}
        submit={submit}
        categories={categories}
        isEdit={true}
      />
    </AuthenticatedLayout>
  );
}
